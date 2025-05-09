import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth";

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
import StudentSchedulePage from "./pages/StudentSchedulePage";
import StudentFindTutorsPage from "./pages/StudentFindTutorsPage";
import StudentMyTutorsPage from "./pages/StudentMyTutorsPage";
import StudentProfileEditPage from "./pages/StudentProfileEditPage";
import StudentProgressPage from "./pages/StudentProgressPage";
import StudentHomeworkPage from "./pages/StudentHomeworkPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import PublicTutorProfilePage from "./pages/PublicTutorProfilePage";
import SchoolStudentPage from "./pages/SchoolStudentPage";
import AdultStudentPage from "./pages/AdultStudentPage";
import BecomeTutorPage from "./pages/BecomeTutorPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// New homework pages
import HomeworkSubmissionPage from "./pages/HomeworkSubmissionPage";
import HomeworkAssignmentPage from "./pages/HomeworkAssignmentPage";
import HomeworkGradingPage from "./pages/HomeworkGradingPage";

// Add the import for the new page
import StudentMaterialsPage from "./pages/StudentMaterialsPage";

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
              <Route path="/tutors/:id" element={<PublicTutorProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Защищенные маршруты для студентов */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route path="/choose-subject" element={<ChooseSubjectPage />} />
                <Route path="/profile/student" element={<StudentProfilePage />} />
                <Route path="/profile/student/chats" element={<StudentChatsPage />} />
                <Route path="/profile/student/chats/:tutorId" element={<StudentChatsPage />} />
                <Route path="/profile/student/settings" element={<StudentSettingsPage />} />
                <Route path="/profile/student/edit" element={<StudentEditProfilePage />} />
                <Route path="/profile/student/schedule" element={<StudentSchedulePage />} />
                <Route path="/profile/student/find-tutors" element={<StudentFindTutorsPage />} />
                <Route path="/profile/student/my-tutors" element={<StudentMyTutorsPage />} />
                <Route path="/profile/student/profile" element={<StudentProfileEditPage />} />
                <Route path="/profile/student/progress" element={<StudentProgressPage />} />
                <Route path="/profile/student/homework" element={<StudentHomeworkPage />} />
                <Route path="/profile/student/homework/:homeworkId" element={<HomeworkSubmissionPage />} />
                <Route path="/profile/student/materials" element={<StudentMaterialsPage />} />
              </Route>
              
              {/* Защищенные маршруты для репетиторов */}
              <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                <Route path="/profile/tutor" element={<TutorProfilePage />} />
                <Route path="/profile/tutor/complete" element={<TutorCompletePage />} />
                <Route path="/profile/tutor/assign-homework/:studentId" element={<HomeworkAssignmentPage />} />
                <Route path="/profile/tutor/grade-homework/:homeworkId" element={<HomeworkGradingPage />} />
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
