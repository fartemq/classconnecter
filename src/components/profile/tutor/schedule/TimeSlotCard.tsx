
import React from "react";
import { Button } from "@/components/ui/button";
import { formatTimeRange } from "@/utils/dateUtils";
import { TimeSlot } from "@/types/tutor";

interface TimeSlotCardProps {
  slot: TimeSlot;
  onToggle: (id: string, status: boolean) => void;
  onDelete: (id: string) => void;
}

export const TimeSlotCard = ({ slot, onToggle, onDelete }: TimeSlotCardProps) => {
  return (
    <div
      className={`p-2 rounded-md text-sm relative group ${
        slot.isAvailable
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {formatTimeRange(slot.startTime, slot.endTime)}
        </span>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2">
          <Button
            size="icon"
            variant="outline"
            className="h-6 w-6"
            onClick={() => onToggle(slot.id, slot.isAvailable)}
            title={slot.isAvailable ? "Заблокировать" : "Разблокировать"}
          >
            {slot.isAvailable ? (
              <span className="text-xs">🔒</span>
            ) : (
              <span className="text-xs">🔓</span>
            )}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="h-6 w-6"
            onClick={() => onDelete(slot.id)}
            title="Удалить"
          >
            <span className="text-xs">✕</span>
          </Button>
        </div>
      </div>
      <div className="text-xs mt-1 text-gray-600">
        {slot.isAvailable ? "Доступно" : "Заблокировано"}
      </div>
    </div>
  );
};
