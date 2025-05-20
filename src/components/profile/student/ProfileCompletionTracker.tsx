
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/profiles";
import { Progress } from "@/components/ui/progress";
import { Check, Pencil } from "lucide-react";
import { ProfileCompletionStep } from "@/hooks/profiles/types";

export const ProfileCompletionTracker = () => {
  const { profile, isLoading } = useProfile();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [steps, setSteps] = useState<ProfileCompletionStep[]>([
    { id: "about", title: "О себе", isCompleted: false, route: "/profile/student/edit" },
    { id: "education", title: "Учебное заведение", isCompleted: false, route: "/profile/student/edit?tab=education" },
    { id: "grade", title: "Класс/Курс", isCompleted: false, route: "/profile/student/edit?tab=education" },
  ]);

  useEffect(() => {
    if (!isLoading && profile) {
      console.log("Checking profile completion with data:", profile);
      
      // Get student-specific profile data safely
      const studentProfile = profile.student_profiles || {};
      console.log("Student profile data:", studentProfile);
      
      // Update completion status for each step
      const updatedSteps = steps.map((step) => {
        switch (step.id) {
          case "about":
            return { 
              ...step, 
              isCompleted: Boolean(
                profile.first_name && 
                profile.last_name && 
                profile.city
              ) 
            };
          case "education":
            return { 
              ...step, 
              isCompleted: Boolean(
                profile.educational_level || 
                profile.school || 
                (studentProfile && studentProfile.educational_level) || 
                (studentProfile && studentProfile.school)
              )
            };
          case "grade":
            return { 
              ...step, 
              isCompleted: Boolean(
                profile.grade || 
                (studentProfile && studentProfile.grade)
              )
            };
          default:
            return step;
        }
      });
      
      setSteps(updatedSteps);
      
      // Calculate completion percentage
      const completedCount = updatedSteps.filter(step => step.isCompleted).length;
      const newPercentage = Math.round((completedCount / updatedSteps.length) * 100);
      setCompletionPercentage(newPercentage);
      console.log("Profile completion percentage:", newPercentage, "Completed steps:", completedCount);
    }
  }, [profile, isLoading]);

  // Hide if all steps are completed or loading is still in progress
  if (isLoading || completionPercentage === 100) {
    console.log("ProfileCompletionTracker: Hidden due to loading or 100% completion");
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Заполнение профиля</h3>
      
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">Прогресс</p>
        <p className="text-sm font-medium">{completionPercentage}%</p>
      </div>
      
      <Progress value={completionPercentage} className="h-2 mb-6 bg-gray-100" />
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div 
            key={step.id}
            className="flex items-center justify-between border border-gray-100 p-3 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                step.isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}>
                {step.isCompleted ? (
                  <Check size={12} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span className={step.isCompleted ? "text-gray-900" : "text-gray-500"}>
                {step.title}
              </span>
            </div>
            
            <Link 
              to={step.route} 
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label={`Редактировать ${step.title}`}
            >
              <Pencil size={16} className="text-gray-500" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
