-- Create email signups table for collecting user emails
CREATE TABLE public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for email signups (public insert, admin read)
CREATE POLICY "Anyone can insert email signups" 
ON public.email_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can view email signups" 
ON public.email_signups 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_email_signups_updated_at
  BEFORE UPDATE ON public.email_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for email lookups
CREATE INDEX idx_email_signups_email ON public.email_signups(email);
CREATE INDEX idx_email_signups_created_at ON public.email_signups(created_at DESC);