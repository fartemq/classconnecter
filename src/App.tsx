import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient } from 'react-query';

import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AboutPage from "@/pages/AboutPage";
import TutorsPage from "@/pages/TutorsPage";
import PublicTutorProfilePage from "@/pages/PublicTutorProfilePage";
import SubjectsPage from "@/pages/SubjectsPage";
import SchoolStudentPage from "@/pages/SchoolStudentPage";
import AdultStudentPage from "@/pages/AdultStudentPage";
import BecomeTutorPage from "@/pages/BecomeTutorPage";
import ChooseSubjectPage from "@/pages/ChooseSubjectPage";
import NotFound from "@/pages/NotFound";

import StudentProfilePage from "@/pages/StudentProfilePage";
import StudentEditProfilePage from "@/pages/StudentEditProfilePage";
import StudentProfileEditPage from "@/pages/StudentProfileEditPage";
import StudentFindTutorsPage from "@/pages/StudentFindTutorsPage";
import StudentMyTutorsPage from "@/pages/StudentMyTutorsPage";
import StudentLessonRequestsPage from "@/pages/StudentLessonRequestsPage";
import StudentSchedulePage from "@/pages/StudentSchedulePage";
import StudentHomeworkPage from "@/pages/StudentHomeworkPage";
import StudentMaterialsPage from "@/pages/StudentMaterialsPage";
import StudentProgressPage from "@/pages/StudentProgressPage";
import StudentSettingsPage from "@/pages/StudentSettingsPage";
import StudentChatsPage from "@/pages/StudentChatsPage";

import TutorProfilePage from "@/pages/TutorProfilePage";
import TutorCompletePage from "@/pages/TutorCompletePage";

import { AdminDashboardPage } from "@/pages/AdminDashboardPage";

import HomeworkAssignmentPage from "@/pages/HomeworkAssignmentPage";
import HomeworkSubmissionPage from "@/pages/HomeworkSubmissionPage";
import HomeworkGradingPage from "@/pages/HomeworkGradingPage";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/tutors" element={<TutorsPage />} />
            <Route path="/tutors/:tutorId" element={<PublicTutorProfilePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/school-student" element={<SchoolStudentPage />} />
            <Route path="/adult-student" element={<AdultStudentPage />} />
            <Route path="/become-tutor" element={<BecomeTutorPage />} />
            <Route path="/choose-subject" element={<ChooseSubjectPage />} />
            <Route path="/not-found" element={<NotFound />} />

            {/* Protected routes for students */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/profile" element={<StudentProfilePage />} />
              <Route path="/student/edit-profile" element={<StudentEditProfilePage />} />
              <Route path="/student/profile-edit" element={<StudentProfileEditPage />} />
              <Route path="/student/find-tutors" element={<StudentFindTutorsPage />} />
              <Route path="/student/my-tutors" element={<StudentMyTutorsPage />} />
              <Route path="/student/lesson-requests" element={<StudentLessonRequestsPage />} />
              <Route path="/student/schedule" element={<StudentSchedulePage />} />
              <Route path="/student/homework" element={<StudentHomeworkPage />} />
              <Route path="/student/materials" element={<StudentMaterialsPage />} />
              <Route path="/student/progress" element={<StudentProgressPage />} />
              <Route path="/student/settings" element={<StudentSettingsPage />} />
              <Route path="/student/chats" element={<StudentChatsPage />} />
              <Route path="/student/chats/:tutorId" element={<StudentChatsPage />} />
            </Route>

            {/* Protected routes for tutors */}
            <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
              <Route path="/tutor/profile" element={<TutorProfilePage />} />
              <Route path="/tutor/complete" element={<TutorCompletePage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'moderator']} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Homework routes */}
            <Route path="/homework/assignment/:homeworkId" element={<HomeworkAssignmentPage />} />
            <Route path="/homework/submission/:homeworkId" element={<HomeworkSubmissionPage />} />
            <Route path="/homework/grading/:homeworkId" element={<HomeworkGradingPage />} />

            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
