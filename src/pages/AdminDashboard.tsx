import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import {
  Users, TrendingUp, DollarSign, MapPin, Eye, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Calendar, MoreHorizontal, Search, Bell, Filter,
} from 'lucide-react'
import PageTransition from '../components/PageTransition'

const stats = [
  { label: 'Tổng đặt chỗ', value: '2,847', change: '+12.5%', up: true, icon: Calendar, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
  { label: 'Doanh thu', value: '₫847.2tr', change: '+8.3%', up: true, icon: DollarSign, color: 'bg-green-500', lightColor: 'bg-green-50' },
  { label: 'Khách hàng mới', value: '1,234', change: '+24.1%', up: true, icon: Users, color: 'bg-purple-500', lightColor: 'bg-purple-50' },
  { label: 'Lượt xem', value: '48.2K', change: '-3.2%', up: false, icon: Eye, color: 'bg-orange-500', lightColor: 'bg-orange-50' },
]

const recentBookings = [
  { id: 'BK-001', customer: 'Nguyễn Văn A', dest: 'Hạ Long Bay', amount: '4.500.000đ', status: 'Đã xác nhận', statusColor: 'text-green-600 bg-green-50', date: '19/03/2026', avatar: '🧑' },
  { id: 'BK-002', customer: 'Trần Thị B', dest: 'Hội An', amount: '2.800.000đ', status: 'Đang xử lý', statusColor: 'text-yellow-600 bg-yellow-50', date: '19/03/2026', avatar: '👩' },
  { id: 'BK-003', customer: 'Lê Minh C', dest: 'Phú Quốc', amount: '6.200.000đ', status: 'Đã xác nhận', statusColor: 'text-green-600 bg-green-50', date: '18/03/2026', avatar: '👨' },
  { id: 'BK-004', customer: 'Phạm Hương D', dest: 'Sapa', amount: '3.100.000đ', status: 'Đã hủy', statusColor: 'text-red-600 bg-red-50', date: '18/03/2026', avatar: '👩' },
  { id: 'BK-005', customer: 'Hoàng Tuấn E', dest: 'Đà Nẵng', amount: '5.700.000đ', status: 'Đã xác nhận', statusColor: 'text-green-600 bg-green-50', date: '17/03/2026', avatar: '🧑' },
]

const topDestinations = [
  { name: 'Hạ Long Bay', bookings: 342, revenue: '₫1.5tỷ', pct: 85, image: '/images/halong.png' },
  { name: 'Hội An', bookings: 287, revenue: '₫820tr', pct: 72, image: '/images/hoian.png' },
  { name: 'Phú Quốc', bookings: 256, revenue: '₫1.2tỷ', pct: 64, image: '/images/phuquoc.png' },
  { name: 'Sapa', bookings: 198, revenue: '₫450tr', pct: 50, image: '/images/sapa.png' },
  { name: 'Đà Nẵng', bookings: 176, revenue: '₫680tr', pct: 44, image: '/images/danang.png' },
]

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

          <h3 className="font-bold text-sm mb-3">Đặt chỗ gần đây</h3>
          <div className="space-y-2.5">
            {recentBookings.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-surface-dim flex items-center justify-center text-lg">{b.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate">{b.customer}</p>
                  <p className="text-text-muted text-[10px]">{b.dest} · {b.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{b.amount}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${b.statusColor}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-sm mb-3 mt-6">Top điểm đến</h3>
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
          </motion.div>
        </div>

        {/* Recent Bookings Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="font-bold text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Đặt chỗ gần đây</h3>
            <button className="text-primary text-xs font-semibold cursor-pointer hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-border/50">
                  <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Mã</th>
                  <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Khách hàng</th>
                  <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Điểm đến</th>
                  <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Số tiền</th>
                  <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Trạng thái</th>
                  <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider px-6 py-3">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking, i) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-t border-border/30 hover:bg-surface-dim transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3.5 text-xs font-mono font-semibold text-text-secondary">{booking.id}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{booking.avatar}</span>
                        <span className="text-sm font-medium">{booking.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-text-muted" />
                        <span className="text-sm text-text-secondary">{booking.dest}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-bold">{booking.amount}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${booking.statusColor}`}>{booking.status}</span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-text-muted">{booking.date}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
