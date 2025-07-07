
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SimpleAuthProvider } from "@/hooks/auth/SimpleAuthProvider";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import StudentProfilePage from "@/pages/StudentProfilePage";
import TutorProfilePage from "@/pages/TutorProfilePage";
import TutorCompletePage from "@/pages/TutorCompletePage";
import TutorsPage from "@/pages/TutorsPage";
import TutorSearchPage from "@/pages/TutorSearchPage";
import ChatPage from "@/pages/ChatPage";
import LessonPage from "@/pages/LessonPage";
import AboutPage from "@/pages/AboutPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
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
              <Route path="/search" element={<TutorSearchPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile/student/*" element={<StudentProfilePage />} />
                <Route path="/profile/tutor/*" element={<TutorProfilePage />} />
                <Route path="/profile/tutor/complete" element={<TutorCompletePage />} />
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
