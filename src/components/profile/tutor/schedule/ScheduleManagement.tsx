import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, Calendar as CalendarIcon, User, X } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useTutorSchedule } from "@/hooks/useTutorSchedule";
import { Loader } from "@/components/ui/loader";

const DAYS_OF_WEEK = [
  { value: 1, label: "Понедельник" },
  { value: 2, label: "Вторник" },
  { value: 3, label: "Среда" },
  { value: 4, label: "Четверг" },
  { value: 5, label: "Пятница" },
  { value: 6, label: "Суббота" },
  { value: 7, label: "Воскресенье" },
];

export const ScheduleManagement = () => {
  const { user } = useAuth();
  const { schedule, loading, saving, addTimeSlot, toggleSlotAvailability, deleteTimeSlot } = useTutorSchedule(user?.id || "");
  
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  });

  const handleAddSlot = async () => {
    if (!newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime) return;
    
    const success = await addTimeSlot(
      parseInt(newSlot.dayOfWeek),
      newSlot.startTime,
      newSlot.endTime
    );
    
    if (success) {
      setNewSlot({ dayOfWeek: "", startTime: "", endTime: "" });
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(day => day.value === dayOfWeek)?.label || "";
  };

  const groupedSchedule = schedule.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, typeof schedule>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Управление расписанием
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Time Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить новый временной слот
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dayOfWeek">День недели</Label>
              <Select 
                value={newSlot.dayOfWeek} 
                onValueChange={(value) => setNewSlot(prev => ({ ...prev, dayOfWeek: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите день" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startTime">Время начала</Label>
              <Input
                id="startTime"
                type="time"
                value={newSlot.startTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endTime">Время окончания</Label>
              <Input
                id="endTime"
                type="time"
                value={newSlot.endTime}
                onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddSlot}
                disabled={saving || !newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime}
                className="w-full"
              >
                {saving ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Текущее расписание
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSchedule).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Расписание не настроено</p>
              <p className="text-sm">Добавьте временные слоты, чтобы ученики могли записываться к вам на занятия</p>
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS_OF_WEEK.map((day) => {
                const daySlots = groupedSchedule[day.value] || [];
                if (daySlots.length === 0) return null;

                return (
                  <div key={day.value}>
                    <h3 className="font-medium text-lg mb-3">{day.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                            <Badge 
                              variant={slot.isAvailable ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {slot.isAvailable ? "Доступно" : "Заблокировано"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleSlotAvailability(slot.id, slot.isAvailable)}
                              className="text-xs"
                            >
                              {slot.isAvailable ? "Заблокировать" : "Разблокировать"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTimeSlot(slot.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
