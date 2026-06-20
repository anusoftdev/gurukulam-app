import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  username: string
  password: string
  label?: string
}

export default function CredentialCard({ username, password, label = 'Account Created' }: Props) {
  const [copied, setCopied] = useState(false)

  const copyAll = () => {
    navigator.clipboard.writeText(`Username: ${username}\nPassword: ${password}`)
    setCopied(true)
    toast.success('Credentials copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-green-800">✅ {label}</p>
        <button onClick={copyAll}
          className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy all'}
        </button>
      </div>
      <p className="text-sm text-gray-700">
        Please note these credentials — the password won't be shown again.
      </p>
      <div className="mt-3 space-y-1 font-mono text-sm bg-white rounded-lg p-3 border border-green-100">
        <p><span className="text-gray-500">Username: </span><strong>{username}</strong></p>
        <p><span className="text-gray-500">Password: </span><strong>{password}</strong></p>
      </div>
    </div>
  )
}
