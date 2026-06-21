import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save, BookOpen, BarChart2 } from 'lucide-react'
import {
  getClasses, getStudents, getSubjects, createSubject, deleteSubject,
  getResults, saveResultsAdmin
} from '../../api/index.ts'
import type { ExamType } from '../../types/index.ts'
import { EXAM_TYPE_LABELS } from '../../types/index.ts'

const EXAM_TYPES: ExamType[] = ['UNIT_TEST_1', 'UNIT_TEST_2', 'MIDTERM', 'FINAL']

type Tab = 'subjects' | 'results'

export default function ResultsPage() {
  const [tab, setTab] = useState<Tab>('subjects')
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'], queryFn: getClasses,
    placeholderData: [],
  })

  // auto-select first class
  const classId = selectedClassId ?? (classes[0]?.id ?? null)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subjects & Results</h1>
        <p className="text-gray-500 text-sm">Manage subjects per class, then enter exam results</p>
      </div>

      {/* Class selector + tab switcher */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Class</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={classId ?? ''}
            onChange={e => setSelectedClassId(Number(e.target.value))}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {(['subjects', 'results'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors
                ${tab === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'subjects' ? '📚 Subjects' : '📊 Results'}
            </button>
          ))}
        </div>
      </div>

      {classId && tab === 'subjects' && <SubjectsPanel classId={classId} />}
      {classId && tab === 'results' && <ResultsPanel classId={classId} />}
    </div>
  )
}

// ── Subjects panel ───────────────────────────────────────────────────────────

function SubjectsPanel({ classId }: { classId: number }) {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [maxMarks, setMaxMarks] = useState('100')

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => getSubjects(classId),
  })

  const addMut = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', classId] })
      setName('')
      toast.success('Subject added')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add subject'),
  })

  const delMut = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subjects', classId] })
      toast.success('Subject removed')
    },
  })

  return (
    <div className="space-y-4">
      {/* Add subject form */}
      <div className="card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-36">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Subject Name</label>
          <input className="input" placeholder="e.g. Mathematics"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="w-28">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Max Marks</label>
          <input className="input" type="number" min={1} max={200}
            value={maxMarks} onChange={e => setMaxMarks(e.target.value)} />
        </div>
        <button
          disabled={!name.trim() || addMut.isPending}
          onClick={() => addMut.mutate({ classId, name: name.trim(), maxMarks: Number(maxMarks) })}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Subject list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-10 text-center text-gray-400">Loading…</div>
        ) : subjects.length === 0 ? (
          <div className="py-14 text-center">
            <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400">No subjects yet. Add one above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Subject', 'Max Marks', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.maxMarks}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm(`Remove ${s.name}?`)) delMut.mutate(s.id) }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Results panel ────────────────────────────────────────────────────────────

function ResultsPanel({ classId }: { classId: number }) {
  const qc = useQueryClient()
  const [examType, setExamType] = useState<ExamType>('UNIT_TEST_1')
  // marks state: { [studentId_subjectId]: value }
  const [marks, setMarks] = useState<Record<string, string>>({})

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-class', classId],
    queryFn: () => getStudents(classId),
  })

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', classId],
    queryFn: () => getSubjects(classId),
  })

  // Load existing results
  const { data: existing = [] } = useQuery({
    queryKey: ['results-admin', classId, examType],
    queryFn: () => getResults(classId, examType),
  })

  // Seed marks from existing results — reset fully on each load (no stale merge)
  useEffect(() => {
    const m: Record<string, string> = {}
    for (const r of existing) {
      m[`${r.student.id}_${r.subject.id}`] = String(r.marksObtained)
    }
    setMarks(m)
  }, [existing])

  const saveMut = useMutation({
    mutationFn: saveResultsAdmin,
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['results-admin', classId, examType] })
      toast.success(`${count} results saved!`)
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to save results'),
  })

  const handleSave = () => {
    const results = students.flatMap(s =>
      subjects.map(sub => ({
        studentId: s.id,
        subjectId: sub.id,
        marksObtained: Number(marks[`${s.id}_${sub.id}`] ?? 0),
      }))
    )
    saveMut.mutate({ classId, examType, results })
  }

  if (subjects.length === 0) {
    return (
      <div className="card py-14 text-center">
        <BarChart2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
        <p className="text-gray-400">Add subjects first before entering results.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Exam type selector */}
      <div className="flex flex-wrap gap-2">
        {EXAM_TYPES.map(et => (
          <button key={et} onClick={() => { setExamType(et); setMarks({}) }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
              ${examType === et ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {EXAM_TYPE_LABELS[et]}
          </button>
        ))}
      </div>

      {/* Marks grid */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase sticky left-0 bg-gray-50 min-w-44">Student</th>
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
                    const val = marks[key] ?? ''
                    return (
                      <td key={sub.id} className="px-3 py-2 text-center">
                        <input
                          type="number" min={0} max={sub.maxMarks}
                          value={val}
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
    </div>
  )
}
