
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export interface EmptyStudentsListProps {
  onCheckRequests?: () => void; // Make it optional
}

export const EmptyStudentsList = ({ onCheckRequests }: EmptyStudentsListProps) => {
  return (
    <div className="text-center py-10">
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Search className="h-6 w-6 text-slate-600" />
        </div>
        <h3 className="mt-3 text-lg font-medium">У вас пока нет учеников</h3>
        <p className="mt-2 text-sm text-gray-500">
          Начните поиск учеников или дождитесь, пока они сами пришлют вам запрос.
        </p>
        {onCheckRequests && (
          <div className="mt-4">
            <Button onClick={onCheckRequests} variant="outline">
              Проверить запросы
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
