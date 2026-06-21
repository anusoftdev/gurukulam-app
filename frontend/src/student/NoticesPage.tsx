import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { getPublicNotices } from '../api/index.ts'

const CATEGORY_COLORS: Record<string, string> = {
  Academic: 'bg-blue-100 text-blue-700',
  Holiday:  'bg-green-100 text-green-700',
  General:  'bg-gray-100 text-gray-700',
  Exam:     'bg-orange-100 text-orange-700',
  Event:    'bg-purple-100 text-purple-700',
}

export default function StudentNoticesPage() {
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'], queryFn: getPublicNotices,
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
        <p className="text-gray-500 text-sm">{notices.length} notices from school</p>
      </div>

      {isLoading && [...Array(3)].map((_, i) => (
        <div key={i} className="card animate-pulse h-24 bg-gray-100" />
      ))}

      {!isLoading && notices.length === 0 && (
        <div className="card text-center py-14">
          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No notices at the moment.</p>
        </div>
      )}

      <div className="space-y-3">
        {notices.map(n => (
          <div key={n.id} className="card">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${CATEGORY_COLORS[n.category] ?? 'bg-gray-100 text-gray-700'}`}>
                {n.category}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{n.title}</h3>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{n.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
