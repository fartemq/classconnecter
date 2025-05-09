
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export interface EmptySearchResultsProps {
  searchQuery?: string;
  onReset: () => void;
}

export const EmptySearchResults = ({ searchQuery = "", onReset }: EmptySearchResultsProps) => {
  return (
    <div className="text-center py-10">
      <div className="bg-slate-50 rounded-lg p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Search className="h-6 w-6 text-slate-600" />
        </div>
        <h3 className="mt-3 text-lg font-medium">Нет результатов</h3>
        <p className="mt-2 text-sm text-gray-500">
          По запросу "{searchQuery}" ничего не найдено. Попробуйте изменить критерии поиска.
        </p>
        <div className="mt-4">
          <Button onClick={onReset} variant="outline">
            Сбросить поиск
          </Button>
        </div>
      </div>
    </div>
  );
};
