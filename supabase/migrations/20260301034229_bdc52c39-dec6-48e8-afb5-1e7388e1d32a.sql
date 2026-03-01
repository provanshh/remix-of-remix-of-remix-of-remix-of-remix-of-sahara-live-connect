
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User_' || LEFT(NEW.id::text, 6)),
    NULL
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Coin wallets
CREATE TABLE public.coin_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coin_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON public.coin_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.coin_wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create wallet on signup (bonus 100 coins)
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.coin_wallets (user_id, balance)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wallet();

-- Chat history
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_username TEXT NOT NULL,
  partner_avatar_url TEXT,
  chat_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat history" ON public.chat_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own chat history" ON public.chat_history FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Reconnect requests
CREATE TABLE public.reconnect_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_history_id UUID NOT NULL REFERENCES public.chat_history(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reconnect_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reconnect requests" ON public.reconnect_requests FOR SELECT TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create reconnect requests" ON public.reconnect_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Recipients can update reconnect requests" ON public.reconnect_requests FOR UPDATE TO authenticated USING (auth.uid() = to_user_id);

-- Unlock chat function (deducts coins server-side)
CREATE OR REPLACE FUNCTION public.unlock_chat(p_chat_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance INTEGER;
  v_partner_id UUID;
BEGIN
  -- Get current balance
  SELECT balance INTO v_balance FROM coin_wallets WHERE user_id = v_user_id;
  IF v_balance IS NULL OR v_balance < 49 THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_coins', 'balance', COALESCE(v_balance, 0));
  END IF;

  -- Verify ownership
  SELECT partner_id INTO v_partner_id FROM chat_history WHERE id = p_chat_id AND user_id = v_user_id AND is_unlocked = false;
  IF v_partner_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_chat');
  END IF;

  -- Deduct coins
  UPDATE coin_wallets SET balance = balance - 49, updated_at = now() WHERE user_id = v_user_id;

  -- Unlock chat
  UPDATE chat_history SET is_unlocked = true WHERE id = p_chat_id;

  -- Create reconnect request
  INSERT INTO reconnect_requests (from_user_id, to_user_id, chat_history_id) VALUES (v_user_id, v_partner_id, p_chat_id);

  RETURN jsonb_build_object('success', true, 'new_balance', v_balance - 49);
END;
$$;

-- Timestamp update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coin_wallets_updated_at BEFORE UPDATE ON public.coin_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reconnect_requests_updated_at BEFORE UPDATE ON public.reconnect_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
