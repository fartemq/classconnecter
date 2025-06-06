
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader } from "@/components/ui/loader";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Специальная проверка для админ-панели
  if (allowedRoles.includes('admin') || allowedRoles.includes('moderator')) {
    // Только arsenalreally35@gmail.com может получить доступ к админ-панели
    if (user.email !== "arsenalreally35@gmail.com") {
      console.log("🚫 Access denied: Not the authorized admin email");
      return <Navigate to="/" replace />;
    }
  }

  // Проверка роли
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
