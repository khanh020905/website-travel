import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { History, RefreshCw, Loader2, ArrowDownLeft, DollarSign } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Transaction {
  id: string
  user_id: string
  amount: number
  type: string
  description: string
  balance_after: number
  created_at: string
}

interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
}

export default function AdminTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      setTransactions(data)
      const userIds = [...new Set(data.filter((t: Transaction) => t.user_id).map((t: Transaction) => t.user_id))]
      if (userIds.length > 0) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', userIds)
        if (pData) {
          const map: Record<string, UserProfile> = {}
          pData.forEach((p: UserProfile) => { map[p.id] = p })
          setProfiles(map)
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const getUserName = (userId: string) => {
    const p = profiles[userId]
    if (!p) return userId.slice(0, 8) + '...'
    return p.display_name || p.email || 'Unknown'
  }

  const getUserInitial = (userId: string) => {
    const name = getUserName(userId)
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
        <h3 className="font-bold text-base flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" /> Lịch sử giao dịch
          {transactions.length > 0 && (
            <span className="ml-1 text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">{transactions.length}</span>
          )}
        </h3>
        <button onClick={fetchAll} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <History className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-text-muted text-sm">Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors"
              >
                {/* User avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {tx.user_id ? getUserInitial(tx.user_id) : '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {tx.user_id ? getUserName(tx.user_id) : 'Unknown'}
                    </p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">
                      <ArrowDownLeft className="w-2.5 h-2.5 inline mr-0.5" />{tx.type === 'booking' ? 'Đặt tour' : tx.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted truncate">
                    {tx.description} • {formatDate(tx.created_at)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-black ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-text-muted flex items-center gap-0.5 justify-end">
                    <DollarSign className="w-2.5 h-2.5" />{(tx.balance_after ?? 0).toFixed(2)} còn lại
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
