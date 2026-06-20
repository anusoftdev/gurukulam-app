import { useQuery } from '@tanstack/react-query'
import { GraduationCap, BookOpen, UserCircle } from 'lucide-react'
import { getMyTeacherProfile, getMyStudents, getMyAssignments } from '../api/index.ts'
import StatCard from '../components/StatCard'

export default function TeacherDashboard() {
  const { data: profile } = useQuery({ queryKey: ['teacher-me'], queryFn: getMyTeacherProfile })
  const { data: students = [] } = useQuery({ queryKey: ['my-students'], queryFn: getMyStudents })
  const { data: assignments = [] } = useQuery({ queryKey: ['my-assignments'], queryFn: getMyAssignments })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.firstName ?? '…'}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your teaching overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="My Students" value={students.length}
                  icon={<GraduationCap className="w-6 h-6" />} color="green" />
        <StatCard label="Assigned Classes" value={assignments.length}
                  icon={<BookOpen className="w-6 h-6" />} color="blue" />
      </div>

      {/* Assignments */}
      {assignments.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">My Class Assignments</h2>
          <div className="space-y-2">
            {assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">{a.schoolClass.name}
                    {a.section ? ` — Section ${a.section.name}` : ''}</p>
                  <p className="text-sm text-gray-500">{a.subject}</p>
                </div>
                <span className="badge bg-brand-50 text-brand-700">{a.academicYear.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent students */}
      {students.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">
            My Students <span className="text-gray-400 font-normal">({students.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {['Name', 'Class', 'Admission No'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.slice(0, 10).map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{s.firstName} {s.lastName}</td>
                    <td className="px-3 py-2 text-gray-500">{s.schoolClass.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 10 && (
              <p className="text-xs text-gray-400 text-center py-2">
                Showing 10 of {students.length}. Go to My Students to see all.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
