import { Outlet } from "react-router-dom";
import { NavigationBreadcrumb } from "@/components/NavigationBreadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to client projects if directly accessing /client
    if (window.location.pathname === '/client') {
      navigate('/client/projects');
    }
  }, [navigate]);

  return (
    <div className="space-y-4 p-6">
      <NavigationBreadcrumb />
      <div className="container mx-auto">
        <Outlet />
      </div>
    </div>
  );
} 