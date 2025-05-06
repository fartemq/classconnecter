
import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  uniqueSubjects: string[];
}

export const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedLevel,
  setSelectedLevel,
  selectedSubject,
  setSelectedSubject,
  uniqueSubjects
}: SearchFiltersProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Поиск учеников</CardTitle>
        <CardDescription>
          Найдите новых учеников и отправьте им запрос на подключение
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Строка поиска */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Поиск по имени, предмету или городу" 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Фильтры */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Уровень обучения" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_levels">Все уровни</SelectItem>
                  <SelectItem value="Школьник">Школьник</SelectItem>
                  <SelectItem value="Студент">Студент</SelectItem>
                  <SelectItem value="Взрослый">Взрослый</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Предмет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_subjects">Все предметы</SelectItem>
                  {uniqueSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" title="Дополнительные фильтры">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
