import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save, BarChart2 } from 'lucide-react'
import {
  getMyAssignments, getStudentsForClass, getSubjectsTeacher,
  getResultsTeacher, saveResultsTeacher
} from '../api/index.ts'
import type { ExamType } from '../types/index.ts'
import { EXAM_TYPE_LABELS } from '../types/index.ts'

const EXAM_TYPES: ExamType[] = ['UNIT_TEST_1', 'UNIT_TEST_2', 'MIDTERM', 'FINAL']

export default function EnterResultsPage() {
  const qc = useQueryClient()
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [examType, setExamType] = useState<ExamType>('UNIT_TEST_1')
  const [marks, setMarks] = useState<Record<string, string>>({})

  const { data: assignments = [] } = useQuery({
    queryKey: ['my-assignments'], queryFn: getMyAssignments,
  })
  const assignedClasses = Array.from(
    new Map(assignments.map(a => [a.schoolClass.id, a.schoolClass])).values()
  )

  useEffect(() => {
    if (assignedClasses.length > 0 && selectedClassId === null) {
      setSelectedClassId(assignedClasses[0].id)
    }
  }, [assignedClasses.length])

  const classId = selectedClassId

  const { data: students = [] } = useQuery({
    queryKey: ['teacher-students-for-class', classId],
    queryFn: () => getStudentsForClass(classId!),
    enabled: classId !== null,
  })

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-teacher', classId],
    queryFn: () => getSubjectsTeacher(classId!),
    enabled: classId !== null,
  })

  const { data: existing = [] } = useQuery({
    queryKey: ['results-teacher', classId, examType],
    queryFn: () => getResultsTeacher(classId!, examType),
    enabled: classId !== null,
  })

  // Seed marks from existing results whenever they change
  useEffect(() => {
    const m: Record<string, string> = {}
    for (const r of existing) {
      m[`${r.student.id}_${r.subject.id}`] = String(r.marksObtained)
    }
    setMarks(m)
  }, [existing])

  const saveMut = useMutation({
    mutationFn: saveResultsTeacher,
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['results-teacher', classId, examType] })
      toast.success(`${count} results saved!`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save results'),
  })

  const handleSave = () => {
    if (!classId) return
    const results = students.flatMap(s =>
      subjects.map(sub => ({
        studentId: s.id, subjectId: sub.id,
        marksObtained: Number(marks[`${s.id}_${sub.id}`] ?? 0),
      }))
    )
    saveMut.mutate({ classId, examType, results })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Results</h1>
        <p className="text-gray-500 text-sm">Enter exam marks for your class</p>
      </div>

      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={classId ?? ''}
            onChange={e => { setSelectedClassId(Number(e.target.value)); setMarks({}) }}>
            {assignedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAM_TYPES.map(et => (
            <button key={et} onClick={() => { setExamType(et); setMarks({}) }}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                ${examType === et ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {EXAM_TYPE_LABELS[et]}
            </button>
          ))}
        </div>
      </div>

      {subjects.length === 0 && classId && (
        <div className="card py-14 text-center">
          <BarChart2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400">No subjects defined for this class.</p>
          <p className="text-gray-300 text-sm mt-1">Ask the admin to add subjects first.</p>
        </div>
      )}

      {classId && subjects.length > 0 && students.length > 0 && (
        <>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50 min-w-44">
                      Student
                    </th>
                    {subjects.map(s => (
                      <th key={s.id} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase min-w-28">
                        {s.name}<br />
                        <span className="font-normal text-gray-400">/{s.maxMarks}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 sticky left-0 bg-white">
                        <p className="font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-400 font-mono">{s.admissionNo}</p>
                      </td>
                      {subjects.map(sub => {
                        const key = `${s.id}_${sub.id}`
                        return (
                          <td key={sub.id} className="px-3 py-2 text-center">
                            <input
                              type="number" min={0} max={sub.maxMarks}
                              value={marks[key] ?? ''}
                              onChange={e => setMarks(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 text-sm
                                         focus:outline-none focus:ring-2 focus:ring-brand-500"
                              placeholder="—"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saveMut.isPending}
              className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saveMut.isPending ? 'Saving…' : 'Save Results'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
