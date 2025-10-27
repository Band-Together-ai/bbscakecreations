-- Tip Jar Sessions (tracks $5 purchases for 30-min access)
CREATE TABLE public.tip_jar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  session_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_duration_minutes INTEGER NOT NULL DEFAULT 30,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  payment_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session Notes (conversation history during Tip Jar sessions)
CREATE TABLE public.session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.tip_jar_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promo Users (lifetime free paid-level access for early adopters)
CREATE TABLE public.promo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_type TEXT NOT NULL DEFAULT 'early_bird_lifetime',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(user_id)
);

-- User Activity Log (for admin analytics)
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_tip_jar_sessions_user_id ON public.tip_jar_sessions(user_id);
CREATE INDEX idx_tip_jar_sessions_is_active ON public.tip_jar_sessions(is_active);
CREATE INDEX idx_tip_jar_sessions_expires_at ON public.tip_jar_sessions(expires_at);
CREATE INDEX idx_session_notes_session_id ON public.session_notes(session_id);
CREATE INDEX idx_session_notes_user_id ON public.session_notes(user_id);
CREATE INDEX idx_promo_users_user_id ON public.promo_users(user_id);
CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_action_type ON public.user_activity_log(action_type);

-- Enable RLS
ALTER TABLE public.tip_jar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tip_jar_sessions
CREATE POLICY "Admins can view all tip jar sessions"
  ON public.tip_jar_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage tip jar sessions"
  ON public.tip_jar_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own tip jar sessions"
  ON public.tip_jar_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for session_notes
CREATE POLICY "Users can view own session notes"
  ON public.session_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all session notes"
  ON public.session_notes FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage all session notes"
  ON public.session_notes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert session notes"
  ON public.session_notes FOR INSERT
  WITH CHECK (true);

-- RLS Policies for promo_users
CREATE POLICY "Users can view own promo status"
  ON public.promo_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage promo users"
  ON public.promo_users FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON public.user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
  ON public.user_activity_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert activity logs"
  ON public.user_activity_log FOR INSERT
  WITH CHECK (true);