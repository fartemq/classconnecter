
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search } from "lucide-react";

export interface EmptySearchResultsProps {
  onFindNewStudents: () => void;
}

export const EmptySearchResults = ({ onFindNewStudents }: EmptySearchResultsProps) => {
  return (
    <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
        <Search className="h-6 w-6 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ученики не найдены</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        По вашему запросу не найдено ни одного ученика.
        Попробуйте изменить параметры поиска или проверьте позже.
      </p>
      <Button variant="outline" onClick={onFindNewStudents}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Обновить поиск
      </Button>
    </div>
  );
};
