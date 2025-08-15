-- Fix Function Search Path Mutable warning
-- Set search_path for security functions to prevent injection attacks

-- Update the is_admin function to have proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  -- For now, no one can read email signups until proper admin system is implemented
  -- This prevents the privacy leak while we implement proper authentication
  SELECT FALSE;
$$;

-- Also fix the existing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;