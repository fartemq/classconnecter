
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface StudentTabsFilterProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onSearch?: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showSearchButton?: boolean;
}

export const StudentTabsFilter = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
  onSearch,
  onKeyPress,
  showSearchButton = false
}: StudentTabsFilterProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-9 pr-10"
            placeholder="Поиск по имени, предмету..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={onKeyPress}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={onResetFilters}
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
        
        {showSearchButton && (
          <Button onClick={onSearch}>
            <Search className="h-4 w-4 mr-2" />
            Найти
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="school">Школьники</TabsTrigger>
          <TabsTrigger value="university">Студенты</TabsTrigger>
          <TabsTrigger value="adult">Взрослые</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
