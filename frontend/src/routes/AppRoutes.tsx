import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.js';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage.js';
import { RegisterPage } from '../pages/auth/RegisterPage.js';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.js';
import { AcademicStructurePage } from '../pages/admin/AcademicStructurePage.js';
import { PeopleManagementPage } from '../pages/admin/PeopleManagementPage.js';
import { FormBuilderPage } from '../pages/admin/FormBuilderPage.js';
import { FormsListPage } from '../pages/admin/FormsListPage.js';
import { FormResponsesPage } from '../pages/admin/FormResponsesPage.js';
import { AnalyticsPage } from '../pages/admin/AnalyticsPage.js';
import { ReportsPage } from '../pages/admin/ReportsPage.js';
import { ComplaintsManagementPage } from '../pages/admin/ComplaintsManagementPage.js';
import { SettingsPage } from '../pages/admin/SettingsPage.js';

// Teacher Pages
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage.js';
import { TeacherFormsPage } from '../pages/teacher/TeacherFormsPage.js';
import { TeacherAttendancePage } from '../pages/teacher/TeacherAttendancePage.js';
import { TeacherFeedbackPage } from '../pages/teacher/TeacherFeedbackPage.js';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage.js';
import { StudentFormsPage } from '../pages/student/StudentFormsPage.js';
import { StudentFormFillPage } from '../pages/student/StudentFormFillPage.js';
import { StudentAttendancePage } from '../pages/student/StudentAttendancePage.js';
import { StudentRemarksPage } from '../pages/student/StudentRemarksPage.js';

// Parent Pages
import { ParentDashboardPage } from '../pages/parent/ParentDashboardPage.js';
import { ParentAttendancePage } from '../pages/parent/ParentAttendancePage.js';
import { ParentFeedbackPage } from '../pages/parent/ParentFeedbackPage.js';
import { ParentSurveyPage } from '../pages/parent/ParentSurveyPage.js';

// Common Pages
import { ComplaintsPage } from '../pages/common/ComplaintsPage.js';
import { ProfilePage } from '../pages/common/ProfilePage.js';
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage.js';
import { NotFoundPage } from '../pages/common/NotFoundPage.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication state..." fullScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Loading your portal..." fullScreen />;
  if (!token || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent" replace />;
  return <Navigate to="/student" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root Role Dispatcher */}
      <Route path="/" element={<RootRedirect />} />

      {/* Authenticated Dashboard Shell */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/academics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AcademicStructurePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/people"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <PeopleManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FormBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FormsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms/:id/responses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FormResponsesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/forms/:id/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TeacherAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ComplaintsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* TEACHER ROUTES */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/feedback"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherFormsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/evaluations"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <TeacherFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/complaints"
          element={
            <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
              <ComplaintsPage />
            </ProtectedRoute>
          }
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/forms"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentFormsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/forms/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentFormFillPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/remarks"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <StudentRemarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
              <ComplaintsPage />
            </ProtectedRoute>
          }
        />

        {/* PARENT ROUTES */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/attendance"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/feedback"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentFeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/survey"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ParentSurveyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/complaints"
          element={
            <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
              <ComplaintsPage />
            </ProtectedRoute>
          }
        />

        {/* SHARED COMMON ROUTES */}
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
