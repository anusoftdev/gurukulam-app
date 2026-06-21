import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, Save, CalendarDays, Users } from 'lucide-react'
import {
  getMyAssignments, getStudentsForClass, getAttendanceForClass, markAttendance
} from '../api/index.ts'
import type { AttendanceStatus } from '../types/index.ts'

type StatusMap = Record<number, AttendanceStatus>

const STATUS_CYCLE: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE']

function StatusBadge({
  status, onClick
}: { status: AttendanceStatus; onClick?: () => void }) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer select-none transition-all'
  if (status === 'PRESENT') return (
    <button onClick={onClick} className={`${base} bg-green-100 text-green-700 hover:bg-green-200`}>
      <CheckCircle className="w-4 h-4" /> Present
    </button>
  )
  if (status === 'ABSENT') return (
    <button onClick={onClick} className={`${base} bg-red-100 text-red-700 hover:bg-red-200`}>
      <XCircle className="w-4 h-4" /> Absent
    </button>
  )
  return (
    <button onClick={onClick} className={`${base} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`}>
      <Clock className="w-4 h-4" /> Late
    </button>
  )
}

export default function AttendancePage() {
  const qc = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [date, setDate] = useState(today)
  const [statusMap, setStatusMap] = useState<StatusMap>({})

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: getMyAssignments
  })

  // deduplicate classes from assignments
  const assignedClasses = Array.from(
    new Map(assignments.map(a => [a.schoolClass.id, a.schoolClass])).values()
  )

  useEffect(() => {
    if (assignedClasses.length > 0 && selectedClassId === null) {
      setSelectedClassId(assignedClasses[0].id)
    }
  }, [assignedClasses.length])

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['teacher-students-for-class', selectedClassId],
    queryFn: () => getStudentsForClass(selectedClassId!),
    enabled: selectedClassId !== null
  })

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['attendance', selectedClassId, date],
    queryFn: () => getAttendanceForClass(selectedClassId!, date),
    enabled: selectedClassId !== null && date !== '',
  })

  // Seed statusMap: existing records first, then default all unrecorded students to PRESENT
  useEffect(() => {
    const map: StatusMap = {}
    for (const s of students) {
      map[s.id] = 'PRESENT'
    }
    for (const rec of existingAttendance) {
      map[rec.student.id] = rec.status
    }
    setStatusMap(map)
  }, [students, existingAttendance])

  const mutation = useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      toast.success('Attendance saved!')
      qc.invalidateQueries({ queryKey: ['attendance', selectedClassId, date] })
    },
    onError: () => toast.error('Failed to save attendance')
  })

  const toggleStatus = (studentId: number) => {
    setStatusMap(prev => {
      const current = prev[studentId] ?? 'PRESENT'
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
      return { ...prev, [studentId]: next }
    })
  }

  const handleMarkAll = (status: AttendanceStatus) => {
    const map: StatusMap = {}
    for (const s of students) map[s.id] = status
    setStatusMap(map)
  }

  const handleSubmit = () => {
    if (!selectedClassId) return
    const records = students.map(s => ({
      studentId: s.id,
      status: statusMap[s.id] ?? 'PRESENT'
    }))
    mutation.mutate({ classId: selectedClassId, date, records })
  }

  const counts = students.reduce(
    (acc, s) => {
      const st = statusMap[s.id] ?? 'PRESENT'
      acc[st] = (acc[st] ?? 0) + 1
      return acc
    },
    {} as Record<AttendanceStatus, number>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm">Click a student's status badge to cycle through Present → Absent → Late</p>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Class
          </label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={selectedClassId ?? ''}
            onChange={e => setSelectedClassId(Number(e.target.value))}
            disabled={loadingAssignments}
          >
            {assignedClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
            Date
          </label>
          <input
            type="date"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
      </div>

      {selectedClassId && students.length > 0 && (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> {counts.PRESENT ?? 0} Present
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-semibold">
              <XCircle className="w-4 h-4" /> {counts.ABSENT ?? 0} Absent
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 text-sm font-semibold">
              <Clock className="w-4 h-4" /> {counts.LATE ?? 0} Late
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => handleMarkAll('PRESENT')}
                className="px-3 py-1.5 rounded-lg border border-green-200 text-green-700 text-xs font-semibold hover:bg-green-50">
                All Present
              </button>
              <button onClick={() => handleMarkAll('ABSENT')}
                className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50">
                All Absent
              </button>
            </div>
          </div>

          {/* Student list */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Users className="w-4 h-4" />
              {students.length} students — {date}
            </div>
            <div className="divide-y divide-gray-50">
              {loadingStudents ? (
                <div className="py-10 text-center text-gray-400">Loading students…</div>
              ) : (
                students.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <span className="w-6 text-xs text-gray-400 text-right">{idx + 1}</span>
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center
                                    text-brand-700 font-bold text-sm flex-shrink-0">
                      {s.firstName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{s.admissionNo}</p>
                    </div>
                    <StatusBadge
                      status={statusMap[s.id] ?? 'PRESENT'}
                      onClick={() => toggleStatus(s.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Saving…' : 'Save Attendance'}
            </button>
          </div>
        </>
      )}

      {selectedClassId && !loadingStudents && students.length === 0 && (
        <div className="card py-16 text-center">
          <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No students found in this class.</p>
        </div>
      )}

      {assignedClasses.length === 0 && !loadingAssignments && (
        <div className="card py-16 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No classes assigned to you yet.</p>
        </div>
      )}
    </div>
  )
}
