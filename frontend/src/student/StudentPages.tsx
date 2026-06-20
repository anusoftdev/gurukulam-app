import { useQuery } from '@tanstack/react-query'
import { getMyStudentProfile } from '../api/index.ts'
import { UserCircle, GraduationCap, Calendar, MapPin, Phone, Users } from 'lucide-react'

export function StudentDashboard() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student-me'], queryFn: getMyStudentProfile
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.firstName ?? '…'}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your student overview.</p>
      </div>

      {isLoading ? (
        <div className="card animate-pulse h-48" />
      ) : profile ? (
        <div className="card">
          <div className="flex items-center gap-5 pb-5 border-b">
            <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center
                            text-brand-700 text-3xl font-bold flex-shrink-0">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-500 text-sm font-mono">Adm: {profile.admissionNo}</p>
              <span className="badge bg-brand-100 text-brand-700 mt-1">
                {profile.schoolClass.name}{profile.section ? ` — ${profile.section.name}` : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth"
              value={new Date(profile.dob).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })} />
            <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Academic Year"
              value={profile.academicYear.label} />
            {profile.parentName && (
              <InfoRow icon={<Users className="w-4 h-4" />} label="Parent / Guardian"
                value={profile.parentName} />
            )}
            {profile.parentPhone && (
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Parent Phone"
                value={profile.parentPhone} />
            )}
            {profile.address && (
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address"
                value={profile.address} />
            )}
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Admission Date"
              value={new Date(profile.admissionDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })} />
          </div>
        </div>
      ) : (
        <div className="card text-center py-10 text-gray-400">
          Profile not found. Please contact your administrator.
        </div>
      )}
    </div>
  )
}

export function StudentProfilePage() {
  return <StudentDashboard />
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
