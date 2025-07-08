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
  Award,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";

const StudentDashboardPage = () => {
  const { user } = useSimpleAuth();

  // Mock data - в реальном приложении это будет загружаться из API
  const upcomingLessons = [
    {
      id: "1",
      tutorName: "Анна Петрова",
      subject: "Математика",
      date: "Сегодня",
      time: "15:00",
      status: "confirmed"
    },
    {
      id: "2", 
      tutorName: "Михаил Иванов",
      subject: "Физика",
      date: "Завтра",
      time: "16:30",
      status: "pending"
    }
  ];

  const recentMessages = [
    {
      id: "1",
      tutorName: "Анна Петрова",
      lastMessage: "Не забудьте выполнить домашнее задание",
      time: "10 мин назад"
    },
    {
      id: "2",
      tutorName: "Михаил Иванов", 
      lastMessage: "Отлично справились с задачей!",
      time: "2 часа назад"
    }
  ];

  const stats = {
    totalLessons: 12,
    completedHomework: 8,
    totalHomework: 10,
    averageRating: 4.8,
    activeTutors: 2
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Добро пожаловать, {user?.user_metadata?.first_name || 'Студент'}!
          </h1>
          <p className="text-muted-foreground">
            Отслеживайте свой прогресс и управляйте обучением
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего уроков</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground">
                +2 за эту неделю
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Домашние задания</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedHomework}/{stats.totalHomework}
              </div>
              <Progress 
                value={(stats.completedHomework / stats.totalHomework) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средняя оценка</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground">
                Отлично!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные репетиторы</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTutors}</div>
              <p className="text-xs text-muted-foreground">
                По 2 предметам
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          {lesson.tutorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lesson.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.tutorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant={lesson.status === 'confirmed' ? 'default' : 'secondary'}>
                          {lesson.status === 'confirmed' ? 'Подтверждён' : 'Ожидание'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lesson.date} в {lesson.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">У вас пока нет запланированных уроков</p>
                  <Button asChild>
                    <Link to="/tutors">
                      <Search className="h-4 w-4 mr-2" />
                      Найти репетитора
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Последние сообщения */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Последние сообщения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {message.tutorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{message.tutorName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/chat/${message.id}`}>
                        Ответить
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Нет новых сообщений</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex-col" asChild>
                <Link to="/tutors">
                  <Search className="h-6 w-6 mb-2" />
                  Найти репетитора
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/profile/student/homework">
                  <BookOpen className="h-6 w-6 mb-2" />
                  Домашние задания
                </Link>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link to="/profile/student/schedule">
                  <Calendar className="h-6 w-6 mb-2" />
                  Мое расписание
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Достижения */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Достижения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Первый урок</p>
                  <p className="text-sm text-muted-foreground">Прошли первое занятие</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">10 уроков</p>
                  <p className="text-sm text-muted-foreground">Завершили 10 занятий</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg opacity-50">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Отличник</p>
                  <p className="text-sm text-muted-foreground">Средняя оценка 4.5+</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentDashboardPage;