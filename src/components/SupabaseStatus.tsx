
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SupabaseStatus = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if subjects table exists - if not, handle gracefully
        const { error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);
          
        if (error) {
          console.error("Supabase connection error:", error);
          setStatus("error");
        } else {
          setStatus("connected");
        }
      } catch (err) {
        console.error("Error checking Supabase connection:", err);
        setStatus("error");
      }
    };
    
    checkConnection();
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 opacity-70">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Проверка соединения...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 opacity-70">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">Ошибка подключения к серверу</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 opacity-70">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span className="text-sm text-gray-500">Подключено к серверу</span>
    </div>
  );
};
