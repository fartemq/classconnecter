
import React from "react";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface DocumentFileListProps {
  files: File[];
}

export const DocumentFileList: React.FC<DocumentFileListProps> = ({ files }) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div>
      <Label>Выбранные файлы ({files.length})</Label>
      <div className="mt-2 space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm">{file.name}</span>
            </div>
            <span className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
