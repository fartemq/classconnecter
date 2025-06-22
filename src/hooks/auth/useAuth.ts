
import { useSimpleAuth } from "./SimpleAuthProvider";

// Адаптер для обратной совместимости
export const useAuth = () => {
  const simpleAuth = useSimpleAuth();
  
  return {
    ...simpleAuth,
    // Добавляем дополнительные поля если нужны для совместимости
    refreshUserData: simpleAuth.refreshUserData,
  };
};
