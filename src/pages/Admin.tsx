import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AdminSourceGenerator } from "@/components/AdminSourceGenerator";

const Admin = () => {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!profileLoading && profile?.role !== "admin") {
      navigate("/");
    }
  }, [user, loading, profile, profileLoading, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage AI source generation and system settings</p>
        </div>
        
        <AdminSourceGenerator />
      </div>
    </div>
  );
};

export default Admin;