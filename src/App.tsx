
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
import StudentSchedulePage from "./pages/StudentSchedulePage";
import StudentTutorsPage from "./pages/StudentTutorsPage";
import StudentFavoritesPage from "./pages/StudentFavoritesPage";
import StudentChatsPage from "./pages/StudentChatsPage";
import StudentHomeworkPage from "./pages/StudentHomeworkPage";
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
                
                {/* Student profile routes */}
                <Route path="/profile/student" element={<StudentProfilePage />}>
                  <Route path="schedule" element={<StudentSchedulePage />} />
                  <Route path="tutors" element={<StudentTutorsPage />} />
                  <Route path="favorites" element={<StudentFavoritesPage />} />
                  <Route path="chats" element={<StudentChatsPage />} />
                  <Route path="chats/:tutorId" element={<StudentChatsPage />} />
                  <Route path="homework" element={<StudentHomeworkPage />} />
                  <Route path="settings" element={<StudentSettingsPage />} />
                </Route>
                
                {/* Separate route for edit profile */}
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
