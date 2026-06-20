import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import LoginPage from './auth/LoginPage'
import PortalLayout from './components/PortalLayout'

// Admin pages
import AdminDashboard from './admin/AdminDashboard'
import StudentsPage from './admin/students/StudentsPage'
import TeachersPage from './admin/teachers/TeachersPage'
import ClassesPage from './admin/classes/ClassesPage'
import NoticesPage from './admin/notices/NoticesPage'
import AttendanceReportPage from './admin/attendance/AttendanceReportPage'

// Teacher pages
import TeacherDashboard from './teacher/TeacherDashboard'
import { TeacherProfilePage, TeacherStudentsPage } from './teacher/TeacherPages'
import AttendancePage from './teacher/AttendancePage'

// Student pages
import { StudentDashboard, StudentProfilePage } from './student/StudentPages'

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN')   return <Navigate to="/admin/dashboard"   replace />
  if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />
  return <Navigate to="/student/dashboard" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl font-bold text-gray-200">403</p>
            <p className="text-gray-500 mt-2">You don't have access to this page.</p>
          </div>
        </div>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <PortalLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students"  element={<StudentsPage />} />
        <Route path="teachers"  element={<TeachersPage />} />
        <Route path="classes"   element={<ClassesPage />} />
        <Route path="notices"    element={<NoticesPage />} />
        <Route path="attendance" element={<AttendanceReportPage />} />
      </Route>

      {/* Teacher routes */}
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={['TEACHER']}>
          <PortalLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile"   element={<TeacherProfilePage />} />
        <Route path="students"   element={<TeacherStudentsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <PortalLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile"   element={<StudentProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
