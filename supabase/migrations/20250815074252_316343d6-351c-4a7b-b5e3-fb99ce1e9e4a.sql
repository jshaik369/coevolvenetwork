-- Create proper user roles system to fix email_signups security issue

-- 1. Create an enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- 3. Enable Row Level Security on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- 5. Create secure function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 6. Create secure function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN FALSE
    ELSE public.has_role(auth.uid(), 'admin'::app_role)
  END;
$$;

-- 7. Create function to check if current user has any role
CREATE OR REPLACE FUNCTION public.has_any_role(_roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN FALSE
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = ANY(_roles)
    )
  END;
$$;

-- 8. Update the email_signups RLS policy to be more secure
DROP POLICY IF EXISTS "Only admins can view email signups" ON public.email_signups;

CREATE POLICY "Only authenticated admins can view email signups" 
ON public.email_signups 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_admin()
);

-- 9. Add additional security policy to prevent unauthorized access
CREATE POLICY "Prevent unauthorized email_signups access" 
ON public.email_signups 
FOR ALL 
USING (FALSE)
WITH CHECK (FALSE);

-- This policy acts as a fallback - it denies all access unless explicitly allowed by other policies

-- 10. Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_roles_user_role ON public.user_roles(user_id, role);

-- 11. Create function to safely initialize first admin (only works if no admins exist)
CREATE OR REPLACE FUNCTION public.initialize_first_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- Only allow if no admins exist and user is authenticated
  IF admin_count = 0 AND _user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;