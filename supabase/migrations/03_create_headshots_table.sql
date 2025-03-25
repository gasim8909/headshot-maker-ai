-- Create the user_headshots table
CREATE TABLE public.user_headshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  style TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX user_headshots_user_id_idx ON public.user_headshots(user_id);
CREATE INDEX user_headshots_created_at_idx ON public.user_headshots(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_headshots ENABLE ROW LEVEL SECURITY;

-- Create secure policies
CREATE POLICY "Users can view their own headshots"
  ON public.user_headshots
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own headshots"
  ON public.user_headshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Add a policy for deletion if you want users to be able to delete their headshots
CREATE POLICY "Users can delete their own headshots"
  ON public.user_headshots
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add a function to track storage space used by user
-- This function could be expanded to implement storage limits
CREATE OR REPLACE FUNCTION public.track_headshot_storage()
RETURNS TRIGGER AS $$
BEGIN
  -- Could update a user storage stats table here
  -- e.g. INSERT INTO user_storage_stats (user_id, used_storage) VALUES (NEW.user_id, ...)
  -- ON CONFLICT (user_id) DO UPDATE SET used_storage = ...
  
  -- Also deduct a credit from the user's subscription
  UPDATE public.user_subscriptions
  SET 
    credits_remaining = GREATEST(credits_remaining - 1, 0),
    used_generations = used_generations + 1,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to track headshot storage
CREATE TRIGGER track_headshot_storage_trigger
  AFTER INSERT ON public.user_headshots
  FOR EACH ROW
  EXECUTE PROCEDURE public.track_headshot_storage();
