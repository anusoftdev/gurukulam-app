import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, School, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClasses, createClass, deleteClass } from '../../api/index.ts'
import Modal from '../../components/Modal'

export default function ClassesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', sortOrder: '' })

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'], queryFn: getClasses
  })

  const createMut = useMutation({
    mutationFn: () => createClass(form.name, Number(form.sortOrder)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Class created!')
      setOpen(false)
      setForm({ name: '', sortOrder: '' })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create class'),
  })

  const deleteMut = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Class deleted')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to delete class'),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 text-sm">{classes.length} classes configured</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading && [...Array(8)].map((_, i) => (
          <div key={i} className="card animate-pulse h-24 bg-gray-100" />
        ))}
        {classes.map(c => (
          <div key={c.id} className="card flex flex-col items-center justify-center gap-2 py-6 text-center relative group">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
              <School className="w-6 h-6 text-brand-600" />
            </div>
            <p className="font-semibold text-gray-800 text-lg">{c.name}</p>
            <p className="text-xs text-gray-400">Sort order: {c.sortOrder}</p>
            <button
              onClick={() => {
                if (confirm(`Delete class "${c.name}"? This cannot be undone.`))
                  deleteMut.mutate(c.id)
              }}
              className="absolute top-2 right-2 p-1.5 text-red-400 hover:bg-red-50 rounded-lg
                         opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete class"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add New Class" size="sm">
        <form onSubmit={e => { e.preventDefault(); createMut.mutate() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input className="input" required placeholder="e.g. Nursery, LKG, 1st"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order * <span className="text-gray-400">(for display sequence)</span>
            </label>
            <input className="input" type="number" required min={0}
              value={form.sortOrder}
              onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={createMut.isPending}>
            {createMut.isPending ? 'Creating…' : 'Create Class'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
