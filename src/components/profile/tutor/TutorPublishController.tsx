
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { validateTutorProfile, publishTutorProfile, getTutorPublicationStatus } from "@/services/tutor";
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
  const [isPublished, setIsPublished] = useState(initialStatus);
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    missingFields: [] as string[],
    warnings: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Load profile status and validation data
  useEffect(() => {
    const checkStatus = async () => {
      if (!tutorId) return;
      
      try {
        setIsLoading(true);
        
        // Get publication status and validation results
        const statusResult = await getTutorPublicationStatus(tutorId);
        
        setIsPublished(statusResult.isPublished);
        setValidationResult({
          isValid: statusResult.isValid,
          missingFields: statusResult.missingFields,
          warnings: statusResult.warnings
        });
      } catch (error) {
        console.error("Error checking tutor publish status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkStatus();
  }, [tutorId]);
  
  // Handle publish status toggle
  const handleTogglePublish = async () => {
    setIsLoading(true);
    
    try {
      // If trying to publish, validate first
      if (!isPublished && !validationResult.isValid) {
        return false;
      }
      
      // Update publish status in database
      const success = await publishTutorProfile(tutorId, !isPublished);
      
      if (success) {
        // Notify parent component if callback provided
        if (onPublishStatusChange) {
          await onPublishStatusChange(!isPublished);
        }
        
        setIsPublished(!isPublished);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error toggling publish status:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ProfilePublishSection tutorId={tutorId} />
  );
};
