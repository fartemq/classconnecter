
import React from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm, RegisterFormValues } from "@/components/auth/RegisterForm";
import { registerUser } from "@/services/authService";

const RegisterPage = () => {
  const navigate = useNavigate();

  async function handleRegisterSuccess(values: RegisterFormValues) {
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      // Show success message
      toast({
        title: "Регистрация успешна!",
        description: "Вы успешно зарегистрировались.",
      });

      // Redirect based on role
      if (values.role === "tutor") {
        navigate("/profile/tutor/complete");
      } else {
        navigate("/choose-subject");
      }
    } catch (error) {
      throw error; // Let the form component handle the error
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>
              Создайте аккаунт для использования платформы Stud.rep
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm onSuccess={handleRegisterSuccess} />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
