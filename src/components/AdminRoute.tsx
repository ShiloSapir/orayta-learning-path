import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminRoute - useEffect triggered');
    console.log('Loading:', loading, 'User:', !!user, 'ProfileLoading:', profileLoading, 'Profile role:', profile?.role);
    
    if (!loading && !user) {
      console.log('AdminRoute - No user, redirecting to /auth');
      navigate("/auth");
    } else if (!loading && !profileLoading && user && profile && profile?.role !== "admin") {
      console.log('AdminRoute - User is not admin, redirecting to /');
      navigate("/");
    }
  }, [user, loading, profile, profileLoading, navigate]);

  if (loading || profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
};
