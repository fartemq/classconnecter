
import React from "react";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { TutorPublishController } from "./TutorPublishController";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfilePublishControlsProps {
  tutorId: string;
}

export const ProfilePublishControls: React.FC<ProfilePublishControlsProps> = ({ tutorId }) => {
  const { isPublished, isLoading, togglePublishStatus } = useTutorPublishStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-36" />
      </div>
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
