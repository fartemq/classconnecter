import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Star, 
  Users, 
  TrendingUp,
  Clock,
  DollarSign,
  Settings,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";

const TutorDashboardPage = () => {
  const { user } = useSimpleAuth();

  // Mock data - в реальном приложении это будет загружаться из API
  const upcomingLessons = [
    {
      id: "1",
      studentName: "Иван Петров",
      subject: "Математика",
      date: "Сегодня",
      time: "15:00",
      status: "confirmed"
    },
    {
      id: "2", 
      studentName: "Мария Сидорова",
      subject: "Физика",
      date: "Завтра",
      time: "16:30",
      status: "pending"
    }
  ];

  const lessonRequests = [
    {
      id: "1",
      studentName: "Алексей Иванов",
      subject: "Математика",
      requestedDate: "15 января",
      requestedTime: "14:00",
      message: "Хочу подготовиться к экзамену"
    },
    {
      id: "2",
      studentName: "Елена Козлова", 
      subject: "Физика",
      requestedDate: "16 января",
      requestedTime: "17:00",
      message: "Нужна помощь с домашним заданием"
    }
  ];

  const stats = {
    totalStudents: 15,
    monthlyLessons: 32,
    monthlyEarnings: 48000,
    averageRating: 4.9,
    completionRate: 95
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Добро пожаловать, {user?.user_metadata?.first_name || 'Репетитор'}!
          </h1>
          <p className="text-muted-foreground">
            Управляйте своими уроками и отслеживайте прогресс
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Студенты</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                +3 за этот месяц
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Уроков в месяц</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyLessons}</div>
              <p className="text-xs text-muted-foreground">
                +5 за неделю
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Доход за месяц</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyEarnings.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                +12% к прошлому месяцу
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Отличная работа!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Запросы на уроки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Новые запросы на уроки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lessonRequests.length > 0 ? (
                lessonRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{request.studentName}</p>
                        <p className="text-sm text-muted-foreground">{request.subject}</p>
                      </div>
                      <Badge variant="secondary">Новый</Badge>
                    </div>
                    <p className="text-sm mb-2">
                      <strong>Дата:</strong> {request.requestedDate} в {request.requestedTime}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">"{request.message}"</p>
                    <div className="flex gap-2">
                      <Button size="sm">Принять</Button>
                      <Button size="sm" variant="outline">Отклонить</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Нет новых запросов</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ближайшие уроки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ближайшие уроки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingLessons.length > 0 ? (
                upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {lesson.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lesson.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.studentName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={lesson.status === 'confirmed' ? 'default' : 'secondary'}>
                        {lesson.status === 'confirmed' ? 'Подтверждён' : 'Ожидание'}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {lesson.date} в {lesson.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Нет запланированных уроков</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Быстрые действия */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col" asChild>
                <Link to="/profile/tutor/schedule">
                  <Calendar className="h-6 w-6 mb-2" />
                  Расписание
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/profile/tutor/students">
                  <Users className="h-6 w-6 mb-2" />
                  Мои студенты
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/profile/tutor/materials">
                  <FileText className="h-6 w-6 mb-2" />
                  Материалы
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/profile/tutor">
                  <Settings className="h-6 w-6 mb-2" />
                  Профиль
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Прогресс профиля */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Завершенность профиля
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Общая завершенность</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Базовая информация</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">Предметы и цены</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm">Видеопрезентация</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm">Верификация документов</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/profile/tutor">
                  Завершить профиль
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default TutorDashboardPage;