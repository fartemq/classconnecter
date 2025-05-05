
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserPlus, 
  Users, 
  SlidersHorizontal, 
  Mail, 
  Eye, 
  BookOpen,
  GraduationCap
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StudentProfileDialog } from "./students/StudentProfileDialog";
import { StudentContactDialog } from "./students/StudentContactDialog";

// Демо-данные для учеников (в реальном приложении это будет из API)
const mockStudents = [
  {
    id: "1",
    name: "Мария Иванова",
    avatar: null,
    lastActive: "2 часа назад",
    level: "Школьник",
    grade: "10 класс",
    subjects: ["Математика", "Физика"],
    city: "Москва",
    about: "Готовлюсь к ЕГЭ, нужна помощь с задачами повышенной сложности.",
    interests: ["Олимпиады", "Подготовка к ЕГЭ"],
    status: "new"
  },
  {
    id: "2",
    name: "Алексей Смирнов",
    avatar: null,
    lastActive: "Вчера",
    level: "Студент",
    grade: "2 курс",
    subjects: ["Высшая математика", "Программирование"],
    city: "Санкт-Петербург",
    about: "Нужна помощь с линейной алгеброй и аналитической геометрией.",
    interests: ["Углубленное изучение"],
    status: "active"
  },
  {
    id: "3",
    name: "Екатерина Петрова",
    avatar: null,
    lastActive: "Онлайн",
    level: "Взрослый",
    grade: null,
    subjects: ["Английский язык"],
    city: "Нижний Новгород",
    about: "Хочу подтянуть разговорный английский для работы.",
    interests: ["Разговорная практика", "Бизнес-английский"],
    status: "active"
  },
  {
    id: "4",
    name: "Дмитрий Козлов",
    avatar: null,
    lastActive: "3 дня назад",
    level: "Школьник",
    grade: "8 класс",
    subjects: ["Русский язык", "Литература"],
    city: "Казань",
    about: "Трудности с сочинениями и анализом текста.",
    interests: ["Подготовка к экзаменам"],
    status: "inactive"
  }
];

export const StudentsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Фильтрация студентов на основе поисковых критериев
  const filteredStudents = mockStudents.filter(student => {
    // Фильтрация по поисковому запросу
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.subjects.some(subj => subj.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтрация по уровню
    const matchesLevel = selectedLevel === "" || student.level === selectedLevel;
    
    // Фильтрация по предмету
    const matchesSubject = selectedSubject === "" || 
      student.subjects.some(subj => subj === selectedSubject);
    
    // Фильтрация по статусу (вкладке)
    const matchesTab = activeTab === "all" || 
      (activeTab === "new" && student.status === "new") ||
      (activeTab === "active" && student.status === "active") ||
      (activeTab === "inactive" && student.status === "inactive");
    
    return matchesSearch && matchesLevel && matchesSubject && matchesTab;
  });

  // Обработчик открытия диалога контакта со студентом
  const handleContactStudent = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  // Обработчик открытия профиля студента
  const handleViewProfile = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setShowProfileDialog(true);
  };

  // Получаем уникальный список предметов из данных студентов
  const uniqueSubjects = Array.from(new Set(mockStudents.flatMap(student => student.subjects)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Ученики</h2>
      
      {/* Панель фильтров и поиска */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Поиск учеников</CardTitle>
          <CardDescription>
            Найдите новых учеников или посмотрите своих текущих учеников
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Строка поиска */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Поиск по имени, предмету или городу" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Фильтры */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Уровень обучения" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все уровни</SelectItem>
                    <SelectItem value="Школьник">Школьник</SelectItem>
                    <SelectItem value="Студент">Студент</SelectItem>
                    <SelectItem value="Взрослый">Взрослый</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все предметы</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" title="Дополнительные фильтры">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Вкладки со списком учеников */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="relative">
            Все
            <Badge className="ml-1 text-xs">{mockStudents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="new" className="relative">
            Новые
            <Badge variant="secondary" className="ml-1 text-xs bg-green-100">{mockStudents.filter(s => s.status === "new").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="relative">
            Активные
            <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">{mockStudents.filter(s => s.status === "active").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="relative">
            Неактивные
            <Badge variant="secondary" className="ml-1 text-xs bg-gray-100">{mockStudents.filter(s => s.status === "inactive").length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        {/* Содержимое всех вкладок одинаковое, отличается только фильтрация */}
        <TabsContent value="all" className="mt-0">
          <StudentsList 
            students={filteredStudents} 
            onContact={handleContactStudent} 
            onViewProfile={handleViewProfile} 
          />
        </TabsContent>
        <TabsContent value="new" className="mt-0">
          <StudentsList 
            students={filteredStudents} 
            onContact={handleContactStudent} 
            onViewProfile={handleViewProfile} 
          />
        </TabsContent>
        <TabsContent value="active" className="mt-0">
          <StudentsList 
            students={filteredStudents} 
            onContact={handleContactStudent} 
            onViewProfile={handleViewProfile} 
          />
        </TabsContent>
        <TabsContent value="inactive" className="mt-0">
          <StudentsList 
            students={filteredStudents} 
            onContact={handleContactStudent} 
            onViewProfile={handleViewProfile} 
          />
        </TabsContent>
      </Tabs>
      
      {/* Диалоги (отображаются только при открытии) */}
      {selectedStudent && showContactDialog && (
        <StudentContactDialog 
          student={selectedStudent} 
          open={showContactDialog} 
          onClose={() => setShowContactDialog(false)} 
        />
      )}
      
      {selectedStudent && showProfileDialog && (
        <StudentProfileDialog 
          student={selectedStudent} 
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          onContact={() => {
            setShowProfileDialog(false);
            setShowContactDialog(true);
          }}
        />
      )}
    </div>
  );
};

// Компонент списка студентов
interface StudentsListProps {
  students: typeof mockStudents;
  onContact: (student: typeof mockStudents[0]) => void;
  onViewProfile: (student: typeof mockStudents[0]) => void;
}

const StudentsList = ({ students, onContact, onViewProfile }: StudentsListProps) => {
  if (students.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="text-center py-10">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Студенты не найдены</h3>
          <p className="text-gray-500 mb-4">
            Не найдено студентов, соответствующих вашим критериям поиска
          </p>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Найти новых учеников
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {students.map(student => (
        <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Статус индикатор (вертикальная полоса слева) */}
              <div className={`
                w-full sm:w-1 h-1 sm:h-auto 
                ${student.status === 'new' ? 'bg-green-500' : 
                  student.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}
              `} />
              
              <div className="p-4 sm:p-5 flex-grow flex flex-col sm:flex-row items-start gap-4">
                {/* Аватар и имя */}
                <div className="flex items-center w-full sm:w-auto">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl mr-3">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.lastActive}</p>
                  </div>
                </div>
                
                {/* Информация о студенте */}
                <div className="flex flex-col sm:flex-row gap-6 flex-grow w-full sm:w-auto">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Уровень</p>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-1.5 text-gray-600" />
                      <span>{student.level}{student.grade ? `, ${student.grade}` : ''}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Предметы</p>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1.5 text-gray-600" />
                      <span>{student.subjects.join(", ")}</span>
                    </div>
                  </div>
                  
                  <div className="ml-auto mt-auto">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewProfile(student)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Профиль
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => onContact(student)}
                      >
                        <Mail className="h-4 w-4 mr-1.5" />
                        Связаться
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
