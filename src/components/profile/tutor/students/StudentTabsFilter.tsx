
import React, { Dispatch, SetStateAction, KeyboardEvent } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export interface StudentTabsFilterProps {
  activeTab: string;
  searchQuery: string;
  onSearch?: () => Promise<void>;
  onResetFilters: () => void;
  showSearchButton?: boolean;
  onKeyPress?: (e: KeyboardEvent<HTMLInputElement>) => void;
  // Добавляем обязательные свойства
  onTabChange?: Dispatch<SetStateAction<string>> | ((tab: string) => void);
  onSearchChange?: Dispatch<SetStateAction<string>> | ((query: string) => void);
}

export const StudentTabsFilter = ({ 
  activeTab, 
  searchQuery, 
  onResetFilters,
  onSearch,
  showSearchButton = false,
  onKeyPress,
  onTabChange,
  onSearchChange
}: StudentTabsFilterProps) => {
  
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      if (typeof onTabChange === 'function') {
        onTabChange(value);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      if (typeof onSearchChange === 'function') {
        onSearchChange(e.target.value);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
          <TabsTrigger value="school" className="flex-1">Школьники</TabsTrigger>
          <TabsTrigger value="university" className="flex-1">Студенты</TabsTrigger>
          <TabsTrigger value="adult" className="flex-1">Взрослые</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Поиск по имени или предмету..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={onKeyPress}
          />
          {searchQuery && (
            <button
              onClick={onResetFilters}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {showSearchButton && onSearch && (
          <Button onClick={onSearch} size="sm" className="shrink-0">
            Поиск
          </Button>
        )}
      </div>
    </div>
  );
};
