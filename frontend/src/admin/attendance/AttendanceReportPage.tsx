import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, Clock, BarChart2 } from 'lucide-react'
import { getClasses, getAttendanceReport } from '../../api/index.ts'
import type { AttendanceStatus, Student } from '../../types/index.ts'

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT:  'bg-red-100 text-red-700',
  LATE:    'bg-yellow-100 text-yellow-700',
}

const STATUS_ICON: Record<AttendanceStatus, React.ReactNode> = {
  PRESENT: <CheckCircle className="w-3 h-3" />,
  ABSENT:  <XCircle className="w-3 h-3" />,
  LATE:    <Clock className="w-3 h-3" />,
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export default function AttendanceReportPage() {
  const now = new Date()
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: getClasses,
  })

  useEffect(() => {
    if (classes.length > 0 && selectedClassId === null) {
      setSelectedClassId(classes[0].id)
    }
  }, [classes.length])

  const { data: records = [], isLoading: loadingReport } = useQuery({
    queryKey: ['attendance-report', selectedClassId, year, month],
    queryFn: () => getAttendanceReport(selectedClassId!, year, month),
    enabled: selectedClassId !== null,
  })

  // Build: { studentId → { day → status } }
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const studentMap = new Map<number, { student: Student; days: Record<number, AttendanceStatus> }>()
  for (const rec of records) {
    const dayNum = new Date(rec.date).getDate()
    if (!studentMap.has(rec.student.id)) {
      studentMap.set(rec.student.id, { student: rec.student, days: {} })
    }
    studentMap.get(rec.student.id)!.days[dayNum] = rec.status
  }

  const rows = Array.from(studentMap.values()).sort((a, b) =>
    a.student.firstName.localeCompare(b.student.firstName)
  )

  // Per-student summary
  const summary = (dayMap: Record<number, AttendanceStatus>) => {
    const p = Object.values(dayMap).filter(s => s === 'PRESENT').length
    const a = Object.values(dayMap).filter(s => s === 'ABSENT').length
    const l = Object.values(dayMap).filter(s => s === 'LATE').length
    const total = p + a + l
    return { p, a, l, total, pct: total > 0 ? Math.round((p + l) * 100 / total) : 0 }
  }

  const yearOptions = [year - 1, year, year + 1]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        <p className="text-gray-500 text-sm">Monthly class-wise attendance overview</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={selectedClassId ?? ''}
            onChange={e => setSelectedClassId(Number(e.target.value))}
            disabled={loadingClasses}
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Month</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Year</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loadingReport && (
        <div className="card animate-pulse h-40" />
      )}

      {!loadingReport && rows.length === 0 && selectedClassId && (
        <div className="card py-16 text-center">
          <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No attendance records for {MONTHS[month - 1]} {year}.</p>
          <p className="text-gray-300 text-sm mt-1">Teachers mark attendance from their portal.</p>
        </div>
      )}

      {!loadingReport && rows.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50 min-w-40">
                    Student
                  </th>
                  {days.map(d => (
                    <th key={d} className="px-1.5 py-3 text-center font-semibold text-gray-400 min-w-8">
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center font-semibold text-gray-500 min-w-24">P</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-500 min-w-24">A</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-500 min-w-24">L</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-500 min-w-24">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(({ student, days: dayMap }) => {
                  const s = summary(dayMap)
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 sticky left-0 bg-white hover:bg-gray-50">
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-gray-400 font-mono">{student.admissionNo}</p>
                      </td>
                      {days.map(d => {
                        const status = dayMap[d]
                        return (
                          <td key={d} className="px-1 py-2 text-center">
                            {status ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${STATUS_COLOR[status]}`}
                                    title={status}>
                                {status.charAt(0)}
                              </span>
                            ) : (
                              <span className="inline-block w-6 h-6 rounded bg-gray-50" />
                            )}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center font-semibold text-green-700">{s.p}</td>
                      <td className="px-3 py-2 text-center font-semibold text-red-700">{s.a}</td>
                      <td className="px-3 py-2 text-center font-semibold text-yellow-700">{s.l}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`font-bold ${s.pct >= 75 ? 'text-green-700' : 'text-red-700'}`}>
                          {s.pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 border-t bg-gray-50 flex flex-wrap gap-4 text-xs text-gray-500">
            {(['PRESENT','ABSENT','LATE'] as AttendanceStatus[]).map(s => (
              <span key={s} className={`flex items-center gap-1 px-2 py-1 rounded font-semibold ${STATUS_COLOR[s]}`}>
                {STATUS_ICON[s]} {s.charAt(0)} = {s}
              </span>
            ))}
            <span className="ml-auto text-gray-400">% = (Present + Late) / Total marked</span>
          </div>
        </div>
      )}
    </div>
  )
}
