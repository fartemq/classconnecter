
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Shield, 
  ShieldOff, 
  Trash2, 
  MessageSquare, 
  Search,
  Eye,
  Mail,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserProfileDialog } from "./UserProfileDialog";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
  city?: string;
  is_blocked: boolean;
  created_at: string;
}

export const UserManagementPanel = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояние для диалогов
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messageDialog, setMessageDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

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
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.includes(searchTerm)
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleBlockUser = async (userId: string, shouldBlock: boolean) => {
    try {
      const { error } = await supabase.rpc('block_user', {
        user_id_param: userId,
        block_status: shouldBlock
      });

      if (error) throw error;

      toast({
        title: shouldBlock ? "Пользователь заблокирован" : "Пользователь разблокирован",
        description: "Изменения применены успешно"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус пользователя",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_user_profile', {
        user_id_param: userId
      });

      if (error) throw error;

      toast({
        title: "Пользователь удален",
        description: "Пользователь помечен как удаленный"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пользователя",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageContent.trim()) return;

    setIsSendingMessage(true);
    
    try {
      const { error } = await supabase.rpc('send_admin_message', {
        recipient_id_param: selectedUser.id,
        subject_param: messageSubject.trim() || null,
        content_param: messageContent.trim()
      });

      if (error) throw error;

      toast({
        title: "Сообщение отправлено",
        description: `Сообщение отправлено пользователю ${selectedUser.first_name} ${selectedUser.last_name}`
      });

      setMessageDialog(false);
      setMessageSubject('');
      setMessageContent('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Администратор</Badge>;
      case 'tutor':
        return <Badge className="bg-blue-100 text-blue-800">Репетитор</Badge>;
      case 'student':
        return <Badge className="bg-green-100 text-green-800">Ученик</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    tutors: users.filter(u => u.role === 'tutor').length,
    blocked: users.filter(u => u.is_blocked).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление пользователями</h2>
        <div className="flex gap-4">
          <Badge variant="secondary">Всего: {userStats.total}</Badge>
          <Badge className="bg-green-100 text-green-800">Учеников: {userStats.students}</Badge>
          <Badge className="bg-blue-100 text-blue-800">Репетиторов: {userStats.tutors}</Badge>
          <Badge variant="destructive">Заблокированных: {userStats.blocked}</Badge>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по имени или ID пользователя..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Все роли</option>
                <option value="student">Ученики</option>
                <option value="tutor">Репетиторы</option>
                <option value="admin">Администраторы</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список пользователей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Пользователи ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка пользователей...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Пользователи не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {user.first_name} {user.last_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(user.role)}
                          {user.is_blocked && (
                            <Badge variant="destructive">Заблокирован</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          ID: {user.id} {user.city && `• ${user.city}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setProfileDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Профиль
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user);
                          setMessageDialog(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Сообщение
                      </Button>

                      <Button
                        size="sm"
                        variant={user.is_blocked ? "default" : "secondary"}
                        onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                      >
                        {user.is_blocked ? (
                          <>
                            <Shield className="w-4 h-4 mr-1" />
                            Разблокировать
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-4 h-4 mr-1" />
                            Заблокировать
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог отправки сообщения */}
      <Dialog open={messageDialog} onOpenChange={setMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Отправить сообщение пользователю
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Тема (необязательно):
                </label>
                <Input
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Введите тему сообщения"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Сообщение:
                </label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Введите ваше сообщение"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMessageDialog(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !messageContent.trim()}
                >
                  {isSendingMessage ? 'Отправка...' : 'Отправить'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра профиля */}
      <UserProfileDialog
        userId={selectedUser?.id || null}
        isOpen={profileDialog}
        onClose={() => {
          setProfileDialog(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};
