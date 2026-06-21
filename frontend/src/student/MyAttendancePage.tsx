import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, CalendarDays } from 'lucide-react'
import { getMyAttendance } from '../api/index.ts'
import type { AttendanceStatus } from '../types/index.ts'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT:  'bg-red-100 text-red-700',
  LATE:    'bg-yellow-100 text-yellow-700',
}

const STATUS_ICON: Record<AttendanceStatus, React.ReactNode> = {
  PRESENT: <CheckCircle className="w-3.5 h-3.5" />,
  ABSENT:  <XCircle className="w-3.5 h-3.5" />,
  LATE:    <Clock className="w-3.5 h-3.5" />,
}

export default function MyAttendancePage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['my-attendance', year, month],
    queryFn: () => getMyAttendance(year, month),
  })

  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const byDay: Record<number, AttendanceStatus> = {}
  for (const r of records) {
    byDay[new Date(r.date).getDate()] = r.status
  }

  const present = records.filter(r => r.status === 'PRESENT').length
  const absent  = records.filter(r => r.status === 'ABSENT').length
  const late    = records.filter(r => r.status === 'LATE').length
  const total   = records.length
  const pct     = total > 0 ? Math.round((present + late) * 100 / total) : null

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm">Your monthly attendance record</p>
      </div>

      {/* Month selector */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Month</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Year</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={year} onChange={e => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      {!isLoading && total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card text-center py-4">
            <p className="text-2xl font-bold text-green-600">{present}</p>
            <p className="text-xs text-gray-500 mt-1">Present</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-bold text-red-600">{absent}</p>
            <p className="text-xs text-gray-500 mt-1">Absent</p>
          </div>
          <div className="card text-center py-4">
            <p className="text-2xl font-bold text-yellow-600">{late}</p>
            <p className="text-xs text-gray-500 mt-1">Late</p>
          </div>
          <div className="card text-center py-4">
            <p className={`text-2xl font-bold ${pct !== null && pct >= 75 ? 'text-brand-600' : 'text-red-600'}`}>
              {pct !== null ? `${pct}%` : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Attendance %</p>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      {isLoading ? (
        <div className="card animate-pulse h-48" />
      ) : total === 0 ? (
        <div className="card py-16 text-center">
          <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No attendance recorded for {MONTHS[month - 1]} {year}.</p>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">{MONTHS[month - 1]} {year}</h2>
          <div className="grid grid-cols-7 gap-2">
            {days.map(d => {
              const status = byDay[d]
              return (
                <div key={d}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 min-h-14
                    ${status ? STATUS_COLOR[status] : 'bg-gray-50 text-gray-300'}`}>
                  <span className="text-xs font-bold">{d}</span>
                  {status && (
                    <span className="mt-1">{STATUS_ICON[status]}</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t text-xs">
            {(['PRESENT','ABSENT','LATE'] as AttendanceStatus[]).map(s => (
              <span key={s} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold ${STATUS_COLOR[s]}`}>
                {STATUS_ICON[s]} {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
