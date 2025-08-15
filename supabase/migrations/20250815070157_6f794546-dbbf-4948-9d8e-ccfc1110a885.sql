-- Fix critical security issue: Remove overly permissive email_signups RLS policy
-- This policy currently allows ALL authenticated users to view customer emails

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view email signups" ON public.email_signups;

-- Create a restrictive policy that only allows admins to view email signups
-- First, we need a function to check if user is admin (will be used when auth is implemented)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  -- For now, no one can read email signups until proper admin system is implemented
  -- This prevents the privacy leak while we implement proper authentication
  SELECT FALSE;
$$;

-- Create new restrictive policy for email signups
CREATE POLICY "Only admins can view email signups"
ON public.email_signups
FOR SELECT
USING (public.is_admin());

-- Email signups should remain insertable by anyone (for the signup form to work)
-- The existing insert policy is fine: "Anyone can insert email signups"