
import React from "react";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { TutorPublishController } from "./TutorPublishController";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface ProfilePublishControlsProps {
  tutorId: string;
}

export const ProfilePublishControls: React.FC<ProfilePublishControlsProps> = ({ tutorId }) => {
  const { isPublished, loading, togglePublishStatus } = useTutorPublishStatus();

  if (loading) {
    return (
      <Card className="border-none">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TutorPublishController
      tutorId={tutorId}
      isPublished={isPublished}
      onPublishStatusChange={togglePublishStatus}
    />
  );
};
