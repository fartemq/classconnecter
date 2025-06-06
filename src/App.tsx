
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Import pages
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import TutorsPage from "@/pages/TutorsPage";
import SubjectsPage from "@/pages/SubjectsPage";
import AboutPage from "@/pages/AboutPage";
import BecomeTutorPage from "@/pages/BecomeTutorPage";
import NotFound from "@/pages/NotFound";
import PublicTutorProfilePage from "@/pages/PublicTutorProfilePage";
import TutorProfilePage from "@/pages/TutorProfilePage";
import TutorCompletePage from "@/pages/TutorCompletePage";
import StudentProfilePage from "@/pages/StudentProfilePage";
import StudentEditProfilePage from "@/pages/StudentEditProfilePage";
import StudentFindTutorsPage from "@/pages/StudentFindTutorsPage";
import StudentMyTutorsPage from "@/pages/StudentMyTutorsPage";
import StudentChatsPage from "@/pages/StudentChatsPage";
import StudentSchedulePage from "@/pages/StudentSchedulePage";
import StudentLessonRequestsPage from "@/pages/StudentLessonRequestsPage";
import StudentProgressPage from "@/pages/StudentProgressPage";
import StudentHomeworkPage from "@/pages/StudentHomeworkPage";
import StudentMaterialsPage from "@/pages/StudentMaterialsPage";
import StudentSettingsPage from "@/pages/StudentSettingsPage";
import StudentProfileEditPage from "@/pages/StudentProfileEditPage";
import ChooseSubjectPage from "@/pages/ChooseSubjectPage";
import SchoolStudentPage from "@/pages/SchoolStudentPage";
import AdultStudentPage from "@/pages/AdultStudentPage";
import HomeworkAssignmentPage from "@/pages/HomeworkAssignmentPage";
import HomeworkSubmissionPage from "@/pages/HomeworkSubmissionPage";
import HomeworkGradingPage from "@/pages/HomeworkGradingPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
              <Route path="/tutors" element={<TutorsPage />} />
              <Route path="/tutors/:id" element={<PublicTutorProfilePage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/subjects/:subject" element={<ChooseSubjectPage />} />
              <Route path="/subjects/:subject/school" element={<SchoolStudentPage />} />
              <Route path="/subjects/:subject/adult" element={<AdultStudentPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/become-tutor" element={<BecomeTutorPage />} />
              
              {/* Admin routes - only for admin and moderator */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'moderator']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
              </Route>
              
              {/* Tutor protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
                <Route path="/profile/tutor" element={<TutorProfilePage />} />
                <Route path="/profile/tutor/complete" element={<TutorCompletePage />} />
                <Route path="/homework/assignment/:id" element={<HomeworkAssignmentPage />} />
                <Route path="/homework/grading/:id" element={<HomeworkGradingPage />} />
              </Route>
              
              {/* Student protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/profile/student" element={<StudentProfilePage />} />
                <Route path="/profile/student/edit" element={<StudentEditProfilePage />} />
                <Route path="/profile/student/find-tutors" element={<StudentFindTutorsPage />} />
                <Route path="/profile/student/my-tutors" element={<StudentMyTutorsPage />} />
                <Route path="/profile/student/chats" element={<StudentChatsPage />} />
                <Route path="/profile/student/schedule" element={<StudentSchedulePage />} />
                <Route path="/profile/student/lesson-requests" element={<StudentLessonRequestsPage />} />
                <Route path="/profile/student/progress" element={<StudentProgressPage />} />
                <Route path="/profile/student/homework" element={<StudentHomeworkPage />} />
                <Route path="/profile/student/materials" element={<StudentMaterialsPage />} />
                <Route path="/profile/student/settings" element={<StudentSettingsPage />} />
                <Route path="/profile/student/profile-edit" element={<StudentProfileEditPage />} />
                <Route path="/homework/submission/:id" element={<HomeworkSubmissionPage />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
