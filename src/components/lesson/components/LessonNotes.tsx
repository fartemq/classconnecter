
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Download, 
  Upload, 
  FileText, 
  Plus,
  Trash2,
  Edit2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";

interface LessonNotesProps {
  lessonId: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const LessonNotes = ({ lessonId }: LessonNotesProps) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [lessonId]);

  useEffect(() => {
    if (currentNote && content !== currentNote.content) {
      const timer = setTimeout(() => {
        autoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, currentNote]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setNotes(data || []);
      
      if (data && data.length > 0 && !currentNote) {
        selectNote(data[0]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  const createNewNote = async () => {
    const newTitle = `Заметка ${notes.length + 1}`;
    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .insert({
          lesson_id: lessonId,
          user_id: user?.id,
          title: newTitle,
          content: ''
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        title: newTitle,
        content: '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setNotes(prev => [...prev, newNote]);
      selectNote(newNote);
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заметку",
        variant: "destructive"
      });
    }
  };

  const saveNote = async () => {
    if (!currentNote) return;

    try {
      setAutoSaving(true);
      const { error } = await supabase
        .from('lesson_notes')
        .update({
          title: title,
          content: content
        })
        .eq('id', currentNote.id);

      if (error) throw error;

      const updatedNote = {
        ...currentNote,
        title,
        content,
        updated_at: new Date().toISOString()
      };

      setNotes(prev => prev.map(note => 
        note.id === currentNote.id ? updatedNote : note
      ));
      setCurrentNote(updatedNote);
      setIsEditing(false);

      toast({
        title: "Заметка сохранена",
        description: "Изменения автоматически сохранены",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить заметку",
        variant: "destructive"
      });
    } finally {
      setAutoSaving(false);
    }
  };

  const autoSave = async () => {
    if (currentNote && content !== currentNote.content) {
      await saveNote();
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      if (currentNote?.id === noteId) {
        const remainingNotes = notes.filter(note => note.id !== noteId);
        if (remainingNotes.length > 0) {
          selectNote(remainingNotes[0]);
        } else {
          setCurrentNote(null);
          setTitle('');
          setContent('');
        }
      }

      toast({
        title: "Заметка удалена",
        description: "Заметка была успешно удалена",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заметку",
        variant: "destructive"
      });
    }
  };

  const exportNote = () => {
    if (!currentNote) return;
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex">
      {/* Notes List */}
      <div className="w-1/3 border-r pr-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Заметки</h3>
          <Button size="sm" onClick={createNewNote}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {notes.map(note => (
            <div
              key={note.id}
              className={`p-3 rounded-lg cursor-pointer border ${
                currentNote?.id === note.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => selectNote(note)}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">{note.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(note.updated_at).toLocaleString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 pl-4">
        {currentNote ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsEditing(true);
                }}
                className="flex-1 mr-2"
                placeholder="Название заметки"
              />
              <div className="flex space-x-2">
                {autoSaving && <Badge variant="outline">Сохранение...</Badge>}
                <Button size="sm" onClick={saveNote} disabled={!isEditing}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={exportNote}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setIsEditing(true);
              }}
              placeholder="Начните писать заметки..."
              className="flex-1 resize-none"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Выберите заметку или создайте новую</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
