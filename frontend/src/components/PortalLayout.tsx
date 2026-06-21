import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Users, GraduationCap, School,
  LogOut, Menu, X, Bell, ChevronRight, UserCircle, CalendarCheck, BarChart2
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Role } from '../types/index.ts'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard',  to: '/admin/dashboard',  icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Students',   to: '/admin/students',   icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Teachers',   to: '/admin/teachers',   icon: <Users className="w-5 h-5" /> },
    { label: 'Classes',    to: '/admin/classes',    icon: <School className="w-5 h-5" /> },
    { label: 'Notices',    to: '/admin/notices',    icon: <Bell className="w-5 h-5" /> },
    { label: 'Attendance', to: '/admin/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'Results',    to: '/admin/results',    icon: <BarChart2 className="w-5 h-5" /> },
  ],
  TEACHER: [
    { label: 'Dashboard',    to: '/teacher/dashboard',   icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Profile',   to: '/teacher/profile',     icon: <UserCircle className="w-5 h-5" /> },
    { label: 'My Students',  to: '/teacher/students',    icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Attendance',   to: '/teacher/attendance',  icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'Results',      to: '/teacher/results',     icon: <BarChart2 className="w-5 h-5" /> },
  ],
  STUDENT: [
    { label: 'Dashboard',   to: '/student/dashboard',   icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Profile',  to: '/student/profile',     icon: <UserCircle className="w-5 h-5" /> },
    { label: 'Attendance',  to: '/student/attendance',  icon: <CalendarCheck className="w-5 h-5" /> },
    { label: 'My Results',  to: '/student/results',     icon: <BarChart2 className="w-5 h-5" /> },
    { label: 'Notices',     to: '/student/notices',     icon: <Bell className="w-5 h-5" /> },
  ],
}

export default function PortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = user ? NAV_ITEMS[user.role] : []
  const roleLabel = user?.role === 'ADMIN' ? 'Administrator'
    : user?.role === 'TEACHER' ? 'Teacher' : 'Student'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-brand-900 text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-brand-700">
        <div className="flex-shrink-0 w-9 h-9 bg-white rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-brand-700" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Gurukulam</p>
          <p className="text-brand-300 text-xs">School Portal</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-brand-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center
                          text-sm font-bold uppercase">
            {user?.username?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-brand-300">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               transition-colors duration-150
               ${isActive
                 ? 'bg-brand-600 text-white'
                 : 'text-brand-200 hover:bg-brand-700 hover:text-white'}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-brand-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-brand-200 hover:bg-brand-700 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 w-60 flex flex-col">
            <Sidebar />
          </div>
          <button
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800">Gurukulam</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
