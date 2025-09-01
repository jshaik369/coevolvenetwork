import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import LoadingAnimation from './LoadingAnimation';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Check if user has admin role
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin');

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(roles && roles.length > 0);
        }
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          checkAdminStatus();
        } else {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            Admin privileges required to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;