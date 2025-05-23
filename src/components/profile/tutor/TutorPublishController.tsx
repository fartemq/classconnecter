
import React from "react";
import { ProfilePublishSection } from "./publish/ProfilePublishSection";

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
  return (
    <ProfilePublishSection tutorId={tutorId} />
  );
};
