
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight, User, GraduationCap, BookOpen, Target, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { useStudentProfile } from "@/hooks/profiles/student";

// Import step components
import { StudentPersonalStep } from "./wizard/StudentPersonalStep";
import { StudentEducationStep } from "./wizard/StudentEducationStep";
import { StudentSubjectsStep } from "./wizard/StudentSubjectsStep";
import { StudentGoalsStep } from "./wizard/StudentGoalsStep";
import { StudentPreviewStep } from "./wizard/StudentPreviewStep";

interface StudentFormValues {
  first_name?: string;
  last_name?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  educational_level?: string;
  school?: string;
  grade?: string;
  subjects?: string[];
  preferred_format?: string[];
  learning_goals?: string;
  budget?: number;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isRequired: boolean;
}

export const StudentProfileWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<StudentFormValues>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const { toast } = useToast();
  const { updateProfile, profile } = useStudentProfile();

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        city: profile.city || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        educational_level: profile.student_profiles?.educational_level || '',
        school: profile.student_profiles?.school || '',
        grade: profile.student_profiles?.grade || '',
        subjects: profile.student_profiles?.subjects || [],
        preferred_format: profile.student_profiles?.preferred_format || [],
        learning_goals: profile.student_profiles?.learning_goals || '',
        budget: profile.student_profiles?.budget || 1000
      });
    }
  }, [profile]);

  const validateStep = (stepIndex: number, data: StudentFormValues): boolean => {
    switch (stepIndex) {
      case 0: // Personal info
        return !!(data.first_name && data.last_name && data.city && data.bio);
      case 1: // Education  
        return !!(data.educational_level && data.school);
      case 2: // Subjects
        return !!(data.subjects && data.subjects.length > 0 && data.preferred_format && data.preferred_format.length > 0);
      case 3: // Goals
        return !!(data.learning_goals && data.budget);
      default:
        return true;
    }
  };

  const steps: Step[] = [
    {
      id: "personal",
      title: "Личная информация",
      description: "Расскажите о себе",
      icon: User,
      isCompleted: validateStep(0, formData),
      isRequired: true
    },
    {
      id: "education",
      title: "Образование",
      description: "Ваш уровень образования",
      icon: GraduationCap,
      isCompleted: validateStep(1, formData),
      isRequired: true
    },
    {
      id: "subjects",
      title: "Предметы и формат",
      description: "Что хотите изучать",
      icon: BookOpen,
      isCompleted: validateStep(2, formData),
      isRequired: true
    },
    {
      id: "goals",
      title: "Цели и бюджет",
      description: "Ваши цели обучения",
      icon: Target,
      isCompleted: validateStep(3, formData),
      isRequired: true
    },
    {
      id: "preview",
      title: "Предварительный просмотр",
      description: "Проверьте ваш профиль",
      icon: Eye,
      isCompleted: false,
      isRequired: true
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleStepData = (stepData: Partial<StudentFormValues>, avatar?: File | null) => {
    console.log("Updating form data:", stepData);
    setFormData(prev => ({ ...prev, ...stepData }));
    if (avatar !== undefined) {
      setAvatarFile(avatar);
    }
  };

  const handleNext = async () => {
    console.log("Current form data before validation:", formData);
    console.log("Validating step:", currentStep);
    
    if (!validateStep(currentStep, formData)) {
      toast({
        title: "Заполните обязательные поля",
        description: "Пожалуйста, заполните все необходимые поля перед переходом к следующему шагу",
        variant: "destructive",
      });
      return;
    }

    setIsStepLoading(true);
    try {
      console.log("Saving data for step:", currentStep, formData);
      const success = await updateProfile(formData);
      if (!success) {
        throw new Error("Failed to save profile data");
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        toast({
          title: "Данные сохранены",
          description: "Переходим к следующему шагу",
        });
      }
    } catch (error) {
      console.error("Error saving step:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить данные, попробуйте еще раз",
        variant: "destructive",
      });
    } finally {
      setIsStepLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsStepLoading(true);
    try {
      console.log("Final save with data:", formData);
      const success = await updateProfile(formData);
      if (!success) {
        throw new Error("Failed to save profile data");
      }
      
      toast({
        title: "Профиль успешно создан!",
        description: "Теперь вы можете найти репетиторов и записаться на занятия",
      });
    } catch (error) {
      console.error("Error finishing wizard:", error);
      toast({
        title: "Ошибка завершения",
        description: "Не удалось завершить создание профиля",
        variant: "destructive",
      });
    } finally {
      setIsStepLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "personal":
        return (
          <StudentPersonalStep
            data={formData}
            onDataChange={handleStepData}
            avatarFile={avatarFile}
          />
        );
      case "education":
        return (
          <StudentEducationStep
            data={formData}
            onDataChange={handleStepData}
          />
        );
      case "subjects":
        return (
          <StudentSubjectsStep
            data={formData}
            onDataChange={handleStepData}
          />
        );
      case "goals":
        return (
          <StudentGoalsStep
            data={formData}
            onDataChange={handleStepData}
          />
        );
      case "preview":
        return (
          <StudentPreviewStep
            data={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Header */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Создание профиля ученика</CardTitle>
              <p className="text-muted-foreground mt-1">
                Шаг {currentStep + 1} из {steps.length}: {currentStepData.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">завершено</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Steps Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 bg-muted/30 p-4 rounded-lg overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.isCompleted;
            const isPast = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${isActive 
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-110' 
                      : isCompleted || isPast
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground bg-background text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted || isPast ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${isPast ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <currentStepData.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isStepLoading}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </Button>

        <div className="flex space-x-2">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={isStepLoading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {isStepLoading && <Loader size="sm" className="mr-2" />}
              <span>Завершить создание профиля</span>
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isStepLoading}
              className="flex items-center space-x-2"
            >
              {isStepLoading && <Loader size="sm" className="mr-2" />}
              <span>Далее</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
