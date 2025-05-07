
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
        <p className="ml-4 text-gray-600">Авторизация...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect based on role
      if (userRole === 'student') {
        return <Navigate to="/profile/student" replace />;
      } else if (userRole === 'tutor') {
        return <Navigate to="/profile/tutor" replace />;
      } else {
        // If role is unknown, redirect to home
        return <Navigate to="/" replace />;
      }
    }
  }

  // If authenticated and role check passes, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
