
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import { StudentStatusBadge } from "./StudentStatusBadge";
import { StudentRequestActions } from "./StudentRequestActions";
import { StudentRequest } from "@/types/student";

interface StudentRequestsTableProps {
  requests: StudentRequest[];
  onUpdateStatus: (requestId: string, status: 'accepted' | 'rejected' | 'completed') => void;
  onContact: (requestId: string) => void;
}

export const StudentRequestsTable = ({ 
  requests, 
  onUpdateStatus, 
  onContact 
}: StudentRequestsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ученик</TableHead>
          <TableHead>Предмет</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Дата</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">
              {request.student?.first_name} {request.student?.last_name}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                {request.subject?.name || 'Не указан'}
              </div>
            </TableCell>
            <TableCell>
              <StudentStatusBadge status={request.status} />
            </TableCell>
            <TableCell>
              {new Date(request.created_at).toLocaleDateString('ru-RU')}
            </TableCell>
            <TableCell className="text-right">
              <StudentRequestActions 
                status={request.status}
                onAccept={() => onUpdateStatus(request.id, 'accepted')}
                onReject={() => onUpdateStatus(request.id, 'rejected')}
                onComplete={() => onUpdateStatus(request.id, 'completed')}
                onContact={() => onContact(request.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
