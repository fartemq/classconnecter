
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTutorSchedule } from "@/hooks/useTutorSchedule";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeSlotCard } from "./schedule/TimeSlotCard";
import { getDayName, getTimeSlots } from "@/utils/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { addScheduleException } from "@/services/tutorScheduleService";

interface AdvancedScheduleTabProps {
  tutorId: string;
}

export const AdvancedScheduleTab = ({ tutorId }: AdvancedScheduleTabProps) => {
  const { toast } = useToast();
  const { 
    schedule, 
    loading, 
    saving,
    addTimeSlot,
    toggleSlotAvailability,
    deleteTimeSlot 
  } = useTutorSchedule(tutorId);
  
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday as default
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [activeTab, setActiveTab] = useState("regular");
  
  // For exceptions
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [exceptionReason, setExceptionReason] = useState("");
  const [isAddingException, setIsAddingException] = useState(false);

  const dayNames = [
    "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"
  ];
  
  const timeSlots = getTimeSlots();

  const handleAddTimeSlot = async () => {
    const success = await addTimeSlot(selectedDay, startTime, endTime);
    if (success) {
      // Optionally reset form or do other actions
    }
  };

  const handleAddException = async () => {
    if (!selectedDate) {
      toast({
        title: "Ошибка",
        description: "Выберите дату исключения",
        variant: "destructive",
      });
      return;
    }
    
    if (!exceptionReason) {
      toast({
        title: "Ошибка",
        description: "Укажите причину исключения",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingException(true);
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const success = await addScheduleException(
        tutorId, 
        formattedDate, 
        exceptionReason,
        true
      );
      
      if (success) {
        toast({
          title: "Исключение добавлено",
          description: `День ${format(selectedDate, 'dd MMMM yyyy', { locale: ru })} отмечен как выходной`,
        });
        
        // Reset form
        setSelectedDate(undefined);
        setExceptionReason("");
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить исключение",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding exception:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить исключение",
        variant: "destructive",
      });
    } finally {
      setIsAddingException(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Расписание занятий</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="regular">Регулярное расписание</TabsTrigger>
          <TabsTrigger value="exceptions">Исключения</TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular">
          <Card>
            <CardHeader>
              <CardTitle>Добавить временной слот</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">День недели</label>
                  <Select
                    value={selectedDay.toString()}
                    onValueChange={(value) => setSelectedDay(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите день" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((day, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Время начала</label>
                  <Select
                    value={startTime}
                    onValueChange={setStartTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Время окончания</label>
                  <Select
                    value={endTime}
                    onValueChange={setEndTime}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите время" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="mt-4" 
                onClick={handleAddTimeSlot} 
                disabled={saving}
              >
                {saving ? <Loader size="sm" className="mr-2" /> : null}
                {saving ? "Добавление..." : "Добавить временной слот"}
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
              {dayNames.map((dayName, dayIndex) => {
                const dayNumber = dayIndex + 1;
                const daySlots = schedule.filter(slot => slot.dayOfWeek === dayNumber);
                
                return (
                  <Card key={dayNumber} className={daySlots.length > 0 ? "border-primary/20" : ""}>
                    <CardHeader className="px-3 py-2 border-b bg-muted/50">
                      <CardTitle className="text-base font-medium text-center">
                        {dayName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      {daySlots.length > 0 ? (
                        <div className="space-y-2">
                          {daySlots
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map(slot => (
                              <TimeSlotCard
                                key={slot.id}
                                slot={slot}
                                onToggle={toggleSlotAvailability}
                                onDelete={deleteTimeSlot}
                              />
                            ))
                          }
                        </div>
                      ) : (
                        <div className="py-4 text-center text-gray-500 text-sm">
                          Нет слотов
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          <Alert className="mt-6 bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-800">Подсказка</AlertTitle>
            <AlertDescription className="text-blue-700">
              Регулярное расписание повторяется каждую неделю. Чтобы отметить отдельные дни как выходные (например, праздники),
              используйте вкладку "Исключения".
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="exceptions">
          <Card>
            <CardHeader>
              <CardTitle>Добавить исключение в расписании</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="exception-date" className="block text-sm font-medium mb-2">
                    Выберите дату
                  </Label>
                  <div className="border rounded-md p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="border-0"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="exception-reason" className="block text-sm font-medium mb-2">
                    Причина исключения
                  </Label>
                  <Input
                    id="exception-reason"
                    placeholder="Например: Отпуск, Праздник, Личные дела"
                    value={exceptionReason}
                    onChange={(e) => setExceptionReason(e.target.value)}
                  />
                  
                  <Button 
                    className="mt-6" 
                    onClick={handleAddException} 
                    disabled={isAddingException || !selectedDate || !exceptionReason}
                  >
                    {isAddingException ? <Loader size="sm" className="mr-2" /> : null}
                    {isAddingException ? "Добавление..." : "Отметить как выходной день"}
                  </Button>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Правила исключений</h4>
                    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                      <li>Исключения отменяют регулярное расписание на указанный день</li>
                      <li>Ученики не смогут записаться на занятия в этот день</li>
                      <li>Исключения можно добавлять только на будущие даты</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Here would be a list of exceptions, but we'll implement that in future updates */}
          
          <Alert className="mt-6 bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Важно</AlertTitle>
            <AlertDescription className="text-amber-700">
              Добавление исключения отменяет все ваши занятия на выбранную дату. Используйте эту функцию,
              когда вы точно знаете, что не сможете провести занятия в указанный день.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};
