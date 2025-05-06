
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, TrendingUp, Clock, Calendar, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const ProgressTab = () => {
  const [period, setPeriod] = useState("month");
  
  // Mock data for performance by subject
  const subjectPerformanceData = [
    { subject: "Математика", currentScore: 85, previousScore: 70, improvement: 15 },
    { subject: "Физика", currentScore: 78, previousScore: 72, improvement: 6 },
    { subject: "Английский", currentScore: 92, previousScore: 85, improvement: 7 },
  ];
  
  // Mock data for hours studied
  const hoursStudiedData = [
    { name: "Пн", hours: 2 },
    { name: "Вт", hours: 1.5 },
    { name: "Ср", hours: 3 },
    { name: "Чт", hours: 2 },
    { name: "Пт", hours: 2.5 },
    { name: "Сб", hours: 4 },
    { name: "Вс", hours: 1 },
  ];
  
  // Mock data for monthly progress
  const monthlyProgressData = [
    { month: "Янв", score: 65 },
    { month: "Фев", score: 68 },
    { month: "Мар", score: 72 },
    { month: "Апр", score: 75 },
    { month: "Май", score: 80 },
    { month: "Июн", score: 85 },
  ];
  
  // Mock data for subject distribution
  const subjectDistributionData = [
    { name: "Математика", value: 40 },
    { name: "Физика", value: 30 },
    { name: "Английский", value: 30 },
  ];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  // Mock achievements
  const achievements = [
    { 
      title: "Отличный старт", 
      description: "Первая неделя обучения", 
      icon: <Trophy className="w-6 h-6 text-amber-500" />, 
      earned: true 
    },
    { 
      title: "Стабильный прогресс", 
      description: "Месяц регулярных занятий", 
      icon: <TrendingUp className="w-6 h-6 text-green-500" />, 
      earned: true 
    },
    { 
      title: "Математический гений", 
      description: "90+ баллов по математике", 
      icon: <Book className="w-6 h-6 text-blue-500" />, 
      earned: false,
      progress: 85
    },
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Мой прогресс</h2>
      
      <div className="flex justify-end">
        <Select defaultValue="month" onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Выберите период" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="quarter">Квартал</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Успеваемость по предметам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectPerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar name="Предыдущий результат" dataKey="previousScore" fill="#8884d8" />
                  <Bar name="Текущий результат" dataKey="currentScore" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {subjectPerformanceData.map((item) => (
                <Card key={item.subject} className="overflow-hidden">
                  <div className={`h-2 ${item.improvement > 10 ? 'bg-green-500' : item.improvement > 5 ? 'bg-blue-500' : 'bg-amber-500'}`} />
                  <CardContent className="pt-4">
                    <h4 className="font-medium">{item.subject}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <div className="text-sm text-gray-500">Прогресс</div>
                        <div className="text-2xl font-bold">{item.currentScore}%</div>
                      </div>
                      <Badge className={`${item.improvement > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {item.improvement > 0 ? '+' : ''}{item.improvement}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Часы занятий</CardTitle>
            <Clock className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hoursStudiedData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} ч`, "Часов"]} />
                  <Bar dataKey="hours" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">Всего за неделю</div>
              <div className="text-2xl font-bold">16 часов</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Прогресс по месяцам</CardTitle>
            <Calendar className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyProgressData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, "Средний балл"]} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-500">Улучшение за полгода</div>
              <div className="text-2xl font-bold">+20%</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Распределение по предметам</CardTitle>
            <Book className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Доля времени"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={`${achievement.earned ? 'bg-gray-50' : 'bg-white'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'} mr-4`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      
                      {achievement.earned ? (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          Получено
                        </Badge>
                      ) : (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Прогресс</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Домашние задания</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="current">Текущие</TabsTrigger>
              <TabsTrigger value="completed">Выполненные</TabsTrigger>
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2">Математика</Badge>
                          <h3 className="font-medium">Решение квадратных уравнений</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Решить 10 задач из учебника, страница 45-46
                          </p>
                        </div>
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                          Сдать до 15 мая
                        </Badge>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Назначил: Иванова Анна
                        </span>
                        <Progress value={30} className="w-32" />
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2">Английский язык</Badge>
                          <h3 className="font-medium">Эссе на тему "Моя будущая профессия"</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Написать эссе из 250-300 слов
                          </p>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                          Сдать до 10 мая
                        </Badge>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Назначил: Петров Сергей
                        </span>
                        <Progress value={70} className="w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge className="mb-2">Физика</Badge>
                          <h3 className="font-medium text-gray-700">Законы Ньютона</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Решить задачи 1-5 из учебника
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          Сдано 1 мая
                        </Badge>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Оценка: 5 из 5
                        </span>
                        <Progress value={100} className="w-32 bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm text-gray-500">Выполнено задач</h3>
                        <p className="text-3xl font-bold mt-2">12</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm text-gray-500">Средний балл</h3>
                        <p className="text-3xl font-bold mt-2">4.7</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h3 className="text-sm text-gray-500">Активность</h3>
                        <p className="text-3xl font-bold mt-2 text-green-600">92%</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
