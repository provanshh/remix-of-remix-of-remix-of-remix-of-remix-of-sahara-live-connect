import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "join_queue": {
        const { preferred_gender, preferred_country } = params;

        // Remove any existing queue entries for this user
        await supabase
          .from("match_queue")
          .delete()
          .eq("user_id", user.id);

        // Try to find a match
        let query = supabase
          .from("match_queue")
          .select("*")
          .eq("status", "waiting")
          .neq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1);

        // Filter by preferences (flexible matching)
        // If user wants a specific gender, look for entries that match OR have no preference
        if (preferred_gender) {
          query = query.or(`preferred_gender.eq.${preferred_gender},preferred_gender.is.null`);
        }
        if (preferred_country && preferred_country !== "XX") {
          query = query.or(`preferred_country.eq.${preferred_country},preferred_country.is.null,preferred_country.eq.XX`);
        }

        const { data: matches } = await query;

        if (matches && matches.length > 0) {
          const match = matches[0];

          // Create session
          const { data: session } = await supabase
            .from("active_sessions")
            .insert({ user_a: match.user_id, user_b: user.id })
            .select()
            .single();

          if (session) {
            // Update matched user's queue entry
            await supabase
              .from("match_queue")
              .update({
                status: "matched",
                matched_with: user.id,
                matched_at: new Date().toISOString(),
                session_id: session.id,
              })
              .eq("id", match.id);

            // Update presence for both users
            await supabase
              .from("online_presence")
              .upsert([
                { user_id: user.id, status: "in_chat", last_seen: new Date().toISOString() },
                { user_id: match.user_id, status: "in_chat", last_seen: new Date().toISOString() },
              ], { onConflict: "user_id" });

            // Get partner profile
            const { data: partnerProfile } = await supabase
              .from("profiles")
              .select("username, avatar_url")
              .eq("id", match.user_id)
              .single();

            return new Response(JSON.stringify({
              matched: true,
              session_id: session.id,
              partner_id: match.user_id,
              partner_username: partnerProfile?.username || "Anonymous",
              partner_avatar: partnerProfile?.avatar_url,
              partner_gender: match.preferred_gender,
              partner_country: match.preferred_country,
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // No match found — add to queue
        await supabase
          .from("match_queue")
          .insert({
            user_id: user.id,
            preferred_gender,
            preferred_country: preferred_country || null,
            status: "waiting",
          });

        // Update presence
        await supabase
          .from("online_presence")
          .upsert({
            user_id: user.id,
            status: "matching",
            last_seen: new Date().toISOString(),
          }, { onConflict: "user_id" });

        return new Response(JSON.stringify({ matched: false, queued: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "leave_queue": {
        await supabase.from("match_queue").delete().eq("user_id", user.id);
        await supabase
          .from("online_presence")
          .upsert({ user_id: user.id, status: "online", last_seen: new Date().toISOString() }, { onConflict: "user_id" });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "end_session": {
        const { session_id } = params;
        if (session_id) {
          await supabase
            .from("active_sessions")
            .update({ status: "ended", ended_at: new Date().toISOString() })
            .eq("id", session_id);
        }
        await supabase.from("match_queue").delete().eq("user_id", user.id);
        await supabase
          .from("online_presence")
          .upsert({ user_id: user.id, status: "online", last_seen: new Date().toISOString() }, { onConflict: "user_id" });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "heartbeat": {
        await supabase
          .from("online_presence")
          .upsert({ user_id: user.id, status: params.status || "online", last_seen: new Date().toISOString() }, { onConflict: "user_id" });

        const { data: count } = await supabase.rpc("get_online_count");

        return new Response(JSON.stringify({ online_count: count || 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
