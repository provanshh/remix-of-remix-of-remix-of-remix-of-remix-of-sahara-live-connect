
-- Match queue: users waiting to be paired
CREATE TABLE public.match_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_gender TEXT, -- 'boy', 'girl', or null for any
  preferred_country TEXT, -- country code or null for any
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, matched, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  matched_at TIMESTAMP WITH TIME ZONE,
  matched_with UUID,
  session_id UUID
);

-- Active chat sessions between two matched users
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, ended
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Online presence tracking
CREATE TABLE public.online_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'online', -- online, matching, in_chat
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.match_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_presence ENABLE ROW LEVEL SECURITY;

-- Match queue policies
CREATE POLICY "Users can insert own queue entry" ON public.match_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own queue entry" ON public.match_queue FOR SELECT USING (auth.uid() = user_id OR auth.uid() = matched_with);
CREATE POLICY "Users can update own queue entry" ON public.match_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own queue entry" ON public.match_queue FOR DELETE USING (auth.uid() = user_id);

-- Active sessions policies
CREATE POLICY "Users can view own sessions" ON public.active_sessions FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users can insert sessions" ON public.active_sessions FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users can update own sessions" ON public.active_sessions FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Presence policies
CREATE POLICY "Anyone can view presence" ON public.online_presence FOR SELECT USING (true);
CREATE POLICY "Users can manage own presence" ON public.online_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presence" ON public.online_presence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own presence" ON public.online_presence FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_presence;

-- Index for fast queue lookups
CREATE INDEX idx_match_queue_status ON public.match_queue (status, preferred_gender, preferred_country);
CREATE INDEX idx_active_sessions_status ON public.active_sessions (status);
CREATE INDEX idx_online_presence_status ON public.online_presence (status);

-- Function to get online count
CREATE OR REPLACE FUNCTION public.get_online_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM online_presence WHERE last_seen > now() - interval '5 minutes';
$$;
