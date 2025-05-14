
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { TutorMaterial, TutorProfile } from "@/types/tutor";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Video, Headphones, Link, Plus, Trash2, BookText } from "lucide-react";
import { fetchTutorProfile } from "@/services/tutorProfileService";
import { MethodologyTab } from "./MethodologyTab";

interface MaterialsTabProps {
  tutorId: string;
  subjectId?: string;
}

export const MaterialsTab = ({ tutorId, subjectId }: MaterialsTabProps) => {
  const [activeTab, setActiveTab] = useState<string>("materials");
  const [materials, setMaterials] = useState<TutorMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [newMaterial, setNewMaterial] = useState<Partial<TutorMaterial>>({
    title: "",
    type: "document",
    url: "",
    description: ""
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch tutor profile
        const profile = await fetchTutorProfile(tutorId);
        setTutorProfile(profile);
        
        // Fetch materials
        await fetchMaterials();
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить информацию",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [tutorId, subjectId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from("tutor_materials")
        .select("*")
        .eq("tutor_id", tutorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Explicitly cast the type property to ensure it matches TutorMaterial type
      setMaterials(data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type as "document" | "video" | "audio" | "link",
        url: item.url,
        description: item.description
      })));
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить учебные материалы",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setNewMaterial(prev => ({ ...prev, type: value as "document" | "video" | "audio" | "link" }));
  };

  const handleAddMaterial = async () => {
    try {
      if (!newMaterial.title || !newMaterial.url) {
        toast({
          title: "Заполните обязательные поля",
          description: "Название и ссылка обязательны для заполнения",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("tutor_materials")
        .insert({
          tutor_id: tutorId,
          subject_id: subjectId || null,
          title: newMaterial.title,
          type: newMaterial.type,
          url: newMaterial.url,
          description: newMaterial.description || null
        })
        .select();

      if (error) throw error;

      toast({
        title: "Материал добавлен",
        description: `${newMaterial.title} успешно добавлен`
      });

      // Reset form and close dialog
      setNewMaterial({
        title: "",
        type: "document",
        url: "",
        description: ""
      });
      setOpen(false);
      
      // Refresh materials list
      await fetchMaterials();
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить материал",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tutor_materials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Материал удален",
        description: "Материал был успешно удален"
      });

      // Update local state
      setMaterials(materials.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить материал",
        variant: "destructive",
      });
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-red-500" />;
      case "audio":
        return <Headphones className="h-5 w-5 text-purple-500" />;
      case "link":
        return <Link className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="materials" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Учебные материалы
          </TabsTrigger>
          <TabsTrigger value="methodology" className="flex items-center">
            <BookText className="h-4 w-4 mr-2" />
            Методика преподавания
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Учебные материалы</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить материал
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить учебный материал</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Название *</label>
                    <Input 
                      name="title" 
                      value={newMaterial.title} 
                      onChange={handleInputChange}
                      placeholder="Введите название материала" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Тип материала *</label>
                    <Select value={newMaterial.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип материала" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Документ</SelectItem>
                        <SelectItem value="video">Видео</SelectItem>
                        <SelectItem value="audio">Аудио</SelectItem>
                        <SelectItem value="link">Ссылка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Ссылка *</label>
                    <Input 
                      name="url" 
                      value={newMaterial.url} 
                      onChange={handleInputChange}
                      placeholder="https://..." 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ссылка на материал (Google Drive, YouTube и т.д.)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Описание</label>
                    <Textarea 
                      name="description" 
                      value={newMaterial.description} 
                      onChange={handleInputChange}
                      placeholder="Краткое описание материала..." 
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
                    <Button onClick={handleAddMaterial}>Добавить</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((material) => (
                <Card key={material.id} className="relative group">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {getMaterialIcon(material.type)}
                      <CardTitle className="truncate">{material.title}</CardTitle>
                    </div>
                    {material.description && (
                      <CardDescription className="line-clamp-2">
                        {material.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <a 
                      href={material.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm inline-flex items-center"
                    >
                      Открыть материал
                      <Link className="h-4 w-4 ml-1" />
                    </a>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <FileText className="h-12 w-12 text-gray-300" />
                <h3 className="text-xl font-medium">У вас пока нет учебных материалов</h3>
                <p className="text-gray-500">
                  Добавьте документы, видео или ссылки, которые помогут вашим ученикам в обучении
                </p>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить первый материал
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="methodology" className="pt-6">
          {tutorProfile ? (
            <MethodologyTab profile={tutorProfile} />
          ) : (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <BookText className="h-12 w-12 text-gray-300" />
                <h3 className="text-xl font-medium">Информация не найдена</h3>
                <p className="text-gray-500">
                  Не удалось загрузить данные о методике преподавания
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
