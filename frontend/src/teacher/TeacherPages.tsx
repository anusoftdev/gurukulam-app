import { useQuery } from '@tanstack/react-query'
import { getMyTeacherProfile, getMyStudents } from '../api/index.ts'
import { UserCircle, Phone, Award, Calendar, GraduationCap } from 'lucide-react'

export function TeacherProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['teacher-me'], queryFn: getMyTeacherProfile
  })

  if (isLoading) return <div className="card animate-pulse h-64" />

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="card">
        <div className="flex items-center gap-5 pb-5 border-b">
          <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center
                          text-brand-700 text-3xl font-bold flex-shrink-0">
            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-gray-500 text-sm font-mono">@{profile?.user.username}</p>
            <span className="badge bg-brand-100 text-brand-700 mt-1">Teacher</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
          {profile?.employeeId && (
            <InfoRow icon={<UserCircle className="w-4 h-4" />} label="Employee ID" value={profile.employeeId} />
          )}
          {profile?.phone && (
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone} />
          )}
          {profile?.qualification && (
            <InfoRow icon={<Award className="w-4 h-4" />} label="Qualification" value={profile.qualification} />
          )}
          {profile?.joiningDate && (
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined"
              value={new Date(profile.joiningDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })} />
          )}
        </div>
      </div>
    </div>
  )
}

export function TeacherStudentsPage() {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['my-students'], queryFn: getMyStudents
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-500 text-sm">{students.length} students in your classes</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Adm. No', 'Name', 'Class', 'Gender', 'Parent', 'Phone'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
              )}
              {!isLoading && students.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-400">No students assigned yet.</p>
                  </td>
                </tr>
              )}
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.schoolClass.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.gender}</td>
                  <td className="px-4 py-3 text-gray-600">{s.parentName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.parentPhone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}
