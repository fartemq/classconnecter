
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
        // Simple query to test connection
        const { data, error } = await supabase.from("subjects").select("count()", { count: "exact" }).limit(0);
        
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
      <Alert variant="destructive" className="max-w-md mx-auto my-2 opacity-90 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ошибка соединения с сервером. Пожалуйста, проверьте ваше интернет-соединение.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-2 opacity-70">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span className="text-sm text-gray-500">Подключено к серверу</span>
    </div>
  );
};
