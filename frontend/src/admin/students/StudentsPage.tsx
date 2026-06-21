import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, UserX, Key } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getStudents, getClasses, getSections, createStudent, deactivateStudent, resetStudentPassword
} from '../../api/index.ts'
import type { Student, SchoolClass, Section } from '../../types/index.ts'
import Modal from '../../components/Modal'
import CredentialCard from '../../components/CredentialCard'

export default function StudentsPage() {
  const qc = useQueryClient()
  const [params] = useSearchParams()

  const [filterClass, setFilterClass] = useState<number | undefined>()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(params.get('add') === '1')
  const [newCreds, setNewCreds] = useState<{ username: string; password: string } | null>(null)
  const [resetTarget, setResetTarget] = useState<Student | null>(null)
  const [resetCreds, setResetCreds] = useState<{ username: string; plainPassword: string } | null>(null)

  const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: getClasses })
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', filterClass],
    queryFn: () => getStudents(filterClass),
  })

  const createMut = useMutation({
    mutationFn: createStudent,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setNewCreds({ username: res.username, password: res.password })
      toast.success('Student added!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add student'),
  })

  const resetMut = useMutation({
    mutationFn: (id: number) => resetStudentPassword(id),
    onSuccess: (data) => {
      setResetCreds(data)
      toast.success('Password reset!')
    },
  })

  const deactivateMut = useMutation({
    mutationFn: deactivateStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Student deactivated')
    },
  })

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.admissionNo}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm">{students.length} students enrolled</p>
        </div>
        <button onClick={() => { setAddOpen(true); setNewCreds(null) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Search by name or admission no…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto"
          value={filterClass ?? ''}
          onChange={e => setFilterClass(e.target.value ? Number(e.target.value) : undefined)}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Adm. No', 'Name', 'Class', 'Section', 'Parent', 'Phone', 'Status', 'Actions']
                  .map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Loading…</td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">No students found.</td></tr>
              )}
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.admissionNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.schoolClass.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.section?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.parentName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.parentPhone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${s.user.active
                      ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {s.user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setResetTarget(s); setResetCreds(null) }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Reset password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {s.user.active && (
                        <button
                          onClick={() => {
                            if (confirm(`Deactivate ${s.firstName}?`))
                              deactivateMut.mutate(s.id)
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Deactivate"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add student modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Student" size="lg">
        {newCreds ? (
          <>
            <CredentialCard username={newCreds.username} password={newCreds.password}
                            label="Student Account Created" />
            <button className="btn-primary w-full mt-4"
              onClick={() => { setAddOpen(false); setNewCreds(null) }}>
              Done
            </button>
          </>
        ) : (
          <AddStudentForm classes={classes}
            onSubmit={data => createMut.mutate(data)}
            loading={createMut.isPending} />
        )}
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!resetTarget} onClose={() => { setResetTarget(null); setResetCreds(null) }}
             title="Reset Password">
        {resetCreds ? (
          <>
            <CredentialCard username={resetCreds.username} password={resetCreds.plainPassword}
                            label="Password Reset" />
            <button className="btn-primary w-full mt-4"
              onClick={() => { setResetTarget(null); setResetCreds(null) }}>
              Done
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reset password for <strong>{resetTarget?.firstName} {resetTarget?.lastName}</strong>?
              A new random password will be generated.
            </p>
            <button
              className="btn-primary w-full"
              onClick={() => resetTarget && resetMut.mutate(resetTarget.id)}
              disabled={resetMut.isPending}>
              {resetMut.isPending ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Add Student Form ──────────────────────────────────────────────────────

function AddStudentForm({
  classes, onSubmit, loading
}: {
  classes: SchoolClass[]
  onSubmit: (data: Record<string, unknown>) => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male',
    classId: '', sectionId: '', parentName: '', parentPhone: '', address: '', admissionDate: '',
  })

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['sections', form.classId],
    queryFn: () => getSections(Number(form.classId)),
    enabled: !!form.classId,
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      classId: Number(form.classId),
      sectionId: form.sectionId ? Number(form.sectionId) : null,
      admissionDate: form.admissionDate || new Date().toISOString().split('T')[0],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input className="input" required value={form.firstName}
            onChange={e => set('firstName', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input className="input" required value={form.lastName}
            onChange={e => set('lastName', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input className="input" type="date" required value={form.dob}
            onChange={e => set('dob', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
          <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <select className="input" required value={form.classId}
            onChange={e => setForm(p => ({ ...p, classId: e.target.value, sectionId: '' }))}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <select className="input" value={form.sectionId}
            onChange={e => set('sectionId', e.target.value)}
            disabled={!form.classId}>
            <option value="">No section</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent / Guardian Name</label>
          <input className="input" value={form.parentName}
            onChange={e => set('parentName', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
          <input className="input" type="tel" value={form.parentPhone}
            onChange={e => set('parentPhone', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea className="input" rows={2} value={form.address}
          onChange={e => set('address', e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
        <input className="input" type="date" value={form.admissionDate}
          onChange={e => set('admissionDate', e.target.value)} />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating…' : 'Create Student & Generate Credentials'}
      </button>
    </form>
  )
}
