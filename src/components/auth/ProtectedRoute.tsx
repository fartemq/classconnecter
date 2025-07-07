import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { LoadingManager } from "@/components/loading/LoadingManager";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectTo = "/login"
}) => {
  const { user, userRole, isLoading, isError } = useSimpleAuth();
  const location = useLocation();

  return (
    <LoadingManager 
      isLoading={isLoading} 
      isError={isError}
      fallbackContent={
        <div className="space-y-4">
          <button
            onClick={() => window.location.href = "/"}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Перейти на главную
          </button>
        </div>
      }
    >
      {user ? (
        // If no role restriction, allow access
        allowedRoles.length === 0 || 
        // If user has required role, allow access
        (userRole && allowedRoles.includes(userRole)) ? (
          <Outlet />
        ) : (
          // User doesn't have required role
          <Navigate 
            to={userRole === "admin" ? "/admin" : `/profile/${userRole}`} 
            replace 
          />
        )
      ) : (
        // User not authenticated
        <Navigate 
          to={redirectTo}
          state={{ from: location }}
          replace 
        />
      )}
    </LoadingManager>
  );
};

export default ProtectedRoute;