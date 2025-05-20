
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, SearchIcon } from 'lucide-react';

interface SearchBarProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchText,
  onSearchChange,
  onSearch,
  onToggleFilters,
  showFilters
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Input
          placeholder="Поиск репетитора по имени или предмету"
          className="pr-10"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch();
            }
          }}
        />
        <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleFilters}
        className="flex-shrink-0"
      >
        <Filter size={18} />
      </Button>
      
      <Button onClick={onSearch} className="flex-shrink-0">
        Найти
      </Button>
    </div>
  );
};
