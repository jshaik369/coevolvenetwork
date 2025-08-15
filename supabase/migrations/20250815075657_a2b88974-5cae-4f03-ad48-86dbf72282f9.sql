-- Fix analytics RLS policy to restrict users to their own data
DROP POLICY IF EXISTS "Allow reading analytics data" ON public.analytics;

CREATE POLICY "Allow reading analytics data" 
ON public.analytics 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_admin()
  )
);

-- Fix performance_metrics RLS policy to restrict users to their own data  
DROP POLICY IF EXISTS "Allow reading performance data" ON public.performance_metrics;

CREATE POLICY "Allow reading performance data" 
ON public.performance_metrics 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND is_admin()
);

-- Create a function to initialize the first admin user
CREATE OR REPLACE FUNCTION public.auto_initialize_first_admin()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- Only create admin if no admins exist
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-initialize first admin on user signup
DROP TRIGGER IF EXISTS auto_initialize_first_admin_trigger ON auth.users;
CREATE TRIGGER auto_initialize_first_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_initialize_first_admin();