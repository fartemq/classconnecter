
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SimpleAuthProvider } from "@/hooks/auth/SimpleAuthProvider";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import { StudentProfileContent } from "@/components/profile/student/StudentProfileContent";
import TutorProfilePage from "@/pages/TutorProfilePage";
import TutorCompletePage from "@/pages/TutorCompletePage";
import TutorLessonsPage from "@/pages/TutorLessonsPage";
import TutorsPage from "@/pages/TutorsPage";
import TutorSearchPage from "@/pages/TutorSearchPage";
import ChatPage from "@/pages/ChatPage";
import LessonPage from "@/pages/LessonPage";
import AboutPage from "@/pages/AboutPage";
import StudentDashboardPage from "@/pages/StudentDashboardPage";
import TutorDashboardPage from "@/pages/TutorDashboardPage";
import PublicTutorProfilePage from "@/pages/PublicTutorProfilePage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import BookingPage from "@/pages/BookingPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/tutors" element={<TutorSearchPage />} />
              <Route path="/tutors/:id" element={<PublicTutorProfilePage />} />
              <Route path="/search" element={<TutorSearchPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard/student" element={<StudentDashboardPage />} />
                <Route path="/dashboard/tutor" element={<TutorDashboardPage />} />
                <Route path="/profile/student/*" element={<StudentProfileContent />} />
                <Route path="/profile/tutor/*" element={<TutorProfilePage />} />
                <Route path="/profile/tutor/complete" element={<TutorCompletePage />} />
                <Route path="/tutor/lessons" element={<TutorLessonsPage />} />
                <Route path="/lesson/:lessonId" element={<LessonPage />} />
                <Route path="/chat/:tutorId" element={<ChatPage />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/*" element={<AdminDashboardPage />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
