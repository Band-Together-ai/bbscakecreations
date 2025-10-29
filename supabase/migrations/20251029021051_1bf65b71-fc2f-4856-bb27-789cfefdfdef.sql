-- Create sasha_training_notes table for admin-only training content
CREATE TABLE public.sasha_training_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('style', 'fact', 'do', 'dont', 'story')),
  content TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on sasha_training_notes
ALTER TABLE public.sasha_training_notes ENABLE ROW LEVEL SECURITY;

-- Only admins and collaborators can manage training notes
CREATE POLICY "Admins and collaborators can manage training notes"
ON public.sasha_training_notes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'collaborator'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_sasha_training_notes_updated_at
BEFORE UPDATE ON public.sasha_training_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_mutes table for chat moderation
CREATE TABLE public.user_mutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on user_mutes
ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;

-- Admins can manage all mutes
CREATE POLICY "Admins can manage user mutes"
ON public.user_mutes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own mute status
CREATE POLICY "Users can view own mute status"
ON public.user_mutes
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for efficient mute lookups
CREATE INDEX idx_user_mutes_user_id ON public.user_mutes(user_id);
CREATE INDEX idx_user_mutes_muted_until ON public.user_mutes(muted_until);