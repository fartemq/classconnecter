
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface RequestTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  getStatusCount: (status: string) => number;
}

export const RequestTabs = ({ 
  activeTab, 
  onTabChange, 
  getStatusCount 
}: RequestTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all" className="relative">
          Все
          <Badge className="ml-1 text-xs">{getStatusCount('all')}</Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" className="relative">
          Ожидающие
          <Badge variant="secondary" className="ml-1 text-xs bg-yellow-100">{getStatusCount('pending')}</Badge>
        </TabsTrigger>
        <TabsTrigger value="accepted" className="relative">
          Принятые
          <Badge variant="secondary" className="ml-1 text-xs bg-green-100">{getStatusCount('accepted')}</Badge>
        </TabsTrigger>
        <TabsTrigger value="rejected" className="relative">
          Отклоненные
          <Badge variant="secondary" className="ml-1 text-xs bg-red-100">{getStatusCount('rejected')}</Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
