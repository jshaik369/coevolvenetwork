-- Create analytics table for user behavior data
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  viewport JSONB,
  location JSONB,
  interactions JSONB,
  collaboration JSONB,
  cultural_data JSONB,
  is_before_unload BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all inserts (public analytics collection)
CREATE POLICY "Allow analytics data collection" 
ON public.analytics 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading analytics (admin/authenticated users only)
CREATE POLICY "Allow reading analytics data" 
ON public.analytics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_analytics_session_id ON public.analytics(session_id);
CREATE INDEX idx_analytics_timestamp ON public.analytics(timestamp);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);