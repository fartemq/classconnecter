
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SimpleAuthProvider } from "@/hooks/auth/SimpleAuthProvider";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import StudentProfilePage from "@/pages/StudentProfilePage";
import TutorProfilePage from "@/pages/TutorProfilePage";
import TutorCompleteProfilePage from "@/pages/TutorCompleteProfilePage";
import SearchTutorsPage from "@/pages/SearchTutorsPage";
import LessonPage from "@/pages/LessonPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/profile/student" element={<StudentProfilePage />} />
              <Route path="/profile/tutor" element={<TutorProfilePage />} />
              <Route path="/profile/tutor/complete" element={<TutorCompleteProfilePage />} />
              <Route path="/search" element={<SearchTutorsPage />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </SimpleAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
