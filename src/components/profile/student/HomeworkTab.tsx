import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, CheckCircle, Calendar, Clock, Upload, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const HomeworkTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  
  // Mock data for homework assignments
  const currentHomework = [
    {
      id: "1",
      subject: "Математика",
      title: "Решение квадратных уравнений",
      description: "Решить 10 задач из учебника, страница 45-46. Необходимо показать полное решение каждой задачи с использованием изученных формул. Задачи 1-5 решаются с помощью дискриминанта, задачи 6-10 - методом выделения полного квадрата.",
      dueDate: "2025-05-15",
      tutor: "Иванова Анна",
      progress: 30,
      status: "in-progress"
    },
    {
      id: "2",
      subject: "Английский язык",
      title: "Эссе на тему \"Моя будущая профессия\"",
      description: "Написать эссе из 250-300 слов на тему \"My Future Profession\". Эссе должно содержать вступление, основную часть и заключение. Используйте изученные времена (Present Simple, Present Continuous, Future Simple) и лексику по теме \"Профессии\".",
      dueDate: "2025-05-10",
      tutor: "Петров Сергей",
      progress: 70,
      status: "in-progress"
    },
    {
      id: "3",
      subject: "Физика",
      title: "Лабораторная работа: Измерение ускорения свободного падения",
      description: "Провести эксперимент по измерению ускорения свободного падения с помощью маятника. Записать результаты в таблицу, построить график и рассчитать погрешность измерений.",
      dueDate: "2025-05-20",
      tutor: "Сидоров Алексей",
      progress: 0,
      status: "not-started"
    }
  ];
  
  const completedHomework = [
    {
      id: "4",
      subject: "Физика",
      title: "Законы Ньютона",
      description: "Решить задачи 1-5 из учебника на применение законов Ньютона",
      submittedDate: "2025-05-01",
      dueDate: "2025-05-03",
      tutor: "Сидоров Алексей",
      grade: 5,
      feedback: "Отлично! Все задачи решены правильно с полным обоснованием.",
      status: "completed"
    },
    {
      id: "5",
      subject: "Английский язык",
      title: "Грамматические времена",
      description: "Выполнить упражнения 10-15 на страницах 34-35",
      submittedDate: "2025-04-20",
      dueDate: "2025-04-22",
      tutor: "Петров Сергей",
      grade: 4,
      feedback: "Хорошая работа, но есть несколько ошибок в Past Perfect.",
      status: "completed"
    }
  ];
  
  const allHomework = [...currentHomework, ...completedHomework];
  
  const filteredCurrentHomework = currentHomework.filter(hw => 
    (hw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     hw.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === "" || hw.subject === subjectFilter)
  );
  
  const filteredCompletedHomework = completedHomework.filter(hw => 
    (hw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     hw.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === "" || hw.subject === subjectFilter)
  );
  
  const openHomeworkDetails = (homework: any) => {
    setSelectedHomework(homework);
  };
  
  const subjects = [...new Set(allHomework.map(hw => hw.subject))];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "not-started": return "bg-gray-100 text-gray-800 border-gray-200";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU");
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Выполнено";
      case "not-started": return "Не начато";
      case "in-progress": return "В процессе";
      case "overdue": return "Просрочено";
      default: return "Неизвестно";
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Домашние задания</h2>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по названию или предмету..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-auto md:w-40">
            <SelectValue placeholder="Все предметы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_subjects">Все предметы</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Текущие</TabsTrigger>
          <TabsTrigger value="completed">Выполненные</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-4">
          {filteredCurrentHomework.length > 0 ? (
            <div className="space-y-4">
              {filteredCurrentHomework.map((homework) => (
                <Card key={homework.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-16 flex md:flex-col items-center md:justify-center gap-2 md:gap-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <Book className="h-6 w-6" />
                        </div>
                        <Badge className={getStatusColor(homework.status)}>
                          {getStatusLabel(homework.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <Badge className="mb-2">{homework.subject}</Badge>
                            <h3 className="font-medium text-lg">{homework.title}</h3>
                          </div>
                          <Badge variant="outline" className={
                            new Date(homework.dueDate) < new Date() 
                              ? "text-red-600 border-red-200 bg-red-50" 
                              : "text-amber-600 border-amber-200 bg-amber-50"
                          }>
                            Сдать до {formatDate(homework.dueDate)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {homework.description}
                        </p>
                        
                        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">
                              Репетитор: {homework.tutor}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center gap-2 flex-grow md:flex-grow-0">
                              <Progress value={homework.progress} className="w-full md:w-32" />
                              <span className="text-sm font-medium">{homework.progress}%</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => openHomeworkDetails(homework)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Просмотр
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Book className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Нет домашних заданий</h3>
                <p className="text-gray-500">
                  {searchTerm || subjectFilter ? 
                    "Попробуйте изменить параметры поиска" : 
                    "У вас пока нет активных домашних заданий"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {filteredCompletedHomework.length > 0 ? (
            <div className="space-y-4">
              {filteredCompletedHomework.map((homework) => (
                <Card key={homework.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-16 flex md:flex-col items-center md:justify-center gap-2 md:gap-0">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div className="flex items-center justify-center mt-2">
                          <span className="text-lg font-bold text-green-600">{homework.grade}</span>
                          <span className="text-xs text-gray-500">/5</span>
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <Badge className="mb-2">{homework.subject}</Badge>
                            <h3 className="font-medium text-lg">{homework.title}</h3>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            Сдано {formatDate(homework.submittedDate)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {homework.description}
                        </p>
                        
                        <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                          <p className="font-medium mb-1">Отзыв репетитора:</p>
                          <p className="text-gray-700">{homework.feedback}</p>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Репетитор: {homework.tutor}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openHomeworkDetails(homework)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Подробнее
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Нет выполненных заданий</h3>
                <p className="text-gray-500">
                  {searchTerm || subjectFilter ? 
                    "Попробуйте изменить параметры поиска" : 
                    "У вас пока нет выполненных домашних заданий"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистика выполнения</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Выполнено</span>
                    <span className="font-medium">5 из 8</span>
                  </div>
                  <Progress value={62.5} />
                  
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-green-600 font-bold text-3xl">5</div>
                      <div className="text-sm text-gray-600">Выполнено</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-blue-600 font-bold text-3xl">3</div>
                      <div className="text-sm text-gray-600">В процессе</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Средняя оценка</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-amber-50 flex items-center justify-center">
                  <span className="text-5xl font-bold text-amber-600">4.7</span>
                </div>
                <div className="mt-4 space-y-2 w-full">
                  <div className="flex justify-between text-sm">
                    <span>Математика</span>
                    <span className="font-medium">5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Физика</span>
                    <span className="font-medium">4.5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Английский</span>
                    <span className="font-medium">4.7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Сроки выполнения</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Сдано вовремя</span>
                    <span className="font-medium">80%</span>
                  </div>
                  <Progress value={80} />
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <div className="text-sm">Вовремя: 4 задания</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <div className="text-sm">С опозданием: 1 задание</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="text-sm">Просрочено: 0 заданий</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Homework Details Dialog */}
      <Dialog open={!!selectedHomework} onOpenChange={(open) => !open && setSelectedHomework(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedHomework?.title}</DialogTitle>
            <Badge className="mt-1 w-fit">{selectedHomework?.subject}</Badge>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Описание:</h4>
              <p className="text-gray-700">{selectedHomework?.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Репетитор:</h4>
                <p className="text-gray-700">{selectedHomework?.tutor}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">
                  {selectedHomework?.status === "completed" ? "Срок сдачи:" : "Сдать до:"}
                </h4>
                <p className="text-gray-700">
                  {selectedHomework?.dueDate && formatDate(selectedHomework.dueDate)}
                </p>
              </div>
              {selectedHomework?.status === "completed" && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Сдано:</h4>
                    <p className="text-gray-700">
                      {selectedHomework?.submittedDate && formatDate(selectedHomework.submittedDate)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Оценка:</h4>
                    <p className="text-gray-700">{selectedHomework?.grade} из 5</p>
                  </div>
                </>
              )}
            </div>
            
            {selectedHomework?.status === "completed" && (
              <div>
                <h4 className="text-sm font-medium mb-1">Отзыв репетитора:</h4>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-gray-700">{selectedHomework?.feedback}</p>
                </div>
              </div>
            )}
            
            {selectedHomework?.status !== "completed" && (
              <>
                <div>
                  <h4 className="text-sm font-medium mb-1">Прогресс:</h4>
                  <div className="flex items-center gap-4">
                    <Progress value={selectedHomework?.progress} className="flex-grow" />
                    <span>{selectedHomework?.progress}%</span>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline">Сохранить как черновик</Button>
                  <Button className="gap-2">
                    <Upload className="h-4 w-4" />
                    Отправить на проверку
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
