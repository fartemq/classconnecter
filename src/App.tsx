
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TutorProfilePage from "./pages/TutorProfilePage";
import { LessonPage } from "./pages/LessonPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import SchoolStudentPage from "./pages/SchoolStudentPage";
import AdultStudentPage from "./pages/AdultStudentPage";
import BecomeTutorPage from "./pages/BecomeTutorPage";

// Student Profile Pages
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import StudentSchedulePage from "./pages/StudentSchedulePage";
import StudentProgressPage from "./pages/StudentProgressPage";
import StudentProfileEditPage from "./pages/StudentProfileEditPage";
import StudentMyTutorsPage from "./pages/StudentMyTutorsPage";
import StudentHomeworkPage from "./pages/StudentHomeworkPage";
import StudentFindTutorsPage from "./pages/StudentFindTutorsPage";
import StudentNotificationsPage from "./pages/StudentNotificationsPage";
import StudentLessonRequestsPage from "./pages/StudentLessonRequestsPage";
import StudentMaterialsPage from "./pages/StudentMaterialsPage";
import StudentChatsPage from "./pages/StudentChatsPage";
import StudentEditProfilePage from "./pages/StudentEditProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Role selection pages */}
            <Route path="/school-student" element={<SchoolStudentPage />} />
            <Route path="/adult-student" element={<AdultStudentPage />} />
            <Route path="/become-tutor" element={<BecomeTutorPage />} />
            
            {/* Protected routes */}
            <Route path="/profile/tutor/*" element={<ProtectedRoute allowedRoles={["tutor"]} />}>
              <Route index element={<TutorProfilePage />} />
            </Route>
            
            {/* Student profile routes */}
            <Route path="/profile/student/*" element={<ProtectedRoute allowedRoles={["student"]} />}>
              <Route index element={<StudentProfilePage />} />
              <Route path="settings" element={<StudentSettingsPage />} />
              <Route path="schedule" element={<StudentSchedulePage />} />
              <Route path="progress" element={<StudentProgressPage />} />
              <Route path="profile" element={<StudentProfileEditPage />} />
              <Route path="my-tutors" element={<StudentMyTutorsPage />} />
              <Route path="homework" element={<StudentHomeworkPage />} />
              <Route path="find-tutors" element={<StudentFindTutorsPage />} />
              <Route path="notifications" element={<StudentNotificationsPage />} />
              <Route path="lesson-requests" element={<StudentLessonRequestsPage />} />
              <Route path="materials" element={<StudentMaterialsPage />} />
              <Route path="chats" element={<StudentChatsPage />} />
              <Route path="chats/:tutorId" element={<StudentChatsPage />} />
              <Route path="edit-profile" element={<StudentEditProfilePage />} />
            </Route>
            
            {/* Admin route */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin", "moderator"]} />}>
              <Route index element={<AdminDashboardPage />} />
            </Route>
            
            {/* Lesson interface route */}
            <Route path="/lesson/:lessonId" element={<ProtectedRoute />}>
              <Route index element={<LessonPage />} />
            </Route>
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
