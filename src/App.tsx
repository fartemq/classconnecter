
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "./pages/Index";
import TutorsPage from "./pages/TutorsPage";
import AboutPage from "./pages/AboutPage";
import SubjectsPage from "./pages/SubjectsPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChooseSubjectPage from "./pages/ChooseSubjectPage";
import TutorCompletePage from "./pages/TutorCompletePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentEditProfilePage from "./pages/StudentEditProfilePage";
import StudentChatsPage from "./pages/StudentChatsPage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import SchoolStudentPage from "./pages/SchoolStudentPage";
import AdultStudentPage from "./pages/AdultStudentPage";
import BecomeTutorPage from "./pages/BecomeTutorPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/school-student" element={<SchoolStudentPage />} />
              <Route path="/adult-student" element={<AdultStudentPage />} />
              <Route path="/become-tutor" element={<BecomeTutorPage />} />
              <Route path="/tutors" element={<TutorsPage />} />
              <Route path="/tutors/:id" element={<TutorProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/choose-subject" element={<ChooseSubjectPage />} />
                <Route path="/profile/tutor/complete" element={<TutorCompletePage />} />
                <Route path="/profile/tutor" element={<TutorProfilePage />} />
                
                {/* Student profile routes - обновлено, удалены ненужные маршруты */}
                <Route path="/profile/student" element={<StudentProfilePage />} />
                <Route path="/profile/student/chats" element={<StudentChatsPage />} />
                <Route path="/profile/student/chats/:tutorId" element={<StudentChatsPage />} />
                <Route path="/profile/student/settings" element={<StudentSettingsPage />} />
                <Route path="/profile/student/edit" element={<StudentEditProfilePage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
