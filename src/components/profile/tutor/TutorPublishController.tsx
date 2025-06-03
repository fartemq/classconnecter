
import React from "react";
import { ProfilePublishSection } from "./publish/ProfilePublishSection";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";

interface TutorPublishControllerProps {
  tutorId: string;
  isPublished?: boolean;
  onPublishStatusChange?: (status: boolean) => Promise<boolean>;
}

export const TutorPublishController = ({ 
  tutorId, 
  isPublished: initialStatus,
  onPublishStatusChange
}: TutorPublishControllerProps) => {
  const { 
    isPublished, 
    isValid, 
    missingFields, 
    warnings, 
    loading, 
    togglePublishStatus 
  } = useTutorPublishStatus(tutorId);

  const handleTogglePublish = async () => {
    if (onPublishStatusChange) {
      return await onPublishStatusChange(!isPublished);
    } else {
      return await togglePublishStatus();
    }
  };

  return (
    <ProfilePublishSection tutorId={tutorId} />
  );
};
