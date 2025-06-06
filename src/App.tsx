
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

// Tutor pages  
import TutorProfilePage from "./pages/TutorProfilePage";

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
                <Route path="/profile/student/*" element={<StudentProfilePage />} />
              </Route>
              
              {/* Protected routes for tutors */}
              <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
                <Route path="/profile/tutor/*" element={<TutorProfilePage />} />
                <Route path="/complete/tutor" element={<TutorCompletePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
