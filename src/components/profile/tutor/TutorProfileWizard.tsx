
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowLeft, ArrowRight, User, GraduationCap, BookOpen, DollarSign, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TutorFormValues } from "@/types/tutor";
import { Loader } from "@/components/ui/loader";

// Import step components
import { WizardPersonalStep } from "./wizard/WizardPersonalStep";
import { WizardEducationStep } from "./wizard/WizardEducationStep";
import { WizardTeachingStep } from "./wizard/WizardTeachingStep";
import { WizardSubjectsStep } from "./wizard/WizardSubjectsStep";
import { WizardPreviewStep } from "./wizard/WizardPreviewStep";

interface TutorProfileWizardProps {
  initialValues: Partial<TutorFormValues>;
  onSubmit: (values: TutorFormValues, avatarFile: File | null) => Promise<{
    success: boolean;
    avatarUrl: string | null;
    error?: any;
  }>;
  subjects: any[];
  isLoading: boolean;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isRequired: boolean;
}

export const TutorProfileWizard: React.FC<TutorProfileWizardProps> = ({
  initialValues,
  onSubmit,
  subjects,
  isLoading
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<TutorFormValues>>(initialValues);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isStepLoading, setIsStepLoading] = useState(false);
  const { toast } = useToast();

  const steps: Step[] = [
    {
      id: "personal",
      title: "Личная информация",
      description: "Расскажите о себе",
      icon: User,
      isCompleted: !!(formData.firstName && formData.lastName && formData.city && formData.bio),
      isRequired: true
    },
    {
      id: "education",
      title: "Образование",
      description: "Ваш образовательный фон",
      icon: GraduationCap,
      isCompleted: !!(formData.educationInstitution && formData.degree),
      isRequired: true
    },
    {
      id: "teaching",
      title: "Методика преподавания",
      description: "Ваш подход к обучению",
      icon: BookOpen,
      isCompleted: !!(formData.methodology && formData.experience !== undefined),
      isRequired: true
    },
    {
      id: "subjects",
      title: "Предметы и цены",
      description: "Что и за сколько вы преподаете",
      icon: DollarSign,
      isCompleted: !!(formData.subjects && formData.subjects.length > 0 && formData.hourlyRate),
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

  const handleStepData = (stepData: Partial<TutorFormValues>, avatar?: File | null) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (avatar !== undefined) {
      setAvatarFile(avatar);
    }
  };

  const handleNext = async () => {
    // Validate current step
    if (!validateCurrentStep()) {
      toast({
        title: "Заполните обязательные поля",
        description: "Пожалуйста, заполните все необходимые поля перед переходом к следующему шагу",
        variant: "destructive",
      });
      return;
    }

    // Save current step data
    setIsStepLoading(true);
    try {
      const result = await onSubmit(formData as TutorFormValues, avatarFile);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update avatar URL if it was uploaded
      if (result.avatarUrl) {
        setFormData(prev => ({ ...prev, avatarUrl: result.avatarUrl }));
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
      const result = await onSubmit(formData as TutorFormValues, avatarFile);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Профиль успешно создан!",
        description: "Теперь вы можете опубликовать профиль и начать работу с учениками",
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

  const validateCurrentStep = (): boolean => {
    const step = steps[currentStep];
    return step.isCompleted || !step.isRequired;
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "personal":
        return (
          <WizardPersonalStep
            data={formData}
            onDataChange={handleStepData}
            avatarFile={avatarFile}
          />
        );
      case "education":
        return (
          <WizardEducationStep
            data={formData}
            onDataChange={handleStepData}
          />
        );
      case "teaching":
        return (
          <WizardTeachingStep
            data={formData}
            onDataChange={handleStepData}
          />
        );
      case "subjects":
        return (
          <WizardSubjectsStep
            data={formData}
            onDataChange={handleStepData}
            subjects={subjects}
          />
        );
      case "preview":
        return (
          <WizardPreviewStep
            data={formData as TutorFormValues}
            subjects={subjects}
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
              <CardTitle className="text-2xl">Создание профиля репетитора</CardTitle>
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
        <div className="flex items-center space-x-4 bg-muted/30 p-4 rounded-lg">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.isCompleted;
            const isPast = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
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
              disabled={isStepLoading || isLoading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {(isStepLoading || isLoading) && <Loader size="sm" className="mr-2" />}
              <span>Завершить создание профиля</span>
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isStepLoading || !validateCurrentStep()}
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
