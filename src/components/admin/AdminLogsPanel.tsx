
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Activity, User, FileCheck, BookOpen, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
  admin_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export const AdminLogsPanel = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, typeFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          admin_profile:profiles!admin_logs_admin_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить логи",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.target_type === typeFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (targetType: string | null) => {
    switch (targetType) {
      case 'user': return <User className="h-4 w-4" />;
      case 'document': return <FileCheck className="h-4 w-4" />;
      case 'subject': return <BookOpen className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionBadge = (targetType: string | null) => {
    const typeConfig = {
      user: { label: 'Пользователь', variant: 'default' as const },
      document: { label: 'Документ', variant: 'secondary' as const },
      subject: { label: 'Предмет', variant: 'outline' as const },
      system: { label: 'Система', variant: 'destructive' as const }
    };

    const config = typeConfig[targetType as keyof typeof typeConfig] || { label: 'Прочее', variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Логи действий администраторов</h2>
        <p className="text-muted-foreground">
          История действий администраторов системы
        </p>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по действию или администратору..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Тип действия" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все действия</SelectItem>
                <SelectItem value="user">Пользователи</SelectItem>
                <SelectItem value="document">Документы</SelectItem>
                <SelectItem value="subject">Предметы</SelectItem>
                <SelectItem value="system">Система</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список логов */}
      <Card>
        <CardHeader>
          <CardTitle>История действий ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getActionIcon(log.target_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{log.action}</p>
                      {log.target_type && getActionBadge(log.target_type)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Администратор: {log.admin_profile?.first_name} {log.admin_profile?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: ru })}
                    </p>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                          Подробности
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Логи не найдены</h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
