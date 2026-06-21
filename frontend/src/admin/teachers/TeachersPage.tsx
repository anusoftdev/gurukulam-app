import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Key, BookOpen } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getTeachers, getClasses, createTeacher, resetTeacherPassword, assignTeacherToClass
} from '../../api/index.ts'
import type { Teacher, SchoolClass } from '../../types/index.ts'
import Modal from '../../components/Modal'
import CredentialCard from '../../components/CredentialCard'

export default function TeachersPage() {
  const qc = useQueryClient()
  const [params] = useSearchParams()

  const [addOpen, setAddOpen] = useState(params.get('add') === '1')
  const [newCreds, setNewCreds] = useState<{ username: string; plainPassword: string } | null>(null)
  const [resetTarget, setResetTarget] = useState<Teacher | null>(null)
  const [resetCreds, setResetCreds] = useState<{ username: string; plainPassword: string } | null>(null)
  const [assignTarget, setAssignTarget] = useState<Teacher | null>(null)

  const { data: teachers = [], isLoading } = useQuery({ queryKey: ['teachers'], queryFn: getTeachers })
  const { data: classes = [] } = useQuery({ queryKey: ['classes'], queryFn: getClasses })

  const createMut = useMutation({
    mutationFn: createTeacher,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setNewCreds({ username: res.username, plainPassword: res.plainPassword })
      toast.success('Teacher added!')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to add teacher'),
  })

  const resetMut = useMutation({
    mutationFn: (id: number) => resetTeacherPassword(id),
    onSuccess: (data) => { setResetCreds(data); toast.success('Password reset!') },
  })

  const assignMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      assignTeacherToClass(id, data),
    onSuccess: () => { setAssignTarget(null); toast.success('Class assigned!') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to assign'),
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 text-sm">{teachers.length} teachers registered</p>
        </div>
        <button onClick={() => { setAddOpen(true); setNewCreds(null) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && [...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse h-40 bg-gray-100" />
        ))}
        {teachers.map(t => (
          <div key={t.id} className="card space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center
                              text-brand-700 font-bold text-lg flex-shrink-0">
                {t.firstName.charAt(0)}{t.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t.firstName} {t.lastName}</p>
                <p className="text-xs text-gray-400 font-mono">{t.user.username}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {t.employeeId && <p>Employee ID: <span className="font-medium">{t.employeeId}</span></p>}
              {t.phone && <p>Phone: <span className="font-medium">{t.phone}</span></p>}
              {t.qualification && <p>Qualification: <span className="font-medium">{t.qualification}</span></p>}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t">
              <button
                onClick={() => { setResetTarget(t); setResetCreds(null) }}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:bg-blue-50
                           px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Key className="w-3.5 h-3.5" /> Reset Password
              </button>
              <button
                onClick={() => setAssignTarget(t)}
                className="flex items-center gap-1.5 text-xs text-purple-600 hover:bg-purple-50
                           px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Assign Class
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add teacher modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Teacher">
        {newCreds ? (
          <>
            <CredentialCard username={newCreds.username} password={newCreds.plainPassword}
                            label="Teacher Account Created" />
            <button className="btn-primary w-full mt-4"
              onClick={() => { setAddOpen(false); setNewCreds(null) }}>Done</button>
          </>
        ) : (
          <AddTeacherForm onSubmit={data => createMut.mutate(data)} loading={createMut.isPending} />
        )}
      </Modal>

      {/* Reset password modal */}
      <Modal open={!!resetTarget} onClose={() => { setResetTarget(null); setResetCreds(null) }}
             title="Reset Teacher Password">
        {resetCreds ? (
          <>
            <CredentialCard username={resetCreds.username} password={resetCreds.plainPassword}
                            label="Password Reset" />
            <button className="btn-primary w-full mt-4"
              onClick={() => { setResetTarget(null); setResetCreds(null) }}>Done</button>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reset password for <strong>{resetTarget?.firstName} {resetTarget?.lastName}</strong>?
            </p>
            <button className="btn-primary w-full"
              onClick={() => resetTarget && resetMut.mutate(resetTarget.id)}
              disabled={resetMut.isPending}>
              {resetMut.isPending ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        )}
      </Modal>

      {/* Assign class modal */}
      <Modal open={!!assignTarget} onClose={() => setAssignTarget(null)} title="Assign Class to Teacher">
        <AssignClassForm
          classes={classes}
          onSubmit={data => assignTarget && assignMut.mutate({ id: assignTarget.id, data })}
          loading={assignMut.isPending}
        />
      </Modal>
    </div>
  )
}

function AddTeacherForm({ onSubmit, loading }: { onSubmit: (d: Record<string, unknown>) => void; loading: boolean }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', qualification: '', joiningDate: '', employeeId: ''
  })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, employeeId: form.employeeId.trim() || null }) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input className="input" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input className="input" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
        <input className="input" placeholder="e.g. B.Ed, M.A." value={form.qualification}
          onChange={e => set('qualification', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
          <input className="input" placeholder="Auto-generated if blank" value={form.employeeId}
            onChange={e => set('employeeId', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
          <input className="input" type="date" value={form.joiningDate}
            onChange={e => set('joiningDate', e.target.value)} />
        </div>
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Creating…' : 'Create Teacher & Generate Credentials'}
      </button>
    </form>
  )
}

function AssignClassForm({
  classes, onSubmit, loading
}: { classes: SchoolClass[]; onSubmit: (d: Record<string, unknown>) => void; loading: boolean }) {
  const [form, setForm] = useState({ classId: '', subject: '' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ classId: Number(form.classId), subject: form.subject }) }}
      className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
        <select className="input" required value={form.classId} onChange={e => set('classId', e.target.value)}>
          <option value="">Select class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input className="input" placeholder="e.g. Mathematics, English" value={form.subject}
          onChange={e => set('subject', e.target.value)} />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Assigning…' : 'Assign Class'}
      </button>
    </form>
  )
}
