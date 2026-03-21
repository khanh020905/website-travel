import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertTriangle } from 'lucide-react'
import gsap from 'gsap'
import UserAvatar, { useUserInfo } from '../components/UserAvatar'
import PageTransition from '../components/PageTransition'
import { supabase } from '../lib/supabase'

export default function Order() {
  const { displayName, email } = useUserInfo()
  const [orderCount, setOrderCount] = useState(0)
  const [maxOrders, setMaxOrders] = useState(50)
  const [exceeded, setExceeded] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  // Fetch max bookings from settings
  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'max_tour_bookings')
      .single()
      .then(({ data }: { data: { value: string } | null }) => {
        if (data?.value) setMaxOrders(parseInt(data.value, 10))
      })
  }, [])

  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current, { width: '0%' }, { width: `${(orderCount / maxOrders) * 100}%`, duration: 0.8, ease: 'power2.out' })
    }
  }, [orderCount, maxOrders])

  const handleOrder = () => {
    if (orderCount >= maxOrders) {
      setExceeded(true)
      setTimeout(() => setExceeded(false), 3000)
      return
    }
    setOrderCount((prev) => prev + 1)
    setExceeded(false)
    if (counterRef.current) {
      gsap.fromTo(counterRef.current, { scale: 1.3, color: '#F97316' }, { scale: 1, color: '#0F172A', duration: 0.4, ease: 'back.out(2)' })
    }
  }

  return (
    <PageTransition>
      {/* ===== MOBILE ===== */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-5 pt-4 pb-20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute top-20 -left-10 w-24 h-24 bg-white/5 rounded-full" />
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-white font-bold text-xl relative z-10">Đặt Tour</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/70 text-sm mt-1 relative z-10">Đặt chuyến đi mơ ước của bạn</motion.p>
        </div>

        <div className="px-5 -mt-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
            <div className="aspect-[16/9] relative">
              <img src="/images/sapa.png" alt="Sapa" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/90 text-xs font-medium">✨ Điểm đến nổi bật</p>
                <p className="text-white font-bold text-lg">Ruộng bậc thang Sapa</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-5 pt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="grid grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden shadow-sm">
            {[{ label: 'Số dư', value: '0.000đ' }, { label: 'Tỷ lệ', value: '0.6%' }, { label: 'Tổng số tiền', value: '0đ' }].map((stat) => (
              <div key={stat.label} className="bg-white py-3 px-2 text-center">
                <p className="text-text-muted text-[10px] font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="font-bold text-sm mt-0.5">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} className="text-center mt-8 mb-2">
            <div className="inline-flex items-baseline gap-1">
              <span ref={counterRef} className="text-5xl font-black tracking-tight">{String(orderCount).padStart(2, '0')}</span>
              <span className="text-2xl font-light text-text-muted">/</span>
              <span className="text-2xl font-bold text-text-secondary">{maxOrders}</span>
            </div>
            <div className="mx-auto mt-3 w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div ref={progressRef} className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full" style={{ width: `${(orderCount / maxOrders) * 100}%` }} />
            </div>
          </motion.div>

          <div className="px-3 mt-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleOrder} className="w-full py-4 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/30 relative overflow-hidden group cursor-pointer">
              <span className="relative z-10">ĐẶT TOUR</span>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary" initial={{ x: '-100%' }} whileHover={{ x: '0%' }} transition={{ duration: 0.3 }} />
            </motion.button>
            <AnimatePresence>
              {orderCount > 0 && !exceeded && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center text-sm text-text-secondary mt-3">🎉 Đã đặt {orderCount} tour!</motion.p>
              )}
              {exceeded && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mt-3 flex items-center gap-2 justify-center p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm font-semibold">Bạn đã đặt quá số lượng!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 p-4 bg-surface-dim rounded-2xl border border-border/50 mb-6">
            <h3 className="font-bold text-sm mb-3">Hoạt động gần đây</h3>
            {orderCount === 0 ? (
              <p className="text-text-muted text-xs text-center py-4">Chưa có đơn đặt nào. Hãy bắt đầu! ✈️</p>
            ) : (
              <div className="space-y-2">
                {[...Array(Math.min(orderCount, 3))].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs">🏖️</div>
                    <div className="flex-1"><p className="text-xs font-semibold">Tour #{orderCount - i}</p><p className="text-[10px] text-text-muted">Vừa xong</p></div>
                    <span className="text-xs font-bold text-success">Đã xác nhận</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block p-6 lg:p-8">
        {/* Top bar - synced with Khám phá */}
        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl lg:text-3xl font-bold text-text-primary">Đặt Tour</motion.h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Tìm kiếm tour..." className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm w-48 lg:w-56 placeholder:text-text-muted" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div><p className="text-sm font-semibold text-right">{displayName}</p><p className="text-[11px] text-text-muted text-right">{email}</p></div>
              <UserAvatar size={40} borderClass="border-2 border-primary/30" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden shadow-md relative group cursor-pointer">
              <div className="aspect-[2.2/1] relative">
                <img src="/images/sapa.png" alt="Sapa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-white/80 text-xs font-medium mb-1">✨ Điểm đến nổi bật</p>
                  <h2 className="text-white text-2xl font-bold">Ruộng bậc thang <span className="text-primary-light">Sapa</span></h2>
                  <p className="text-white/60 text-sm mt-1">Vẻ đẹp hùng vĩ của núi rừng Tây Bắc</p>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[{ label: 'Số dư', value: '0.000đ', icon: '💰' }, { label: 'Tỷ lệ hoàn thành', value: '0.6%', icon: '📊' }, { label: 'Tổng số tiền', value: '0đ', icon: '💎' }].map((stat) => (
                <motion.div key={stat.label} whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm text-center cursor-pointer hover:shadow-md transition-all">
                  <p className="text-2xl mb-2">{stat.icon}</p>
                  <p className="text-xl font-black">{stat.value}</p>
                  <p className="text-text-muted text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Activity */}
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-bold text-base mb-4">Hoạt động gần đây</h3>
              {orderCount === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">Chưa có đơn đặt nào. Hãy bắt đầu đặt tour! ✈️</p>
              ) : (
                <div className="space-y-3">
                  {[...Array(Math.min(orderCount, 5))].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface-dim rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🏖️</div>
                      <div className="flex-1"><p className="text-sm font-semibold">Tour #{orderCount - i}</p><p className="text-xs text-text-muted">Vừa xong</p></div>
                      <span className="text-xs font-bold text-success px-3 py-1 bg-green-50 rounded-full">Đã xác nhận</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Order counter */}
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm text-center">
              <h3 className="font-bold text-base mb-4">Đặt chỗ</h3>
              <div className="inline-flex items-baseline gap-1 mb-3">
                <span ref={counterRef} className="text-5xl font-black tracking-tight">{String(orderCount).padStart(2, '0')}</span>
                <span className="text-xl font-light text-text-muted">/</span>
                <span className="text-xl font-bold text-text-secondary">{maxOrders}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                <div ref={progressRef} className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all" style={{ width: `${(orderCount / maxOrders) * 100}%` }} />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={handleOrder} className="w-full py-3.5 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white font-bold text-base rounded-xl shadow-lg shadow-primary/30 cursor-pointer">
                ĐẶT TOUR
              </motion.button>
              <AnimatePresence>
                {orderCount > 0 && !exceeded && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sm text-text-secondary mt-3">🎉 Đã đặt {orderCount} tour!</motion.p>
                )}
                {exceeded && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mt-3 flex items-center gap-2 justify-center p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-red-600 text-sm font-semibold">Bạn đã đặt quá số lượng!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick destinations */}
            <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm">
              <h3 className="font-bold text-sm mb-3">Tour phổ biến</h3>
              {[{ name: 'Sapa', price: '3.1tr', img: '/images/sapa.png' }, { name: 'Hạ Long', price: '4.5tr', img: '/images/halong.png' }, { name: 'Phú Quốc', price: '5.2tr', img: '/images/phuquoc.png' }].map((t) => (
                <div key={t.name} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0 cursor-pointer hover:bg-surface-dim rounded-lg px-1 transition-colors">
                  <div className="w-10 h-10 rounded-lg overflow-hidden"><img src={t.img} alt={t.name} className="w-full h-full object-cover" /></div>
                  <div className="flex-1"><p className="font-semibold text-sm">{t.name}</p></div>
                  <p className="text-xs font-bold text-primary">{t.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
