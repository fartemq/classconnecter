
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3, ExternalLink, Users, Palette, Loader2, RefreshCw, Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MiroIntegrationProps {
  lessonId: string;
}

interface MiroBoard {
  id: string;
  board_id: string;
  board_url: string;
  status: string;
  creator_id: string;
  created_at: string;
}

export const MiroIntegration = ({ lessonId }: MiroIntegrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [miroBoard, setMiroBoard] = useState<MiroBoard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBoardLink, setManualBoardLink] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkMiroAuth();
    loadExistingBoard();
  }, [lessonId]);

  const checkMiroAuth = async () => {
    try {
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .eq('provider', 'miro')
        .maybeSingle();

      setIsAuthorized(!!tokens && new Date(tokens.expires_at) > new Date());
    } catch (error) {
      console.error('Error checking Miro auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingBoard = async () => {
    try {
      const { data: board } = await supabase
        .from('miro_boards')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('status', 'active')
        .maybeSingle();

      if (board) {
        setMiroBoard(board);
      }
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  const authorizeMiro = async () => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.functions.invoke('miro-oauth', {
        body: { action: 'authorize' }
      });

      if (error) throw error;

      if (data?.auth_url) {
        const popup = window.open(data.auth_url, '_blank', 'width=500,height=600');
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'miro_auth_success') {
            handleAuthCallback(event.data.code, event.data.state);
            window.removeEventListener('message', handleMessage);
            if (popup) popup.close();
          } else if (event.data.type === 'miro_auth_error') {
            const errorMessage = event.data.error.includes('redirect_uri') 
              ? "Ошибка настройки приложения. Попробуйте добавить доску вручную."
              : `Ошибка авторизации: ${event.data.error}`;
            
            setAuthError(errorMessage);
            toast({
              title: "Ошибка авторизации Miro",
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
      console.error('Error authorizing Miro:', error);
      const errorMessage = "Не удалось подключить Miro аккаунт. Попробуйте добавить доску вручную.";
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
      const { data, error } = await supabase.functions.invoke('miro-oauth', {
        body: { action: 'callback', code, state }
      });

      if (error) throw error;

      if (data?.success) {
        setIsAuthorized(true);
        setAuthError(null);
        toast({
          title: "Авторизация успешна",
          description: "Miro аккаунт подключен"
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

  const createBoard = async () => {
    if (!isAuthorized) {
      toast({
        title: "Требуется авторизация",
        description: "Сначала подключите Miro аккаунт",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('miro-board', {
        body: {
          action: 'create',
          lessonId,
          name: `Урок ${lessonId}`,
          description: 'Интерактивная доска для урока'
        }
      });

      if (error) throw error;

      setMiroBoard(data.board);
      toast({
        title: "Доска создана",
        description: "Miro доска готова к использованию"
      });
    } catch (error) {
      console.error('Error creating board:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать доску. Попробуйте добавить ссылку вручную.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const addManualBoard = async () => {
    if (!manualBoardLink.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ссылку на Miro доску",
        variant: "destructive"
      });
      return;
    }

    try {
      const boardId = manualBoardLink.split('/').pop() || `manual-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('miro_boards')
        .insert({
          lesson_id: lessonId,
          board_url: manualBoardLink,
          board_id: boardId,
          creator_id: user?.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setMiroBoard(data);
      setShowManualEntry(false);
      setManualBoardLink("");
      toast({
        title: "Доска добавлена",
        description: "Ссылка на Miro доску сохранена"
      });
    } catch (error) {
      console.error('Error adding manual board:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить доску",
        variant: "destructive"
      });
    }
  };

  const openBoard = () => {
    if (miroBoard?.board_url) {
      window.open(miroBoard.board_url, '_blank');
    }
  };

  const duplicateBoard = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('miro-board', {
        body: {
          action: 'duplicate',
          boardId: miroBoard?.board_id,
          lessonId
        }
      });

      if (error) throw error;

      toast({
        title: "Доска скопирована",
        description: "Создана копия доски для следующего урока"
      });
    } catch (error) {
      console.error('Error duplicating board:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать доску",
        variant: "destructive"
      });
    }
  };

  const archiveBoard = async () => {
    try {
      await supabase
        .from('miro_boards')
        .update({ status: 'archived' })
        .eq('id', miroBoard?.id);

      setMiroBoard(null);
      toast({
        title: "Доска архивирована",
        description: "Miro доска сохранена в архиве"
      });
    } catch (error) {
      console.error('Error archiving board:', error);
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
          <Edit3 className="h-5 w-5" />
          <span>Miro Доска</span>
          {miroBoard && (
            <Badge variant="default" className="bg-purple-500">
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

        {!isAuthorized && !miroBoard ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Подключите Miro аккаунт для автоматического создания досок
            </p>
            <div className="space-y-2">
              <Button onClick={authorizeMiro} className="w-full">
                <Palette className="h-4 w-4 mr-2" />
                Подключить Miro
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
        ) : !miroBoard ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Создайте Miro доску для совместной работы
            </p>
            <div className="space-y-2">
              <Button 
                onClick={createBoard} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Edit3 className="h-4 w-4 mr-2" />
                )}
                Создать доску
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
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">
                  Доска готова
                </span>
                <Badge variant="outline" className="text-purple-600">
                  ID: {miroBoard.board_id.slice(-8)}
                </Badge>
              </div>
              <p className="text-sm text-purple-700">
                Откройте доску для совместной работы
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={openBoard} className="bg-purple-600 hover:bg-purple-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Открыть доску
              </Button>
              <Button 
                onClick={duplicateBoard} 
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Копировать
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(miroBoard.board_url)}
                className="text-sm mr-2"
              >
                Скопировать ссылку
              </Button>
              <Button
                variant="ghost"
                onClick={archiveBoard}
                className="text-sm text-gray-500"
              >
                Архивировать
              </Button>
            </div>
          </div>
        )}

        {showManualEntry && (
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <Label htmlFor="manual-board-link">Ссылка на Miro доску</Label>
            <Input
              id="manual-board-link"
              type="url"
              placeholder="https://miro.com/app/board/xxxxx"
              value={manualBoardLink}
              onChange={(e) => setManualBoardLink(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={addManualBoard} className="flex-1">
                Добавить
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowManualEntry(false);
                  setManualBoardLink("");
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
              <Palette className="h-4 w-4" />
              <span>Интерактивная доска</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Совместная работа</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
