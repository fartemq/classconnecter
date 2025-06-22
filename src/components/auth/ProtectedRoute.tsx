
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
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </button>
          <button
            onClick={() => window.location.href = "/login"}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Войти в аккаунт
          </button>
        </div>
      }
    >
      {(() => {
        // Если пользователь не залогинен
        if (!user) {
          return <Navigate to={redirectTo} state={{ from: location }} replace />;
        }

        // Если нет информации о роли, но пользователь есть - разрешаем доступ
        if (!userRole) {
          return <Outlet />;
        }

        // Если есть ограничения по ролям
        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
          return <Navigate to="/" replace />;
        }

        return <Outlet />;
      })()}
    </LoadingManager>
  );
};

export default ProtectedRoute;
