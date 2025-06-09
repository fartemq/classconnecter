
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, VideoOff, Users, Calendar, ExternalLink, Loader2, Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GoogleMeetIntegrationProps {
  lessonId: string;
}

interface MeetSession {
  id: string;
  meet_link: string;
  meeting_id: string;
  status: string;
  organizer_id: string;
  created_at: string;
}

export const GoogleMeetIntegration = ({ lessonId }: GoogleMeetIntegrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meetSession, setMeetSession] = useState<MeetSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMeetLink, setManualMeetLink] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkGoogleAuth();
    loadExistingMeeting();
  }, [lessonId]);

  const checkGoogleAuth = async () => {
    try {
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .eq('provider', 'google')
        .maybeSingle();

      setIsAuthorized(!!tokens && new Date(tokens.expires_at) > new Date());
    } catch (error) {
      console.error('Error checking Google auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingMeeting = async () => {
    try {
      const { data: session } = await supabase
        .from('google_meet_sessions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('status', 'active')
        .maybeSingle();

      if (session) {
        setMeetSession(session);
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
    }
  };

  const authorizeGoogle = async () => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'authorize' }
      });

      if (error) throw error;

      if (data?.auth_url) {
        const popup = window.open(data.auth_url, '_blank', 'width=500,height=600');
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'google_auth_success') {
            handleAuthCallback(event.data.code, event.data.state);
            window.removeEventListener('message', handleMessage);
            if (popup) popup.close();
          } else if (event.data.type === 'google_auth_error') {
            const errorMessage = event.data.error === 'access_denied' 
              ? "Доступ заблокирован. Попробуйте добавить встречу вручную или обратитесь к администратору."
              : `Ошибка авторизации: ${event.data.error}`;
            
            setAuthError(errorMessage);
            toast({
              title: "Ошибка авторизации Google",
              description: errorMessage,
              variant: "destructive"
            });
            window.removeEventListener('message', handleMessage);
            if (popup) popup.close();
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error authorizing Google:', error);
      const errorMessage = "Не удалось подключить Google аккаунт. Попробуйте добавить встречу вручную.";
      setAuthError(errorMessage);
      toast({
        title: "Ошибка авторизации",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'callback', code, state }
      });

      if (error) throw error;

      if (data?.success) {
        setIsAuthorized(true);
        setAuthError(null);
        toast({
          title: "Авторизация успешна",
          description: "Google аккаунт подключен"
        });
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      setAuthError("Не удалось завершить авторизацию");
      toast({
        title: "Ошибка",
        description: "Не удалось завершить авторизацию",
        variant: "destructive"
      });
    }
  };

  const createMeeting = async () => {
    if (!isAuthorized) {
      toast({
        title: "Требуется авторизация",
        description: "Сначала подключите Google аккаунт",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-meet', {
        body: {
          action: 'create',
          lessonId,
          title: `Урок ${lessonId}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }
      });

      if (error) throw error;

      setMeetSession(data.session);
      toast({
        title: "Встреча создана",
        description: "Google Meet готов к использованию"
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать встречу. Попробуйте добавить ссылку вручную.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const addManualMeeting = async () => {
    if (!manualMeetLink.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ссылку на Google Meet",
        variant: "destructive"
      });
      return;
    }

    try {
      const meetingId = manualMeetLink.split('/').pop() || `manual-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('google_meet_sessions')
        .insert({
          lesson_id: lessonId,
          meet_link: manualMeetLink,
          meeting_id: meetingId,
          organizer_id: user?.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setMeetSession(data);
      setShowManualEntry(false);
      setManualMeetLink("");
      toast({
        title: "Встреча добавлена",
        description: "Ссылка на Google Meet сохранена"
      });
    } catch (error) {
      console.error('Error adding manual meeting:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить встречу",
        variant: "destructive"
      });
    }
  };

  const joinMeeting = () => {
    if (meetSession?.meet_link) {
      window.open(meetSession.meet_link, '_blank');
    }
  };

  const endMeeting = async () => {
    try {
      await supabase
        .from('google_meet_sessions')
        .update({ status: 'ended' })
        .eq('id', meetSession?.id);

      setMeetSession(null);
      toast({
        title: "Встреча завершена",
        description: "Google Meet сессия закрыта"
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <span>Google Meet</span>
          {meetSession && (
            <Badge variant="default" className="bg-green-500">
              Активна
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {authError}
            </AlertDescription>
          </Alert>
        )}

        {!isAuthorized && !meetSession ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Подключите Google аккаунт для автоматического создания встреч
            </p>
            <div className="space-y-2">
              <Button onClick={authorizeGoogle} className="w-full">
                <Video className="h-4 w-4 mr-2" />
                Подключить Google
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowManualEntry(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить ссылку вручную
              </Button>
            </div>
          </div>
        ) : !meetSession ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Создайте Google Meet для начала урока
            </p>
            <div className="space-y-2">
              <Button 
                onClick={createMeeting} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Video className="h-4 w-4 mr-2" />
                )}
                Создать встречу
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowManualEntry(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить ссылку вручную
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">
                  Встреча готова
                </span>
                <Badge variant="outline" className="text-green-600">
                  ID: {meetSession.meeting_id}
                </Badge>
              </div>
              <p className="text-sm text-green-700">
                Нажмите "Присоединиться", чтобы начать урок
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={joinMeeting} className="bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Присоединиться
              </Button>
              <Button 
                onClick={endMeeting} 
                variant="destructive"
              >
                <VideoOff className="h-4 w-4 mr-2" />
                Завершить
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(meetSession.meet_link)}
                className="text-sm"
              >
                Скопировать ссылку
              </Button>
            </div>
          </div>
        )}

        {showManualEntry && (
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <Label htmlFor="manual-meet-link">Ссылка на Google Meet</Label>
            <Input
              id="manual-meet-link"
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={manualMeetLink}
              onChange={(e) => setManualMeetLink(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={addManualMeeting} className="flex-1">
                Добавить
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowManualEntry(false);
                  setManualMeetLink("");
                }}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Урок #{lessonId.slice(-8)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>2 участника</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
