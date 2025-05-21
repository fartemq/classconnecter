
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface BioFormProps {
  bio: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const BioForm: React.FC<BioFormProps> = ({ bio, onInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">О себе</h3>
      <Textarea 
        id="bio" 
        name="bio" 
        value={bio || ""} 
        onChange={onInputChange} 
        placeholder="Расскажите немного о себе..."
        rows={4}
      />
    </div>
  );
};
