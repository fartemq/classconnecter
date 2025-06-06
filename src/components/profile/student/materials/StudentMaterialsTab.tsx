import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { fetchStudentMaterials } from "@/services/tutorMaterialsService";
import { FileText, Video, Headphones, Link } from "lucide-react";

interface Material {
  id: string;
  title: string;
  type: "document" | "video" | "audio" | "link";
  url: string;
  description: string | null;
  subject_id: string | null;
  tutor_id: string;
  profiles: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
  subjects: {
    name: string;
  } | null;
}

export const StudentMaterialsTab = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("all");
  
  useEffect(() => {
    fetchSubjects();
    loadMaterials();
  }, [user]);
  
  useEffect(() => {
    if (user) {
      loadMaterials();
    }
  }, [selectedSubject, user]);
  
  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name');
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedSubjects = data.map(subject => ({
          id: subject.id,
          name: subject.name
        }));
        setSubjects(formattedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };
  
  const loadMaterials = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const materialsData = await fetchStudentMaterials(user.id, selectedSubject || undefined);
      
      // Filter by type if needed
      const filteredMaterials = currentTab === "all" 
        ? materialsData 
        : materialsData.filter(material => material.type === currentTab);
      
      setMaterials(filteredMaterials as Material[]);
    } catch (error) {
      console.error("Error loading materials:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить учебные материалы",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value === "all" ? null : value);
  };
  
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    
    // If tab changes, we need to filter materials
    if (materials.length > 0) {
      if (value === "all") {
        loadMaterials();
      } else {
        // Filter client-side for tab changes to avoid extra API calls
        const filteredMaterials = materials.filter(material => 
          value === "all" || material.type === value
        );
        setMaterials(filteredMaterials);
      }
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
  
  const getTypeName = (type: string) => {
    switch (type) {
      case "document": return "Документ";
      case "video": return "Видео";
      case "audio": return "Аудио";
      case "link": return "Ссылка";
      default: return "Материал";
    }
  };
  
  const EmptyState = () => (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <FileText className="h-12 w-12 text-gray-300" />
        <h3 className="text-xl font-medium">Материалы не найдены</h3>
        <p className="text-gray-500">
          У вас пока нет материалов от репетиторов
        </p>
      </div>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Учебные материалы</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/2">
            <Select value={selectedSubject || "all"} onValueChange={handleSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Все предметы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все предметы</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-1/2">
            <Tabs defaultValue="all" value={currentTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="document">Документы</TabsTrigger>
                <TabsTrigger value="video">Видео</TabsTrigger>
                <TabsTrigger value="link">Ссылки</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader size="lg" />
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map((material) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  {getMaterialIcon(material.type)}
                  <CardTitle className="truncate">{material.title}</CardTitle>
                </div>
                <div className="text-sm text-gray-500 mb-2 flex flex-col space-y-1">
                  <div>
                    Репетитор: {material.profiles.first_name} {material.profiles.last_name || ''}
                  </div>
                  {material.subjects && (
                    <div>
                      Предмет: {material.subjects.name}
                    </div>
                  )}
                  <div>
                    Тип: {getTypeName(material.type)}
                  </div>
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
        <EmptyState />
      )}
    </div>
  );
};
