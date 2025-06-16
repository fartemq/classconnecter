
import React from "react";
import { OptimizedLayout } from "@/components/layout/OptimizedLayout";
import { TutorProfileContent } from "@/components/profile/tutor/TutorProfileContent";

export const TutorProfileLayout: React.FC = React.memo(() => {
  return (
    <OptimizedLayout>
      <TutorProfileContent />
    </OptimizedLayout>
  );
});

TutorProfileLayout.displayName = "TutorProfileLayout";
