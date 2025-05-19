
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MessageSquare,
  Calendar,
  ExternalLink,
  Clock,
  UserX,
  Search,
  Filter,
  AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader } from "@/components/ui/loader";
import { 
  StudentTutorRelationship,
  getStudentTutorRelationships,
  endTutorRelationship,
  addTutorReview
} from "@/services/studentTutorService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const MyTutorsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTutors, setCurrentTutors] = useState<StudentTutorRelationship[]>([]);
  const [pastTutors, setPastTutors] = useState<StudentTutorRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile("student");
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      toast({
        title: "Требуется авторизация",
        description: "Для просмотра репетиторов необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }
    
    if (profile) {
      fetchTutors();
    }
  }, [profile, user]);

  const fetchTutors = async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const relationships = await getStudentTutorRelationships(profile.id);
      
      // Separate current and past tutors
      const current = relationships.filter(rel => rel.status === 'accepted');
      const past = relationships.filter(rel => rel.status === 'removed');
      
      setCurrentTutors(current);
      setPastTutors(past);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список репетиторов",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndTutorRelationship = async () => {
    if (!selectedRelationshipId) return;
    
    try {
      const success = await endTutorRelationship(selectedRelationshipId);
      if (success) {
        toast({
          title: "Успешно",
          description: "Вы больше не работаете с этим репетитором",
        });
        
        // Update state
        setCurrentTutors(prev => prev.filter(tutor => tutor.id !== selectedRelationshipId));
        // Fetch to get the updated past tutors list
        fetchTutors();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось прекратить работу с репетитором",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error ending tutor relationship:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось прекратить работу с репетитором",
        variant: "destructive"
      });
    }
  };

  const handleAddReview = async () => {
    if (!profile?.id || !selectedTutorId) return;
    
    try {
      const success = await addTutorReview(profile.id, selectedTutorId, reviewRating, reviewComment);
      if (success) {
        toast({
          title: "Успешно",
          description: "Ваш отзыв добавлен",
        });
        
        setReviewRating(5);
        setReviewComment("");
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить отзыв",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить отзыв",
        variant: "destructive"
      });
    }
  };

  const filteredCurrentTutors = currentTutors.filter(tutor => {
    const fullName = `${tutor.tutor?.first_name || ''} ${tutor.tutor?.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const filteredPastTutors = pastTutors.filter(tutor => {
    const fullName = `${tutor.tutor?.first_name || ''} ${tutor.tutor?.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не указано";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Мои репетиторы</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по имени репетитора..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex gap-2" onClick={() => navigate('/profile/student/find-tutors')}>
          <Search className="h-4 w-4" />
          <span>Найти репетиторов</span>
        </Button>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Текущие репетиторы ({filteredCurrentTutors.length})</TabsTrigger>
          <TabsTrigger value="past">Прошлые репетиторы ({filteredPastTutors.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-4">
          {filteredCurrentTutors.length > 0 ? (
            <div className="space-y-4">
              {filteredCurrentTutors.map(relationship => (
                <Card key={relationship.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tutor avatar and rating */}
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden bg-gray-100">
                          <Avatar className="w-full h-full">
                            {relationship.tutor?.avatar_url ? (
                              <AvatarImage 
                                src={relationship.tutor.avatar_url} 
                                alt={`${relationship.tutor.first_name || ''} ${relationship.tutor.last_name || ''}`} 
                              />
                            ) : (
                              <AvatarFallback className="w-full h-full text-xl">
                                {relationship.tutor?.first_name?.[0] || ''}
                                {relationship.tutor?.last_name?.[0] || ''}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </div>
                      
                      {/* Tutor info */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {relationship.tutor?.first_name || ''} {relationship.tutor?.last_name || ''}
                            </h3>
                            {relationship.tutor?.city && (
                              <div className="text-sm text-gray-500">
                                {relationship.tutor.city}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/profile/student/chats/${relationship.tutor_id}`)}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Написать
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/profile/student/schedule?tutor=${relationship.tutor_id}`)}
                            >
                              <Calendar className="mr-1 h-4 w-4" />
                              Записаться
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            <span>Начало занятий: <strong>{formatDate(relationship.start_date)}</strong></span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setSelectedRelationshipId(relationship.id)}
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Прекратить занятия
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Подтвердите действие</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите прекратить занятия с репетитором? 
                                  Этот репетитор будет перемещен в раздел "Прошлые репетиторы".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={handleEndTutorRelationship}>
                                  <AlertTriangle className="h-4 w-4 mr-2" /> 
                                  Прекратить занятия
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/tutors/${relationship.tutor_id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Профиль репетитора
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">У вас пока нет репетиторов</h3>
              <p className="mt-1 text-gray-500">
                Найдите репетитора и запишитесь на занятие
              </p>
              <Button className="mt-4" onClick={() => navigate('/profile/student/find-tutors')}>
                <Search className="mr-2 h-4 w-4" />
                Найти репетитора
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          {filteredPastTutors.length > 0 ? (
            <div className="space-y-4">
              {filteredPastTutors.map(relationship => (
                <Card key={relationship.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tutor avatar and rating */}
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden bg-gray-100">
                          <Avatar className="w-full h-full">
                            {relationship.tutor?.avatar_url ? (
                              <AvatarImage 
                                src={relationship.tutor.avatar_url} 
                                alt={`${relationship.tutor.first_name || ''} ${relationship.tutor.last_name || ''}`} 
                              />
                            ) : (
                              <AvatarFallback className="w-full h-full text-xl">
                                {relationship.tutor?.first_name?.[0] || ''}
                                {relationship.tutor?.last_name?.[0] || ''}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      </div>
                      
                      {/* Tutor info */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {relationship.tutor?.first_name || ''} {relationship.tutor?.last_name || ''}
                            </h3>
                            {relationship.tutor?.city && (
                              <div className="text-sm text-gray-500">
                                {relationship.tutor.city}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-3 md:mt-0">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  onClick={() => setSelectedTutorId(relationship.tutor_id)}
                                >
                                  <Star className="mr-1 h-4 w-4" />
                                  Оставить отзыв
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Оставить отзыв о репетиторе</DialogTitle>
                                  <DialogDescription>
                                    Ваш отзыв поможет другим ученикам выбрать подходящего репетитора.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Оценка</Label>
                                    <RadioGroup 
                                      value={reviewRating.toString()} 
                                      onValueChange={(value) => setReviewRating(parseInt(value))}
                                      className="flex space-x-2"
                                    >
                                      {[1, 2, 3, 4, 5].map((rating) => (
                                        <div key={rating} className="flex flex-col items-center">
                                          <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} className="sr-only" />
                                          <Label 
                                            htmlFor={`rating-${rating}`} 
                                            className={`cursor-pointer text-2xl ${reviewRating >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            onClick={() => setReviewRating(rating)}
                                          >
                                            ★
                                          </Label>
                                          <span className="text-xs">{rating}</span>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="comment">Комментарий</Label>
                                    <Textarea 
                                      id="comment" 
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      rows={4}
                                      placeholder="Расскажите о своем опыте работы с репетитором"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit" onClick={handleAddReview}>Отправить отзыв</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/profile/student/find-tutors`)}
                            >
                              <Calendar className="mr-1 h-4 w-4" />
                              Записаться снова
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-600" />
                            <span>Период обучения: <strong>{formatDate(relationship.start_date)} - {formatDate(relationship.end_date)}</strong></span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/tutors/${relationship.tutor_id}`)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Профиль репетитора
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">У вас нет прошлых репетиторов</h3>
              <p className="mt-1 text-gray-500">
                Здесь будут отображаться репетиторы, с которыми вы прекратили занятия
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
