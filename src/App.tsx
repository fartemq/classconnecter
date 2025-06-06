
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TutorCompletePage from "./pages/TutorCompletePage";
import SubjectPage from "./pages/SubjectPage";
import BecomeTutorPage from "./pages/BecomeTutorPage";

// Student pages
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentHomeworkPage from "./pages/StudentHomeworkPage";
import StudentSchedulePage from "./pages/StudentSchedulePage";
import StudentFindTutorsPage from "./pages/StudentFindTutorsPage";
import StudentMyTutorsPage from "./pages/StudentMyTutorsPage";
import StudentProgressPage from "./pages/StudentProgressPage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import StudentChatsPage from "./pages/StudentChatsPage";
import StudentProfileEditPage from "./pages/StudentProfileEditPage";
import StudentLessonRequestsPage from "./pages/StudentLessonRequestsPage";

// Tutor pages  
import TutorProfilePage from "./pages/TutorProfilePage";

// Admin pages
import { AdminDashboardPage } from "./pages/AdminDashboardPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/subjects/:subject/:level" element={<SubjectPage />} />
              <Route path="/become-tutor" element={<BecomeTutorPage />} />
              
              {/* Protected routes for students */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route path="/profile/student" element={<StudentProfilePage />} />
                <Route path="/profile/student/profile" element={<StudentProfileEditPage />} />
                <Route path="/profile/student/homework" element={<StudentHomeworkPage />} />
                <Route path="/profile/student/schedule" element={<StudentSchedulePage />} />
                <Route path="/profile/student/find-tutors" element={<StudentFindTutorsPage />} />
                <Route path="/profile/student/my-tutors" element={<StudentMyTutorsPage />} />
                <Route path="/profile/student/progress" element={<StudentProgressPage />} />
                <Route path="/profile/student/settings" element={<StudentSettingsPage />} />
                <Route path="/profile/student/chats" element={<StudentChatsPage />} />
                <Route path="/profile/student/chats/:tutorId" element={<StudentChatsPage />} />
                <Route path="/profile/student/lesson-requests" element={<StudentLessonRequestsPage />} />
              </Route>
              
              {/* Protected routes for tutors */}
              <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                <Route path="/profile/tutor/*" element={<TutorProfilePage />} />
                <Route path="/complete/tutor" element={<TutorCompletePage />} />
              </Route>
              
              {/* Protected routes for admin */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
