import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { Calendar, DollarSign, Users, Eye, TrendingUp, MapPin, MoreHorizontal, RefreshCw, BarChart3, PieChart, Shield, Settings, Bell, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import PageTransition from '../components/PageTransition'

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
  created_at: string
}

function UsersList({ profiles, loading, error, onRetry, compact = false }: { profiles: Profile[]; loading: boolean; error: string | null; onRetry: () => void; compact?: boolean }) {
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

  // Tour limit settings
  const [tourLimit, setTourLimit] = useState(50)
  const [tourLimitInput, setTourLimitInput] = useState('50')
  const [savingLimit, setSavingLimit] = useState(false)
  const [limitSaved, setLimitSaved] = useState(false)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'max_tour_bookings')
      .single()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data?.value) {
          setTourLimit(parseInt(data.value, 10))
          setTourLimitInput(data.value)
        }
      })
  }, [])

  const saveTourLimit = async () => {
    const val = parseInt(tourLimitInput, 10)
    if (isNaN(val) || val < 1) return
    setSavingLimit(true)
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'max_tour_bookings', value: String(val), updated_at: new Date().toISOString() })
    if (!error) {
      setTourLimit(val)
      setLimitSaved(true)
      setTimeout(() => setLimitSaved(false), 2000)
    }
    setSavingLimit(false)
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

          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Giới hạn đặt tour</h3>
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm">
            <p className="text-text-muted text-xs mb-3">Số lượng tối đa mỗi người dùng có thể đặt:</p>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setTourLimitInput(String(Math.max(1, parseInt(tourLimitInput || '0', 10) - 10)))} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg active:bg-gray-200 cursor-pointer">-</button>
              <input
                type="number"
                value={tourLimitInput}
                onChange={(e) => setTourLimitInput(e.target.value)}
                className="flex-1 text-center text-2xl font-black py-2 border border-border rounded-xl focus:border-primary focus:outline-none"
              />
              <button onClick={() => setTourLimitInput(String(parseInt(tourLimitInput || '0', 10) + 10))} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-lg active:bg-gray-200 cursor-pointer">+</button>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={saveTourLimit}
              disabled={savingLimit}
              className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {savingLimit ? 'Đang lưu...' : limitSaved ? '✅ Đã lưu!' : 'Lưu thay đổi'}
            </motion.button>
            <p className="text-[10px] text-text-muted text-center mt-2">Hiện tại: <span className="font-bold text-primary">{tourLimit}</span></p>
          </div>

          <h3 className="font-bold text-sm mb-3 mt-6">Top điểm đến</h3>
          {topDestinations.length > 0 ? (
            <div className="space-y-2">
              {topDestinations.slice(0, 3).map((dest) => (
                <div key={dest.name} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg overflow-hidden"><img src={dest.image} alt={dest.name} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-xs">{dest.name}</p>
                    <p className="text-text-muted text-[10px]">{dest.bookings} đặt chỗ</p>
                  </div>
                  <p className="text-xs font-bold text-primary">{dest.revenue}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm text-center">
              <p className="text-2xl mb-2">🗺️</p>
              <p className="text-text-muted text-xs">Hiện đang trống</p>
            </div>
          )}

          {/* User list - Mobile */}
          <h3 className="font-bold text-sm mb-3 mt-6 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" /> Người dùng {!profilesLoading && <span className="text-text-muted font-normal">({profiles.length})</span>}</h3>
          <div className="bg-white rounded-2xl p-4 border border-border/50 shadow-sm mb-6">
            <UsersList profiles={profiles} loading={profilesLoading} error={profilesError} onRetry={fetchProfiles} compact />
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

          {/* Top Destinations + Donut */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-500" /> Top điểm đến</h3>
              <button className="text-primary text-xs font-semibold cursor-pointer hover:underline">Xem tất cả</button>
            </div>
            <DonutChart />
            {topDestinations.length > 0 ? (
              <div className="space-y-3">
                {topDestinations.map((dest, i) => (
                  <motion.div key={dest.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.06 }} className="flex items-center gap-3 group cursor-pointer">
                    <span className="text-xs font-bold text-text-muted w-4">{i + 1}</span>
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                      <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{dest.name}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dest.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                          className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-primary">{dest.revenue}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">🗺️</p>
                <p className="text-text-muted text-sm">Hiện đang trống</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Bookings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Giới hạn đặt tour</h3>
          </div>
          <div className="px-6 pb-6">
            <p className="text-text-muted text-sm mb-4">Số lượng tối đa mỗi người dùng có thể đặt tour. Khi vượt giới hạn, hệ thống sẽ thông báo cho người dùng.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setTourLimitInput(String(Math.max(1, parseInt(tourLimitInput || '0', 10) - 10)))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer">-</button>
              <input
                type="number"
                value={tourLimitInput}
                onChange={(e) => setTourLimitInput(e.target.value)}
                className="w-32 text-center text-3xl font-black py-2 border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
              />
              <button onClick={() => setTourLimitInput(String(parseInt(tourLimitInput || '0', 10) + 10))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl transition-colors cursor-pointer">+</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveTourLimit}
                disabled={savingLimit}
                className="px-6 py-3 bg-primary text-white font-semibold text-sm rounded-xl disabled:opacity-50 cursor-pointer hover:bg-primary-dark transition-colors"
              >
                {savingLimit ? 'Đang lưu...' : limitSaved ? '✅ Đã lưu!' : 'Lưu thay đổi'}
              </motion.button>
              <p className="text-sm text-text-muted">Hiện tại: <span className="font-bold text-primary text-lg">{tourLimit}</span></p>
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
            <UsersList profiles={profiles} loading={profilesLoading} error={profilesError} onRetry={fetchProfiles} />
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
