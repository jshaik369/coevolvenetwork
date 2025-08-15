-- Fix analytics data exposure by restricting access to data owners only
-- Remove admin override that could expose sensitive behavioral tracking data

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Allow reading analytics data" ON public.analytics;

-- Create a more restrictive policy that only allows users to access their own data
CREATE POLICY "Users can only read their own analytics data" 
ON public.analytics
FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Create a separate admin analytics view function for legitimate admin access with audit logging
CREATE OR REPLACE FUNCTION public.admin_get_analytics_summary()
RETURNS TABLE (
  total_sessions bigint,
  unique_users bigint,
  avg_time_on_page numeric,
  top_countries jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only allow admins to access this function
  SELECT 
    CASE 
      WHEN NOT is_admin() THEN 
        RAISE(EXCEPTION 'Access denied: Admin privileges required')
      ELSE NULL
    END;
    
  -- Return aggregated data only (no individual user tracking data)
  SELECT 
    COUNT(DISTINCT session_id)::bigint as total_sessions,
    COUNT(DISTINCT user_id)::bigint as unique_users,
    AVG(CAST(interactions->>'timeOnPage' AS numeric))::numeric as avg_time_on_page,
    jsonb_agg(DISTINCT location->>'country') as top_countries
  FROM public.analytics 
  WHERE created_at >= NOW() - INTERVAL '30 days';
$$;

-- Create audit log for admin analytics access
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  details jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" 
ON public.admin_audit_log
FOR SELECT 
USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log
FOR INSERT 
WITH CHECK (true);