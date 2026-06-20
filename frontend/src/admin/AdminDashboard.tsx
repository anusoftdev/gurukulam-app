import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Users, School, Calendar, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboardStats, getPublicNotices } from '../api/index.ts'
import StatCard from '../components/StatCard'

export default function AdminDashboard() {

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: getPublicNotices,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Here's what's happening at Gurukulam.
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students"  value={stats?.totalStudents ?? 0}
                    icon={<GraduationCap className="w-6 h-6" />} color="green" />
          <StatCard label="Total Teachers"  value={stats?.totalTeachers ?? 0}
                    icon={<Users className="w-6 h-6" />}         color="blue" />
          <StatCard label="Classes"         value={stats?.totalClasses ?? 0}
                    icon={<School className="w-6 h-6" />}        color="purple" />
          <StatCard label="Academic Year"   value={stats?.currentYear ?? '—'}
                    icon={<Calendar className="w-6 h-6" />}      color="orange" />
        </div>
      )}

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Add Student', to: '/admin/students?add=1',  icon: <GraduationCap className="w-5 h-5" />, color: 'bg-green-100 text-green-700' },
            { label: 'Add Teacher', to: '/admin/teachers?add=1',  icon: <Users className="w-5 h-5" />,         color: 'bg-blue-100 text-blue-700' },
            { label: 'Post Notice', to: '/admin/notices?add=1',   icon: <Bell className="w-5 h-5" />,          color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Manage Classes', to: '/admin/classes',      icon: <School className="w-5 h-5" />,        color: 'bg-purple-100 text-purple-700' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100
                         hover:border-gray-200 hover:shadow-sm transition-all text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                {a.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent notices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Notices</h2>
          <Link to="/admin/notices" className="text-sm text-brand-600 hover:underline">View all</Link>
        </div>
        {!notices?.length ? (
          <p className="text-gray-400 text-sm py-4 text-center">No notices posted yet.</p>
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 5).map(n => (
              <div key={n.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                <span className="badge bg-blue-50 text-blue-700 mt-0.5">{n.category}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
