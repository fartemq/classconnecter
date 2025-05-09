
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Search } from 'lucide-react';

interface EmptyStudentsListProps {
  onCheckRequests?: () => void; // Make it optional to match the usage
}

export const EmptyStudentsList = ({ onCheckRequests }: EmptyStudentsListProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <UserPlus className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">Список учеников пуст</h3>
      <p className="text-center text-gray-500 mb-6 max-w-md">
        Пока у вас нет учеников. Вы можете найти новых учеников или проверить запросы, 
        которые отправили ученики.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Найти учеников
        </Button>
        
        {onCheckRequests && (
          <Button onClick={onCheckRequests} className="flex items-center gap-2">
            Проверить запросы
          </Button>
        )}
      </div>
    </div>
  );
};
