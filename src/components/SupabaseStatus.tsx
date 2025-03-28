
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Supabase:</span>
      {status === "checking" && <Badge variant="outline">Checking...</Badge>}
      {status === "connected" && <Badge variant="success" className="bg-green-500 text-white">Connected</Badge>}
      {status === "error" && <Badge variant="destructive">Connection Error</Badge>}
    </div>
  );
};
