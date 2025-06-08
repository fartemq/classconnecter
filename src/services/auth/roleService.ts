
import { supabase } from "@/integrations/supabase/client";

// Кеш ролей в рамках сессии браузера
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

/**
 * Очистить кеш ролей
 */
export const clearRoleCache = () => {
  roleCache.clear();
  console.log("🧹 Role cache cleared");
};

/**
 * Получить роль пользователя с кешированием и таймаутом
 */
export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("🔍 Getting role for user:", userId);
    
    // Проверяем кеш
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("✅ Role found in cache:", cached.role);
      return cached.role;
    }

    // Специальный случай для админа
    if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
      const role = "admin";
      roleCache.set(userId, { role, timestamp: Date.now() });
      console.log("🛡️ Admin user detected");
      return role;
    }

    // Создаем Promise с таймаутом
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Role fetch timeout")), 5000);
    });

    // Используем только RPC функцию
    const rolePromise = supabase.rpc('get_current_user_role');

    const { data: role, error } = await Promise.race([rolePromise, timeoutPromise]);

    if (error) {
      console.error("❌ Error fetching role via RPC:", error);
      // Fallback к роли по умолчанию
      const defaultRole = "student";
      roleCache.set(userId, { role: defaultRole, timestamp: Date.now() });
      return defaultRole;
    }

    const finalRole = role || "student";
    
    // Кешируем результат
    roleCache.set(userId, { role: finalRole, timestamp: Date.now() });
    console.log("✅ Role fetched successfully:", finalRole);
    
    return finalRole;
  } catch (error) {
    console.error("❌ Exception in getUserRole:", error);
    // Возвращаем роль по умолчанию в случае ошибки
    const defaultRole = "student";
    roleCache.set(userId, { role: defaultRole, timestamp: Date.now() });
    return defaultRole;
  }
};

/**
 * Проверить заблокирован ли пользователь
 */
export const checkUserBlocked = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_blocked")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.log("⚠️ Could not check block status, assuming not blocked");
      return false;
    }

    return data.is_blocked || false;
  } catch (error) {
    console.error("❌ Error checking block status:", error);
    return false;
  }
};
