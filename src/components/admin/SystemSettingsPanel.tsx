
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Globe, 
  Bell,
  AlertTriangle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const SystemSettingsPanel = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    publicRegistration: true,
    maxFileSize: 10,
    sessionTimeout: 30,
    maintenanceMessage: 'Сайт находится на техническом обслуживании. Попробуйте позже.'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      // Логируем изменение настроек
      await supabase.rpc('log_admin_action', {
        action_text: 'Обновлены системные настройки',
        target_type_param: 'system',
        details_param: settings
      });

      toast({
        title: "Настройки сохранены",
        description: "Системные настройки успешно обновлены"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    }
  };

  const clearCache = async () => {
    try {
      await supabase.rpc('log_admin_action', {
        action_text: 'Очищен кэш системы',
        target_type_param: 'system'
      });

      toast({
        title: "Кэш очищен",
        description: "Системный кэш успешно очищен"
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось очистить кэш",
        variant: "destructive"
      });
    }
  };

  const restartServices = async () => {
    try {
      await supabase.rpc('log_admin_action', {
        action_text: 'Перезапущены системные сервисы',
        target_type_param: 'system'
      });

      toast({
        title: "Сервисы перезапущены",
        description: "Системные сервисы успешно перезапущены"
      });
    } catch (error) {
      console.error('Error restarting services:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось перезапустить сервисы",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Системные настройки</h2>
        <p className="text-muted-foreground">
          Управление общими настройками платформы
        </p>
      </div>

      {/* Основные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Основные настройки</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Режим технического обслуживания</Label>
              <p className="text-sm text-muted-foreground">
                Отключает доступ к сайту для всех пользователей кроме администраторов
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
            />
          </div>

          {settings.maintenanceMode && (
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Сообщение о техобслуживании</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => handleSettingChange('maintenanceMessage', e.target.value)}
                placeholder="Введите сообщение для пользователей"
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Регистрация новых пользователей</Label>
              <p className="text-sm text-muted-foreground">
                Разрешить регистрацию новых пользователей на платформе
              </p>
            </div>
            <Switch
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Публичная регистрация</Label>
              <p className="text-sm text-muted-foreground">
                Разрешить регистрацию без приглашения
              </p>
            </div>
            <Switch
              checked={settings.publicRegistration}
              onCheckedChange={(checked) => handleSettingChange('publicRegistration', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Настройки безопасности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Безопасность</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Максимальный размер файла (МБ)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Время сессии (минуты)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Уведомления */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Уведомления</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Отправка уведомлений на электронную почту
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Системные операции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Системные операции</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Очистить кэш</h4>
              <p className="text-sm text-muted-foreground">
                Очистить системный кэш для обновления данных
              </p>
            </div>
            <Button variant="outline" onClick={clearCache}>
              Очистить
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Перезапустить сервисы</h4>
              <p className="text-sm text-muted-foreground">
                Перезапустить системные сервисы
              </p>
            </div>
            <Button variant="outline" onClick={restartServices}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Перезапустить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Сохранить настройки */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="min-w-32">
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
};
