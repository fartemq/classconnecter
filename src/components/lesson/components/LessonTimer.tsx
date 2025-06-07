
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock,
  Coffee,
  BookOpen
} from "lucide-react";

export const LessonTimer = () => {
  const [time, setTime] = useState(1500); // 25 минут в секундах
  const [initialTime, setInitialTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break' | 'custom'>('work');
  const [customMinutes, setCustomMinutes] = useState(25);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,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');
      audio.play().catch(e => console.log('Could not play notification sound'));
    }
    
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
  };

  const setPreset = (preset: 'work' | 'break' | 'custom') => {
    setMode(preset);
    let newTime;
    switch (preset) {
      case 'work':
        newTime = 1500; // 25 минут
        break;
      case 'break':
        newTime = 300; // 5 минут
        break;
      case 'custom':
        newTime = customMinutes * 60;
        break;
    }
    setTime(newTime);
    setInitialTime(newTime);
    setIsRunning(false);
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      <div className="text-center">
        <div className="text-6xl font-mono font-bold mb-4">
          {formatTime(time)}
        </div>
        
        <Progress value={progress} className="w-64 h-2 mb-4" />
        
        <div className="flex space-x-2 mb-6">
          <Badge 
            variant={mode === 'work' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPreset('work')}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Работа (25м)
          </Badge>
          <Badge 
            variant={mode === 'break' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPreset('break')}
          >
            <Coffee className="h-3 w-3 mr-1" />
            Перерыв (5м)
          </Badge>
          <Badge 
            variant={mode === 'custom' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setPreset('custom')}
          >
            <Clock className="h-3 w-3 mr-1" />
            Свой
          </Badge>
        </div>
        
        {mode === 'custom' && (
          <div className="flex items-center space-x-2 mb-4">
            <Input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 1)}
              className="w-20 text-center"
              min="1"
              max="120"
            />
            <span>минут</span>
            <Button size="sm" onClick={() => setPreset('custom')}>
              Установить
            </Button>
          </div>
        )}
        
        <div className="flex space-x-3">
          <Button 
            onClick={isRunning ? pauseTimer : startTimer}
            size="lg"
            variant={isRunning ? "outline" : "default"}
          >
            {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
            {isRunning ? 'Пауза' : 'Старт'}
          </Button>
          
          <Button onClick={resetTimer} size="lg" variant="outline">
            <RotateCcw className="h-5 w-5 mr-2" />
            Сброс
          </Button>
        </div>
      </div>
    </div>
  );
};
