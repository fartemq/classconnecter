
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { TimeSlot } from '@/types/tutor';

interface TimeSlotCardProps {
  slot: TimeSlot;
  onToggle: (id: string, isAvailable: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  slot,
  onToggle,
  onDelete
}) => {
  const handleToggle = async () => {
    await onToggle(slot.id, slot.isAvailable);
  };

  const handleDelete = async () => {
    await onDelete(slot.id);
  };

  return (
    <div className={`p-1.5 border rounded-md ${slot.isAvailable ? 'bg-white border-primary/30' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium">
          {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
        </p>
        <div className="flex items-center gap-1">
          <Switch 
            checked={slot.isAvailable}
            onCheckedChange={handleToggle}
            size="sm"
            className="data-[state=checked]:bg-primary"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-gray-500 hover:text-red-500"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="mt-1 text-xs text-gray-500">
        {slot.isAvailable ? 'Доступен для записи' : 'Недоступен для записи'}
      </div>
    </div>
  );
};
