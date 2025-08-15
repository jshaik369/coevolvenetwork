-- Create performance metrics table for tracking page performance
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page_load JSONB,
  navigation JSONB,
  resources JSONB,
  errors JSONB,
  vitals JSONB,
  is_before_unload BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for performance metrics
CREATE POLICY "Allow performance data collection" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow reading performance data" 
ON public.performance_metrics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_performance_metrics_session_id ON public.performance_metrics(session_id);
CREATE INDEX idx_performance_metrics_timestamp ON public.performance_metrics(timestamp DESC);