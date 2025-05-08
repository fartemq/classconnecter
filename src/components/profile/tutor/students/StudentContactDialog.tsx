
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/types/student";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface StudentContactDialogProps {
  student: Student;
  open: boolean;
  onClose: () => void;
  onSubmit: (subjectId: string | null, message: string | null) => Promise<void>;
}

export const StudentContactDialog = ({
  student,
  open,
  onClose,
  onSubmit,
}: StudentContactDialogProps) => {
  const [message, setMessage] = useState("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Get student's name (with fallback)
  const studentName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || "Без имени";

  // Load subjects taught by the tutor
  React.useEffect(() => {
    const fetchSubjects = async () => {
      if (!open) return;

      try {
        setLoadingSubjects(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { data, error } = await supabase
          .from('tutor_subjects')
          .select(`
            subject_id,
            subjects:subject_id(id, name)
          `)
          .eq('tutor_id', userData.user.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedSubjects = data.map(item => ({
            id: item.subjects?.id || "",
            name: item.subjects?.name || ""
          }));
          setSubjects(formattedSubjects);
          // Set default subject if available
          if (formattedSubjects.length > 0) {
            setSubjectId(formattedSubjects[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(subjectId, message);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Связаться с учеником</DialogTitle>
          <DialogDescription>
            Отправьте сообщение ученику {studentName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Выберите предмет
            </label>
            <Select
              value={subjectId || ""}
              onValueChange={setSubjectId}
              disabled={loadingSubjects}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Сообщение (необязательно)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите сообщение ученику..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!subjectId || loading}>
            {loading ? "Отправка..." : "Отправить запрос"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
