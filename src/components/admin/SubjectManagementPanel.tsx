
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export const SubjectManagementPanel = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить предметы",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(formData)
          .eq('id', editingSubject.id);

        if (error) throw error;

        await supabase.rpc('log_admin_action', {
          action_text: `Обновлен предмет: ${formData.name}`,
          target_type_param: 'subject',
          target_id_param: editingSubject.id
        });

        toast({
          title: "Предмет обновлен",
          description: "Изменения сохранены"
        });
      } else {
        const { data, error } = await supabase
          .from('subjects')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;

        await supabase.rpc('log_admin_action', {
          action_text: `Создан новый предмет: ${formData.name}`,
          target_type_param: 'subject',
          target_id_param: data.id
        });

        toast({
          title: "Предмет создан",
          description: "Новый предмет добавлен"
        });
      }

      setIsDialogOpen(false);
      setEditingSubject(null);
      setFormData({ name: '', description: '', is_active: true });
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить предмет",
        variant: "destructive"
      });
    }
  };

  const toggleSubjectStatus = async (subject: Subject) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .update({ is_active: !subject.is_active })
        .eq('id', subject.id);

      if (error) throw error;

      await supabase.rpc('log_admin_action', {
        action_text: `${subject.is_active ? 'Деактивирован' : 'Активирован'} предмет: ${subject.name}`,
        target_type_param: 'subject',
        target_id_param: subject.id
      });

      toast({
        title: "Статус изменен",
        description: `Предмет ${subject.is_active ? 'деактивирован' : 'активирован'}`
      });

      fetchSubjects();
    } catch (error) {
      console.error('Error updating subject status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус предмета",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      is_active: subject.is_active
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '', is_active: true });
    setIsDialogOpen(true);
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
          <h2 className="text-2xl font-bold">Управление предметами</h2>
          <p className="text-muted-foreground">
            Всего предметов: {subjects.length}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить предмет
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Предметы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{subject.name}</h3>
                    {subject.description && (
                      <p className="text-sm text-muted-foreground">{subject.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge variant={subject.is_active ? "default" : "secondary"}>
                    {subject.is_active ? "Активен" : "Неактивен"}
                  </Badge>
                  
                  <Switch
                    checked={subject.is_active}
                    onCheckedChange={() => toggleSubjectStatus(subject)}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(subject)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Редактировать предмет' : 'Создать предмет'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название предмета</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название предмета"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание предмета"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Активный предмет</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
                {editingSubject ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
