
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
  isPublished: initialStatus = false,
  onPublishStatusChange
}: TutorPublishControllerProps) => {
  // We simply pass through to the ProfilePublishSection now
  return (
    <ProfilePublishSection tutorId={tutorId} />
  );
};
