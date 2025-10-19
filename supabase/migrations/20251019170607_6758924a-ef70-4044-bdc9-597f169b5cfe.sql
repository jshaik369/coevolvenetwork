-- Create business_cards table
CREATE TABLE public.business_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  unique_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  email TEXT,
  phone TEXT,
  profile_photo TEXT,
  bio TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_id_format CHECK (length(unique_id) = 12)
);

-- Enable RLS
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_cards
CREATE POLICY "Anyone can view active business cards"
ON public.business_cards
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own cards"
ON public.business_cards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
ON public.business_cards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
ON public.business_cards
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create business_card_analytics table
CREATE TABLE public.business_card_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  viewer_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  time_on_page INTEGER,
  interactions JSONB DEFAULT '{}'::jsonb,
  location JSONB,
  viewport JSONB,
  user_agent TEXT,
  device_info JSONB,
  click_events JSONB DEFAULT '[]'::jsonb,
  is_before_unload BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_card_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_card_analytics
CREATE POLICY "Anyone can insert analytics"
ON public.business_card_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Card owners can view their analytics"
ON public.business_card_analytics
FOR SELECT
TO authenticated
USING (
  card_id IN (
    SELECT id FROM public.business_cards WHERE user_id = auth.uid()
  )
);

-- Create updated_at trigger for business_cards
CREATE TRIGGER update_business_cards_updated_at
BEFORE UPDATE ON public.business_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate unique card IDs
CREATE OR REPLACE FUNCTION public.generate_card_unique_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;