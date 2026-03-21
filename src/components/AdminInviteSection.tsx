import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket, Copy, Trash2, RefreshCw, Loader2, Check, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface InviteCode {
  id: string
  code: string
  status: 'active' | 'used' | 'revoked'
  used_by: string | null
  created_at: string
  used_at: string | null
}

interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0/O, 1/I)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function AdminInviteSection() {
  const { user } = useAuth()
  const [codes, setCodes] = useState<InviteCode[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [count, setCount] = useState(1)

  const fetchProfiles = async (userIds: string[]) => {
    if (userIds.length === 0) return
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, email, avatar_url')
      .in('id', userIds)
    if (data) {
      const map: Record<string, UserProfile> = {}
      data.forEach((p: UserProfile) => { map[p.id] = p })
      setProfiles((prev) => ({ ...prev, ...map }))
    }
  }

  const fetchCodes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setCodes(data)
      // Fetch profiles for used codes
      const usedByIds = data.filter((c: InviteCode) => c.used_by).map((c: InviteCode) => c.used_by as string)
      if (usedByIds.length > 0) fetchProfiles([...new Set(usedByIds)])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCodes()
  }, [])

  const handleGenerate = async () => {
    if (!user) return
    setGenerating(true)
    const newCodes = []
    for (let i = 0; i < count; i++) {
      newCodes.push({
        code: generateCode(),
        created_by: user.id,
        status: 'active',
      })
    }
    await supabase.from('invite_codes').insert(newCodes)
    await fetchCodes()
    setGenerating(false)
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = async (id: string) => {
    await supabase.from('invite_codes').update({ status: 'revoked' }).eq('id', id)
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, status: 'revoked' as const } : c))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('invite_codes').delete().eq('id', id)
    setCodes((prev) => prev.filter((c) => c.id !== id))
  }

  const activeCodes = codes.filter((c) => c.status === 'active')
  const usedCodes = codes.filter((c) => c.status === 'used')

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Ticket className="w-5 h-5 text-purple-500" /> Mã mời
          {activeCodes.length > 0 && (
            <span className="ml-1 text-xs font-semibold bg-green-500 text-white px-2 py-0.5 rounded-full">{activeCodes.length} còn trống</span>
          )}
        </h3>
        <button onClick={fetchCodes} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {/* Generate section */}
      <div className="p-4 bg-purple-50/50 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-border/50 px-3 py-2">
            <button onClick={() => setCount(Math.max(1, count - 1))} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-gray-200">-</button>
            <span className="w-8 text-center font-bold text-lg">{count}</span>
            <button onClick={() => setCount(Math.min(10, count + 1))} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-gray-200">+</button>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-purple-500/20"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {generating ? 'Đang tạo...' : `Tạo ${count} mã mời`}
          </motion.button>
        </div>
      </div>

      {/* Codes list */}
      <div className="max-h-[300px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <Ticket className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-text-muted text-sm">Chưa có mã mời nào</p>
            <p className="text-text-muted text-xs">Nhấn "Tạo mã mời" để bắt đầu</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {codes.map((code) => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors group"
              >
                {/* Code display */}
                <div className={`font-mono text-lg font-black tracking-[0.2em] px-3 py-1.5 rounded-lg ${
                  code.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' :
                  code.status === 'used' ? 'bg-gray-100 text-gray-400 line-through border border-gray-200' :
                  'bg-red-50 text-red-400 line-through border border-red-200'
                }`}>
                  {code.code}
                </div>

                {/* Status & info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      code.status === 'active' ? 'bg-green-100 text-green-600' :
                      code.status === 'used' ? 'bg-gray-100 text-gray-500' :
                      'bg-red-100 text-red-500'
                    }`}>
                      {code.status === 'active' ? '✅ Có thể dùng' : code.status === 'used' ? '✓ Đã sử dụng' : '✕ Đã hủy'}
                    </span>
                    {/* Show user who used the code */}
                    {code.status === 'used' && code.used_by && profiles[code.used_by] && (
                      <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white">
                            {(profiles[code.used_by].display_name || profiles[code.used_by].email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-blue-700 max-w-[120px] truncate">
                          {profiles[code.used_by].display_name || profiles[code.used_by].email}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {formatDate(code.created_at)}
                    {code.used_at && ` • Dùng: ${formatDate(code.used_at)}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {code.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleCopy(code.code, code.id)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer text-text-muted hover:text-blue-500 transition-colors"
                        title="Sao chép"
                      >
                        <AnimatePresence mode="wait">
                          {copiedId === code.id ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            </motion.div>
                          ) : (
                            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <Copy className="w-3.5 h-3.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <button
                        onClick={() => handleRevoke(code.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer text-text-muted hover:text-red-500 transition-colors"
                        title="Hủy mã"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {code.status !== 'active' && (
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer text-text-muted hover:text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary footer */}
      {codes.length > 0 && (
        <div className="px-4 py-2.5 bg-gray-50/50 border-t border-border/30 flex items-center gap-4 text-[10px] text-text-muted">
          <span>Tổng: <b>{codes.length}</b></span>
          <span>Còn trống: <b className="text-green-600">{activeCodes.length}</b></span>
          <span>Đã dùng: <b className="text-gray-500">{usedCodes.length}</b></span>
        </div>
      )}
    </div>
  )
}
