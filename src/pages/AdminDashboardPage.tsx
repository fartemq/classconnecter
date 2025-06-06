
import React from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/auth/useAuth";
import { Navigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";

export const AdminDashboardPage = () => {
  const { user, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Двойная проверка: не администратор - редирект
  if (!user || (userRole !== 'admin' && userRole !== 'moderator')) {
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
};
