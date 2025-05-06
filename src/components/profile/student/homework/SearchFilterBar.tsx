
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  subjectFilter: string;
  setSubjectFilter: (value: string) => void;
  subjects: string[];
}

export const SearchFilterBar = ({
  searchTerm,
  setSearchTerm,
  subjectFilter,
  setSubjectFilter,
  subjects,
}: SearchFilterBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Поиск по названию или предмету..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={subjectFilter} onValueChange={setSubjectFilter}>
        <SelectTrigger className="w-auto md:w-40">
          <SelectValue placeholder="Все предметы" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all_subjects">Все предметы</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
