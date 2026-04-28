/**
 * Main App component with routing
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Groups from './pages/Groups';
import Topics from './pages/Topics';
import Reports from './pages/Reports';
import Dashboard from './pages/Dashboard';
import Campuses from './pages/Campuses';
import Users from './pages/Users';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Settings from './pages/Settings';
import Roles from './pages/Roles';
import Suggestions from './pages/Suggestions';
import CalendarPage from './pages/Calendar';
import DoctrineCourses from './pages/DoctrineCourses';
import DoctrineLessons from './pages/DoctrineLessons';
import DoctrineEnrollments from './pages/DoctrineEnrollments';
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campuses"
            element={
              <ProtectedRoute>
                <Campuses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topics"
            element={
              <ProtectedRoute>
                <Topics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute module="settings">
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute module="roles">
                <Roles />
              </ProtectedRoute>
            }
          />

          <Route
            path="/suggestions"
            element={
              <ProtectedRoute module="suggestions">
                <Suggestions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute module="calendar">
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctrine/courses"
            element={
              <ProtectedRoute module="doctrine_courses">
                <DoctrineCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctrine/lessons"
            element={
              <ProtectedRoute module="doctrine_lessons">
                <DoctrineLessons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctrine/enrollments"
            element={
              <ProtectedRoute module="doctrine_enrollments">
                <DoctrineEnrollments />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
