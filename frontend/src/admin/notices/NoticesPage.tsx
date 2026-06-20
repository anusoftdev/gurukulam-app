import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Bell } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPublicNotices, createNotice } from '../../api/index.ts'
import Modal from '../../components/Modal'

export default function NoticesPage() {
  const qc = useQueryClient()
  const [params] = useSearchParams()
  const [open, setOpen] = useState(params.get('add') === '1')
  const [form, setForm] = useState({ title: '', content: '', category: 'General' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'], queryFn: getPublicNotices
  })

  const createMut = useMutation({
    mutationFn: () => createNotice(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notices'] })
      toast.success('Notice posted!')
      setOpen(false)
      setForm({ title: '', content: '', category: 'General' })
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to post notice'),
  })

  const categoryColors: Record<string, string> = {
    Academic: 'bg-blue-100 text-blue-700',
    Holiday:  'bg-green-100 text-green-700',
    General:  'bg-gray-100 text-gray-700',
    Exam:     'bg-orange-100 text-orange-700',
    Event:    'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
          <p className="text-gray-500 text-sm">{notices.length} notices posted</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      <div className="space-y-3">
        {isLoading && [...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse h-24 bg-gray-100" />
        ))}
        {!isLoading && notices.length === 0 && (
          <div className="card text-center py-12">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No notices yet. Post the first one!</p>
          </div>
        )}
        {notices.map(n => (
          <div key={n.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${categoryColors[n.category] ?? 'bg-gray-100 text-gray-700'}`}>
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
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Post New Notice">
        <form onSubmit={e => { e.preventDefault(); createMut.mutate() }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input" required value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {['General', 'Academic', 'Holiday', 'Exam', 'Event'].map(c =>
                <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea className="input" rows={4} required value={form.content}
              onChange={e => set('content', e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={createMut.isPending}>
            {createMut.isPending ? 'Posting…' : 'Post Notice'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
