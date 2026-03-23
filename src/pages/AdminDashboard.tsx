import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { Calendar, DollarSign, Users, Eye, MoreHorizontal, RefreshCw, BarChart3, PieChart, Shield, Settings, Bell, ArrowUpRight, ArrowDownRight, Search, Filter, Minus, Plus, Check, X, Loader2, Landmark, OctagonX, Banknote, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PageTransition from '../components/PageTransition'
import AdminChatSection from '../components/AdminChatSection'
import AdminInviteSection from '../components/AdminInviteSection'
import AdminTransactionHistory from '../components/AdminTransactionHistory'

const defaultStats = [
  { label: 'Tổng đặt chỗ', value: '0', change: 'Hiện đang trống', up: true, icon: Calendar, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
  { label: 'Doanh thu', value: '0đ', change: 'Hiện đang trống', up: true, icon: DollarSign, color: 'bg-green-500', lightColor: 'bg-green-50' },
  { label: 'Người dùng', value: '0', change: 'Hiện đang trống', up: true, icon: Users, color: 'bg-purple-500', lightColor: 'bg-purple-50' },
  { label: 'Lượt xem', value: '0', change: 'Hiện đang trống', up: false, icon: Eye, color: 'bg-orange-500', lightColor: 'bg-orange-50' },
]



const topDestinations: { name: string; bookings: number; revenue: string; pct: number; image: string }[] = []

const revenueMonths = [
  { month: 'T1', value: 45 }, { month: 'T2', value: 58 }, { month: 'T3', value: 72 },
  { month: 'T4', value: 55 }, { month: 'T5', value: 88 }, { month: 'T6', value: 95 },
  { month: 'T7', value: 78 }, { month: 'T8', value: 92 }, { month: 'T9', value: 68 },
  { month: 'T10', value: 85 }, { month: 'T11', value: 90 }, { month: 'T12', value: 100 },
]

const maxVal = Math.max(...revenueMonths.map((r) => r.value))

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  provider: string
  role: string
  balance: number
  bank_name: string
  bank_account_number: string
  created_at: string
}

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  status: string
  bank_name: string
  bank_account_number: string
  user_display_name: string
  user_email: string
  transaction_id: string | null
  created_at: string
  approved_at: string | null
}

function UsersList({ profiles, loading, error, onRetry, compact = false, onUpdateBalance }: { profiles: Profile[]; loading: boolean; error: string | null; onRetry: () => void; compact?: boolean; onUpdateBalance?: (id: string, balance: number) => Promise<void> }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const startEdit = (p: Profile) => {
    setEditingId(p.id)
    setEditValue((p.balance || 0).toFixed(2))
  }

  const saveBalance = async (id: string) => {
    if (!onUpdateBalance) return
    setSaving(true)
    await onUpdateBalance(id, parseFloat(editValue) || 0)
    setSaving(false)
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(compact ? 3 : 5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 rounded w-28" />
              <div className="h-2.5 bg-gray-100 rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 text-xs mb-2">Lỗi: {error}</p>
        <p className="text-text-muted text-[10px] mb-3">Bạn cần chạy SQL setup trước. Xem file <code className="bg-gray-100 px-1 rounded">supabase-setup-profiles.sql</code></p>
        <button onClick={onRetry} className="text-primary text-xs font-semibold hover:underline cursor-pointer">Thử lại</button>
      </div>
    )
  }

  if (profiles.length === 0) {
    return <p className="text-text-muted text-xs text-center py-6">Hiện đang trống — Chưa có người dùng nào. 👤</p>
  }

  const displayList = compact ? profiles.slice(0, 5) : profiles

  return (
    <div className="space-y-2.5">
      {displayList.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-3 ${compact ? 'py-1.5' : 'p-3 bg-surface-dim rounded-xl hover:bg-gray-100 transition-colors'}`}
        >
          {p.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20">
              <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(p.display_name || p.email || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{p.display_name || 'Hiện đang trống'}</p>
            <p className="text-text-muted text-[11px] truncate">{p.email || 'Hiện đang trống'}</p>
            {p.bank_account_number && (
              <p className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5 mt-0.5"><Landmark className="w-2.5 h-2.5" /> {p.bank_name || 'N/A'} • {p.bank_account_number}</p>
            )}
          </div>

          {/* Balance display/edit */}
          <div className="flex-shrink-0">
            {editingId === p.id ? (
              <div className="flex items-center gap-1">
                <button onClick={() => setEditValue((Math.max(0, parseFloat(editValue) - 1)).toFixed(2))} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"><Minus className="w-3 h-3" /></button>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-16 text-center text-xs font-bold border border-primary rounded-md px-1 py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.5"
                  min="0"
                />
                <button onClick={() => setEditValue((parseFloat(editValue) + 1).toFixed(2))} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"><Plus className="w-3 h-3" /></button>
                <button onClick={() => saveBalance(p.id)} disabled={saving} className="w-6 h-6 rounded-md bg-green-500 text-white flex items-center justify-center cursor-pointer hover:bg-green-600">{saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}</button>
                <button onClick={() => setEditingId(null)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <button onClick={() => startEdit(p)} className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors" title="Số dư">
                <DollarSign className="w-3 h-3" />{(p.balance || 0).toFixed(2)}
              </button>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              p.provider === 'google' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {p.provider === 'google' ? (
                <><svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Google</>
              ) : (
                <><Shield className="w-3 h-3" /> Email</>
              )}
            </span>
            {!compact && (
              <p className="text-[10px] text-text-muted mt-1">
                {new Date(p.created_at).toLocaleDateString('vi-VN')}
              </p>
            )}
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
              p.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {p.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </motion.div>
      ))}
      {compact && profiles.length > 5 && (
        <p className="text-center text-text-muted text-[10px] pt-1">+ {profiles.length - 5} người dùng khác</p>
      )}
    </div>
  )
}

function RevenueChart() {
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barsRef.current) return
    const bars = barsRef.current.querySelectorAll('.chart-bar')
    gsap.fromTo(
      bars,
      { height: 0, opacity: 0 },
      {
        height: (i: number) => `${revenueMonths[i].value}%`,
        opacity: 1,
        duration: 0.7,
        stagger: 0.06,
        ease: 'back.out(1.2)',
        delay: 0.5,
      }
    )
  }, [])

  return (
    <div ref={barsRef} className="flex items-end gap-2" style={{ height: 180 }}>
      {revenueMonths.map((m) => {
        const isMax = m.value === maxVal
        return (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div
              className={`chart-bar w-full rounded-t-lg cursor-pointer relative group transition-colors ${
                isMax
                  ? 'bg-gradient-to-t from-primary to-primary-light shadow-md shadow-primary/20'
                  : 'bg-primary/15 hover:bg-primary/35'
              }`}
              style={{ height: 0 }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-[9px] px-2 py-0.5 rounded-md font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                ₫{Math.round(m.value * 8.47)}tr
                <div className="absolute w-2 h-2 bg-secondary rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            </div>
            <span className={`text-[10px] flex-shrink-0 ${isMax ? 'text-primary font-bold' : 'text-text-muted'}`}>{m.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart() {
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!circleRef.current) return
    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: 251 },
      { strokeDashoffset: 251 * 0.28, duration: 1.5, ease: 'power3.out', delay: 0.8 }
    )
  }, [])

  return (
    <div className="relative w-28 h-28 mx-auto mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          ref={circleRef}
          cx="50" cy="50" r="40" fill="none"
          stroke="url(#donutGrad)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray="251" strokeDashoffset="251"
        />
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black">72%</span>
        <span className="text-[9px] text-text-muted">Tỷ lệ lấp đầy</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState<string | null>(null)

  const fetchProfiles = async () => {
    setProfilesLoading(true)
    setProfilesError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) {
      setProfilesError(err.message)
    } else {
      setProfiles(data || [])
    }
    setProfilesLoading(false)
  }

  useEffect(() => { fetchProfiles() }, [])

  const handleUpdateBalance = async (id: string, balance: number) => {
    await supabase.from('profiles').update({ balance }).eq('id', id)
    setProfiles((prev) => prev.map((p) => p.id === id ? { ...p, balance } : p))
  }

  // Build stats with real user count
  const stats = defaultStats.map((s) => {
    if (s.label === 'Người dùng') {
      return {
        ...s,
        value: profilesLoading ? '...' : String(profiles.length),
        change: profiles.length > 0 ? `+${profiles.length} tài khoản` : 'Hiện đang trống',
        up: profiles.length > 0,
      }
    }
    return s
  })

  // Tour price settings (in $)
  const [tourBasePrice, setTourBasePrice] = useState(10)
  const [tourPriceInput, setTourPriceInput] = useState('10.00')
  const [savingPrice, setSavingPrice] = useState(false)
  const [priceSaved, setPriceSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'tour_base_price')
      .single()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data?.value) {
          setTourBasePrice(parseFloat(data.value))
          setTourPriceInput(parseFloat(data.value).toFixed(2))
        }
      })
  }, [])

  const saveTourPrice = async () => {
    const val = parseFloat(tourPriceInput)
    if (isNaN(val) || val < 0.01 || val > 40) return
    setSavingPrice(true)
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'tour_base_price', value: String(val), updated_at: new Date().toISOString() })
    if (!error) {
      setTourBasePrice(val)
      setPriceSaved(true)
      setTimeout(() => setPriceSaved(false), 2000)
    }
    setSavingPrice(false)
  }

  // Tour stop limit settings
  const [tourStopLimit, setTourStopLimit] = useState(30)
  const [stopLimitInput, setStopLimitInput] = useState('30')
  const [savingStopLimit, setSavingStopLimit] = useState(false)
  const [stopLimitSaved, setStopLimitSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'tour_stop_limit')
      .single()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data?.value) {
          setTourStopLimit(parseInt(data.value) || 30)
          setStopLimitInput(String(parseInt(data.value) || 30))
        }
      })
  }, [])

  const saveStopLimit = async () => {
    const val = parseInt(stopLimitInput)
    if (isNaN(val) || val < 1 || val > 60) return
    setSavingStopLimit(true)
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'tour_stop_limit', value: String(val), updated_at: new Date().toISOString() })
    if (!error) {
      setTourStopLimit(val)
      setStopLimitSaved(true)
      setTimeout(() => setStopLimitSaved(false), 2000)
    }
    setSavingStopLimit(false)
  }

  // Withdrawal management
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true)
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setWithdrawals(data)
    setWithdrawalsLoading(false)
  }

  useEffect(() => { fetchWithdrawals() }, [])

  const approveWithdrawal = async (w: Withdrawal) => {
    setApprovingId(w.id)
    await supabase.from('withdrawals').update({
      status: 'approved',
      approved_at: new Date().toISOString()
    }).eq('id', w.id)
    if (w.transaction_id) {
      await supabase.from('transactions').update({
        description: 'Kiểm tra tài khoản nhé ✅'
      }).eq('id', w.transaction_id)
    }
    setApprovingId(null)
    fetchWithdrawals()
  }

  return (
    <PageTransition>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-secondary via-slate-800 to-slate-900 px-5 pt-4 pb-6 rounded-b-[2rem] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-white/60 text-xs">Xin chào, Admin</p>
              <h1 className="text-white font-bold text-lg">Bảng điều khiển</h1>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}><Icon className="w-4 h-4 text-white" /></div>
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{stat.change}
                    </span>
                  </div>
                  <p className="text-white font-bold text-base">{stat.value}</p>
                  <p className="text-white/50 text-[10px] mt-0.5">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="px-5 pt-5 pb-20">
          {/* Mobile chart */}
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm mb-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Doanh thu</h3>
            <RevenueChart />
          </div>

          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Giá đặt tour ($)</h3>
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <p className="text-text-muted text-xs mb-1">Giá cơ bản mỗi lần đặt tour (USD):</p>
            <p className="text-text-muted text-[10px] mb-3">+0.6% mỗi lần đặt • Tối đa $40.00</p>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setTourPriceInput(String(Math.max(0.01, parseFloat(tourPriceInput || '0') - 0.5).toFixed(2)))} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg active:bg-gray-200 cursor-pointer">-</button>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-black text-text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="40"
                  value={tourPriceInput}
                  onChange={(e) => setTourPriceInput(e.target.value)}
                  className="w-full text-center text-2xl font-black py-2 pl-8 border border-border rounded-xl focus:border-primary focus:outline-none"
                />
              </div>
              <button onClick={() => setTourPriceInput(String(Math.min(40, parseFloat(tourPriceInput || '0') + 0.5).toFixed(2)))} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg active:bg-gray-200 cursor-pointer">+</button>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={saveTourPrice}
              disabled={savingPrice}
              className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {savingPrice ? 'Đang lưu...' : priceSaved ? '✅ Đã lưu!' : 'Lưu thay đổi'}
            </motion.button>
            <p className="text-[10px] text-text-muted text-center mt-2">Hiện tại: <span className="font-bold text-green-600">${tourBasePrice.toFixed(2)}</span></p>
          </div>

          <h3 className="font-bold text-sm mb-3 mt-6 flex items-center gap-2"><OctagonX className="w-4 h-4 text-red-500" /> Giới hạn đặt tour</h3>
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <p className="text-text-muted text-xs mb-1">Số lần đặt tour tối đa trước khi dừng:</p>
            <p className="text-text-muted text-[10px] mb-3">User sẽ bị chặn khi đạt số này (hiển thị /60)</p>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setStopLimitInput(String(Math.max(1, parseInt(stopLimitInput || '0') - 1)))} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg active:bg-gray-200 cursor-pointer">-</button>
              <input
                type="number"
                step="1"
                min="1"
                max="60"
                value={stopLimitInput}
                onChange={(e) => setStopLimitInput(e.target.value)}
                className="flex-1 text-center text-2xl font-black py-2 border border-border rounded-xl focus:border-primary focus:outline-none"
              />
              <button onClick={() => setStopLimitInput(String(Math.min(60, parseInt(stopLimitInput || '0') + 1)))} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg active:bg-gray-200 cursor-pointer">+</button>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={saveStopLimit}
              disabled={savingStopLimit}
              className="w-full py-2.5 bg-red-500 text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {savingStopLimit ? 'Đang lưu...' : stopLimitSaved ? '✅ Đã lưu!' : 'Lưu giới hạn'}
            </motion.button>
            <p className="text-[10px] text-text-muted text-center mt-2">Hiện tại: <span className="font-bold text-red-500">{tourStopLimit} lần</span></p>
          </div>


          {/* User list - Mobile */}
          <h3 className="font-bold text-sm mb-3 mt-6 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" /> Người dùng {!profilesLoading && <span className="text-text-muted font-normal">({profiles.length})</span>}</h3>
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm mb-6">
            <UsersList profiles={profiles} loading={profilesLoading} error={profilesError} onRetry={fetchProfiles} onUpdateBalance={handleUpdateBalance} compact />
          </div>

          {/* Chat Management - Mobile */}
          <h3 className="font-bold text-sm mb-3 mt-6 flex items-center gap-2">💬 Tin nhắn</h3>
          <div className="mb-6">
            <AdminChatSection />
          </div>

          {/* Withdrawal Requests - Mobile */}
          <h3 className="font-bold text-sm mb-3 mt-6 flex items-center gap-2"><Banknote className="w-4 h-4 text-green-500" /> Y&ecirc;u cầu r&uacute;t tiền {!withdrawalsLoading && withdrawals.filter(w => w.status === 'pending').length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{withdrawals.filter(w => w.status === 'pending').length}</span>}</h3>
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm mb-6 overflow-hidden">
            {withdrawalsLoading ? (
              <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
            ) : withdrawals.length === 0 ? (
              <div className="text-center py-6"><p className="text-text-muted text-xs">Chưa c&oacute; y&ecirc;u cầu n&agrave;o</p></div>
            ) : (
              <div className="divide-y divide-border/30">
                {withdrawals.map(w => (
                  <div key={w.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">{w.user_display_name}</p>
                        <p className="text-[10px] text-text-muted">{w.user_email}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${w.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                        {w.status === 'pending' ? '⏳ Chờ duyệt' : '✅ Đ&atilde; duyệt'}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Landmark className="w-3.5 h-3.5 text-primary" />
                        <span className="font-semibold">{w.bank_name}</span>
                        <span className="text-text-muted">•</span>
                        <span className="font-mono">{w.bank_account_number}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black text-green-600">${w.amount.toFixed(2)}</p>
                      {w.status === 'pending' && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approveWithdrawal(w)}
                          disabled={approvingId === w.id}
                          className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          {approvingId === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Đ&atilde; chuyển khoản
                        </motion.button>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{new Date(w.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite Codes - Mobile */}
          <div className="mb-6">
            <AdminInviteSection />
          </div>

          {/* Transaction History - Mobile */}
          <div className="mb-6">
            <AdminTransactionHistory />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block p-6 lg:p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 {...fadeUp} className="text-2xl lg:text-3xl font-bold text-text-primary">Bảng điều khiển</motion.h1>
            <p className="text-text-muted text-sm mt-0.5">Tổng quan hoạt động kinh doanh</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm w-48 lg:w-56 placeholder:text-text-muted" />
            </div>
            <motion.button whileTap={{ scale: 0.95 }} className="relative w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-surface-dim transition-colors cursor-pointer">
              <Bell className="w-4.5 h-4.5 text-text-secondary" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">3</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center hover:bg-surface-dim transition-colors cursor-pointer">
              <Filter className="w-4.5 h-4.5 text-text-secondary" />
            </motion.button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl ${stat.lightColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-text-muted text-xs mt-1">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Charts + Top destinations row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 mb-6">
          {/* Revenue Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Doanh thu theo tháng</h3>
                <p className="text-text-muted text-xs mt-0.5">Năm 2026</p>
              </div>
              <button className="p-2 hover:bg-surface-dim rounded-lg transition-colors cursor-pointer"><MoreHorizontal className="w-4 h-4 text-text-muted" /></button>
            </div>
            <RevenueChart />
          </motion.div>

        </div>

        {/* Recent Bookings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Giá đặt tour ($)</h3>
          </div>
          <div className="px-6 pb-6">
            <p className="text-text-muted text-sm mb-1">Giá cơ bản mỗi lần đặt tour (USD). Mỗi lần đặt, giá tăng thêm 0.6%.</p>
            <p className="text-text-muted text-xs mb-4">Giá tối đa: <span className="font-bold text-red-500">$40.00</span></p>
            <div className="flex items-center gap-4">
              <button onClick={() => setTourPriceInput(String(Math.max(0.01, parseFloat(tourPriceInput || '0') - 0.5).toFixed(2)))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer">-</button>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-black text-text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="40"
                  value={tourPriceInput}
                  onChange={(e) => setTourPriceInput(e.target.value)}
                  className="w-36 text-center text-3xl font-black py-2 pl-8 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <button onClick={() => setTourPriceInput(String(Math.min(40, parseFloat(tourPriceInput || '0') + 0.5).toFixed(2)))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer">+</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveTourPrice}
                disabled={savingPrice}
                className="px-6 py-3 bg-primary text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer hover:bg-primary-dark transition-colors"
              >
                {savingPrice ? 'Đang lưu...' : priceSaved ? '✅ Đã lưu!' : 'Lưu thay đổi'}
              </motion.button>
              <p className="text-sm text-text-muted">Hiện tại: <span className="font-bold text-green-600 text-lg">${tourBasePrice.toFixed(2)}</span></p>
            </div>
          </div>
        </motion.div>

        {/* Tour Stop Limit - Desktop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden mt-6">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2"><OctagonX className="w-5 h-5 text-red-500" /> Giới hạn đặt tour</h3>
          </div>
          <div className="px-6 pb-6">
            <p className="text-text-muted text-sm mb-1">Số lần đặt tour tối đa trước khi dừng. User sẽ thấy /60 nhưng bị chặn tại số này.</p>
            <p className="text-text-muted text-xs mb-4">Giới hạn: <span className="font-bold text-red-500">1 - 60</span></p>
            <div className="flex items-center gap-4">
              <button onClick={() => setStopLimitInput(String(Math.max(1, parseInt(stopLimitInput || '0') - 1)))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer">-</button>
              <input
                type="number"
                step="1"
                min="1"
                max="60"
                value={stopLimitInput}
                onChange={(e) => setStopLimitInput(e.target.value)}
                className="w-36 text-center text-3xl font-black py-2 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
              <button onClick={() => setStopLimitInput(String(Math.min(60, parseInt(stopLimitInput || '0') + 1)))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer">+</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveStopLimit}
                disabled={savingStopLimit}
                className="px-6 py-3 bg-red-500 text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer hover:bg-red-600 transition-colors"
              >
                {savingStopLimit ? 'Đang lưu...' : stopLimitSaved ? '✅ Đã lưu!' : 'Lưu giới hạn'}
              </motion.button>
              <p className="text-sm text-text-muted">Hiện tại: <span className="font-bold text-red-500 text-lg">{tourStopLimit} lần</span></p>
            </div>
          </div>
        </motion.div>

        {/* Users Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2"><Users className="w-5 h-5 text-purple-500" /> Người dùng hệ thống {!profilesLoading && <span className="text-text-muted font-normal text-sm">({profiles.length})</span>}</h3>
            <button onClick={fetchProfiles} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline"><RefreshCw className="w-3.5 h-3.5" /> Làm mới</button>
          </div>
          <div className="px-6 pb-6">
            <UsersList profiles={profiles} loading={profilesLoading} error={profilesError} onRetry={fetchProfiles} onUpdateBalance={handleUpdateBalance} />
          </div>
        </motion.div>

        {/* Chat Management - Desktop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-6">
          <AdminChatSection />
        </motion.div>

        {/* Withdrawal Requests - Desktop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 }} className="mt-6">
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Banknote className="w-5 h-5 text-green-500" /> Y&ecirc;u cầu r&uacute;t tiền
                {!withdrawalsLoading && withdrawals.filter(w => w.status === 'pending').length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{withdrawals.filter(w => w.status === 'pending').length} chờ</span>}
              </h3>
              <button onClick={fetchWithdrawals} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline"><RefreshCw className="w-3.5 h-3.5" /> L&agrave;m mới</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {withdrawalsLoading ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-10"><p className="text-text-muted text-sm">Chưa c&oacute; y&ecirc;u cầu r&uacute;t tiền n&agrave;o</p></div>
              ) : (
                <div className="divide-y divide-border/30">
                  {withdrawals.map(w => (
                    <div key={w.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${w.status === 'pending' ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-green-400 to-emerald-500'}`}>
                        {w.status === 'pending' ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{w.user_display_name}</p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${w.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                            {w.status === 'pending' ? '⏳ Chờ duyệt' : '✅ Đ&atilde; duyệt'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Landmark className="w-3 h-3" />
                          <span className="font-semibold text-text-secondary">{w.bank_name}</span>
                          <span>&bull;</span>
                          <span className="font-mono">{w.bank_account_number}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-green-600">${w.amount.toFixed(2)}</p>
                        <p className="text-[10px] text-text-muted">{new Date(w.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      {w.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approveWithdrawal(w)}
                          disabled={approvingId === w.id}
                          className="px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50 hover:bg-green-600 transition-colors flex items-center gap-1.5"
                        >
                          {approvingId === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Đ&atilde; chuyển khoản
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Invite Codes - Desktop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6">
          <AdminInviteSection />
        </motion.div>

        {/* Transaction History - Desktop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="mt-6">
          <AdminTransactionHistory />
        </motion.div>
      </div>
    </PageTransition>
  )
}
