
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Image, 
  Video, 
  Download, 
  Upload, 
  Search,
  Folder,
  Plus,
  Eye,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LessonMaterialsProps {
  lessonId: string;
}

interface Material {
  id: string;
  title: string;
  material_type: string;
  file_path: string | null;
  created_at: string;
  created_by: string;
}

export const LessonMaterials = ({ lessonId }: LessonMaterialsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [lessonId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('lesson_id', lessonId)
        .in('material_type', ['file', 'image', 'video', 'document'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `lesson-materials/${lessonId}/${fileName}`;

      // Определяем тип материала по расширению файла
      let materialType = 'file';
      if (file.type.startsWith('image/')) materialType = 'image';
      else if (file.type.startsWith('video/')) materialType = 'video';
      else if (file.type.includes('pdf') || file.type.includes('document')) materialType = 'document';

      // Сохраняем информацию о файле в БД
      const { data, error } = await supabase
        .from('lesson_materials')
        .insert({
          lesson_id: lessonId,
          material_type: materialType,
          title: file.name,
          file_path: filePath,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setMaterials(prev => [data, ...prev]);
      toast({
        title: "Файл загружен",
        description: "Материал добавлен к уроку",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('lesson_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      setMaterials(prev => prev.filter(m => m.id !== materialId));
      toast({
        title: "Материал удален",
        description: "Файл был удален из урока",
      });
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить материал",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-green-500" />;
      case 'video': return <Video className="h-8 w-8 text-red-500" />;
      case 'document': return <FileText className="h-8 w-8 text-blue-500" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const materialsByType = {
    all: filteredMaterials,
    image: filteredMaterials.filter(m => m.material_type === 'image'),
    video: filteredMaterials.filter(m => m.material_type === 'video'),
    document: filteredMaterials.filter(m => m.material_type === 'document'),
    file: filteredMaterials.filter(m => m.material_type === 'file')
  };

  const MaterialCard = ({ material }: { material: Material }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getFileIcon(material.material_type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{material.title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className={getFileTypeColor(material.material_type)}>
                  {material.material_type}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(material.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => deleteMaterial(material.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Материалы урока</h3>
        <div className="flex space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
          />
          <Button 
            size="sm" 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Загрузка...' : 'Загрузить'}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск материалов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center space-x-1">
            <Folder className="h-4 w-4" />
            <span>Все</span>
            <Badge variant="secondary" className="ml-1">
              {materialsByType.all.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="image">
            <Image className="h-4 w-4 mr-1" />
            Фото ({materialsByType.image.length})
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="h-4 w-4 mr-1" />
            Видео ({materialsByType.video.length})
          </TabsTrigger>
          <TabsTrigger value="document">
            <FileText className="h-4 w-4 mr-1" />
            Документы ({materialsByType.document.length})
          </TabsTrigger>
          <TabsTrigger value="file">
            <FileText className="h-4 w-4 mr-1" />
            Файлы ({materialsByType.file.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(materialsByType).map(([key, materials]) => (
          <TabsContent key={key} value={key} className="flex-1 overflow-auto">
            {materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Нет материалов</p>
                <p className="text-sm">Загрузите файлы для урока</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map(material => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
