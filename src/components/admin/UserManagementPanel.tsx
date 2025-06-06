
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, UserX, Edit, Shield, Trash2, Ban, MessageSquare, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminMessageDialog } from "./AdminMessageDialog";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  role: string;
  created_at: string;
  is_blocked: boolean;
}

export const UserManagementPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Диалоги
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null
  });
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null
  });
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Логируем действие администратора
      await supabase.rpc('log_admin_action', {
        action_text: `Изменена роль пользователя на ${newRole}`,
        target_type_param: 'user',
        target_id_param: userId,
        details_param: { old_role: users.find(u => u.id === userId)?.role, new_role: newRole }
      });

      toast({
        title: "Роль обновлена",
        description: `Роль пользователя изменена на ${newRole}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('delete_user_profile', {
        user_id_param: userId
      });

      if (error) throw error;

      toast({
        title: "Пользователь удален",
        description: "Профиль пользователя был успешно удален"
      });

      fetchUsers();
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleBlockUser = async (userId: string, blockStatus: boolean) => {
    try {
      const { error } = await supabase.rpc('block_user', {
        user_id_param: userId,
        block_status: blockStatus
      });

      if (error) throw error;

      toast({
        title: blockStatus ? "Пользователь заблокирован" : "Пользователь разблокирован",
        description: blockStatus 
          ? "Пользователь был успешно заблокирован" 
          : "Пользователь был успешно разблокирован"
      });

      fetchUsers();
      setBlockDialog({ open: false, user: null });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус блокировки",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Админ', variant: 'destructive' as const },
      moderator: { label: 'Модератор', variant: 'secondary' as const },
      tutor: { label: 'Репетитор', variant: 'default' as const },
      student: { label: 'Студент', variant: 'outline' as const }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (user: UserProfile) => {
    if (user.is_blocked) {
      return <Badge variant="destructive" className="ml-2">Заблокирован</Badge>;
    }
    if (user.first_name === '[УДАЛЕН]') {
      return <Badge variant="secondary" className="ml-2">Удален</Badge>;
    }
    return <Badge variant="outline" className="ml-2 text-green-600 border-green-600">Активен</Badge>;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление пользователями</h2>
          <p className="text-muted-foreground">
            Всего пользователей: {users.length}
          </p>
        </div>
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
                  placeholder="Поиск по имени или городу..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Фильтр по роли" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="student">Студенты</SelectItem>
                <SelectItem value="tutor">Репетиторы</SelectItem>
                <SelectItem value="admin">Администраторы</SelectItem>
                <SelectItem value="moderator">Модераторы</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.city || "Город не указан"} • 
                      Регистрация: {format(new Date(user.created_at), 'dd.MM.yyyy', { locale: ru })}
                    </p>
                    <div className="flex items-center mt-1">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Изменение роли */}
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                  >
                    <SelectTrigger className="w-32">
                      <Shield className="h-4 w-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Студент</SelectItem>
                      <SelectItem value="tutor">Репетитор</SelectItem>
                      <SelectItem value="moderator">Модератор</SelectItem>
                      <SelectItem value="admin">Админ</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Сообщение от админа */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMessageDialog({ open: true, user })}
                    className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>

                  {/* Блокировка */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBlockDialog({ open: true, user })}
                    className={user.is_blocked ? "text-green-600 border-green-600 hover:bg-green-50" : "text-orange-600 border-orange-600 hover:bg-orange-50"}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>

                  {/* Удаление */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteDialog({ open: true, user })}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Пользователи не найдены</h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Подтвердите удаление
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить пользователя{" "}
              <strong>{deleteDialog.user?.first_name} {deleteDialog.user?.last_name}</strong>?
              <br />
              <br />
              Это действие нельзя отменить. Профиль будет помечен как удаленный.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.user && handleDeleteUser(deleteDialog.user.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения блокировки */}
      <AlertDialog open={blockDialog.open} onOpenChange={(open) => setBlockDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockDialog.user?.is_blocked ? "Разблокировать" : "Заблокировать"} пользователя
            </AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите {blockDialog.user?.is_blocked ? "разблокировать" : "заблокировать"} пользователя{" "}
              <strong>{blockDialog.user?.first_name} {blockDialog.user?.last_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blockDialog.user && handleBlockUser(blockDialog.user.id, !blockDialog.user.is_blocked)}
              className={blockDialog.user?.is_blocked ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}
            >
              {blockDialog.user?.is_blocked ? "Разблокировать" : "Заблокировать"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог сообщения от админа */}
      {messageDialog.user && (
        <AdminMessageDialog
          open={messageDialog.open}
          onOpenChange={(open) => setMessageDialog({ open, user: null })}
          recipientId={messageDialog.user.id}
          recipientName={`${messageDialog.user.first_name} ${messageDialog.user.last_name}`}
        />
      )}
    </div>
  );
};
