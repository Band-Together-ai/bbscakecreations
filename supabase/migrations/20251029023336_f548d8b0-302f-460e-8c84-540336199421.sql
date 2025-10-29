-- Add user sessions table for tracking login/online status
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  session_end timestamp with time zone,
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add page views table for tracking browsing
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  page_path text NOT NULL,
  page_title text,
  time_spent_seconds integer DEFAULT 0,
  referrer text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add chat sessions table for tracking Sasha conversations
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamp with time zone NOT NULL DEFAULT now(),
  session_end timestamp with time zone,
  message_count integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  topics jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sessions"
  ON public.user_sessions FOR UPDATE
  USING (true);

-- RLS policies for page_views
CREATE POLICY "Users can view own page views"
  ON public.page_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- RLS policies for chat_sessions
CREATE POLICY "Users can view own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage chat sessions"
  ON public.chat_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to get user activity summary
CREATE OR REPLACE FUNCTION public.get_user_activity_summary(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'total_sessions', (SELECT COUNT(*) FROM user_sessions WHERE user_id = target_user_id),
    'total_time_minutes', (SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(session_end, now()) - session_start)) / 60), 0)::integer FROM user_sessions WHERE user_id = target_user_id),
    'last_active', (SELECT MAX(last_activity) FROM user_sessions WHERE user_id = target_user_id),
    'is_online', (SELECT EXISTS(SELECT 1 FROM user_sessions WHERE user_id = target_user_id AND session_end IS NULL AND last_activity > now() - interval '5 minutes')),
    'total_page_views', (SELECT COUNT(*) FROM page_views WHERE user_id = target_user_id),
    'total_chat_sessions', (SELECT COUNT(*) FROM chat_sessions WHERE user_id = target_user_id),
    'total_chat_messages', (SELECT COALESCE(SUM(message_count), 0) FROM chat_sessions WHERE user_id = target_user_id),
    'total_chat_time_minutes', (SELECT COALESCE(SUM(time_spent_seconds) / 60, 0)::integer FROM chat_sessions WHERE user_id = target_user_id),
    'support_clicks', (SELECT COUNT(*) FROM support_clicks WHERE user_id = target_user_id),
    'tool_clicks', (SELECT COUNT(*) FROM tool_clicks WHERE user_id = target_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON public.page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
