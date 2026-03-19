import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, ChevronRight, ChevronDown, Star, MapPin, Play, Ticket } from 'lucide-react'
import gsap from 'gsap'
import PageTransition from '../components/PageTransition'

const destinations = [
  { name: 'Hạ Long', country: 'Quảng Ninh', rating: 4.9, image: '/images/halong.png' },
  { name: 'Hội An', country: 'Quảng Nam', rating: 4.8, image: '/images/hoian.png' },
]

const hotels = [
  { name: 'Vinpearl Resort', location: 'Nha Trang', image: '/images/nhatrang.png' },
  { name: 'Silk Village', location: 'Hội An', image: '/images/hoian.png' },
  { name: 'Topas Ecolodge', location: 'Sapa', image: '/images/sapa.png' },
]

const notifications = [
  { icon: '✈️', title: 'Mua vé thành công', desc: 'Vé máy bay Hà Nội - Đà Nẵng', color: 'bg-blue-50 text-blue-600' },
  { icon: '🏨', title: 'Đặt phòng', desc: 'Vinpearl Resort Nha Trang', color: 'bg-green-50 text-green-600' },
  { icon: '🍽️', title: 'Đặt bàn nhà hàng', desc: 'Nhà hàng Cơm Niêu Sài Gòn', color: 'bg-purple-50 text-purple-600' },
]

const popularDestinations = [
  { name: 'Đà Lạt', image: '/images/dalat.png' },
  { name: 'Sapa', image: '/images/sapa.png' },
  { name: 'Hội An', image: '/images/hoian.png' },
]

const trendingDestinations = [
  { name: 'Phú Quốc', image: '/images/phuquoc.png' },
  { name: 'Nha Trang', image: '/images/nhatrang.png' },
  { name: 'Hạ Long', image: '/images/halong.png' },
]

const recommended = [
  { name: 'Đà Nẵng', subtitle: 'Thành phố đáng sống', price: '2.5tr', image: '/images/danang.png' },
  { name: 'Phú Quốc', subtitle: 'Đảo ngọc thiên đường', price: '3.8tr', image: '/images/phuquoc.png' },
]

const staggerContainer = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Home() {
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.dest-card')
      gsap.fromTo(cards, { opacity: 0, y: 30, scale: 0.9 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.3,
      })
    }
  }, [])

  return (
    <PageTransition>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark rounded-b-[2rem] px-5 pt-4 pb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 -left-5 w-20 h-20 bg-white/5 rounded-full" />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-lg">✈️</motion.div>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-primary" />
            </motion.button>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input type="text" placeholder="Tìm kiếm điểm đến..." className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm shadow-lg shadow-black/5 placeholder:text-text-muted border-0" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Xin chào! 👋</h2>
              <p className="text-white/70 text-xs">Quốc Khanh</p>
            </div>
          </motion.div>
        </div>

        <div className="px-5 pt-5 pb-4" ref={cardsRef}>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">Điểm đến phổ biến</h3>
              <button className="flex items-center gap-1 text-xs text-primary font-semibold">Xem tất cả <ChevronRight className="w-3.5 h-3.5" /></button>
            </motion.div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {popularDestinations.map((dest, i) => (
                <motion.div key={dest.name} variants={fadeUp} whileTap={{ scale: 0.93 }} className="dest-card group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md relative">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-active:scale-110 transition-transform duration-500" loading={i === 0 ? 'eager' : 'lazy'} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2 left-2 text-white text-xs font-semibold drop-shadow">{dest.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">Xu hướng 🔥</h3>
              <button className="flex items-center gap-1 text-xs text-primary font-semibold">Xem tất cả <ChevronRight className="w-3.5 h-3.5" /></button>
            </motion.div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {trendingDestinations.map((dest) => (
                <motion.div key={dest.name} variants={fadeUp} whileTap={{ scale: 0.93 }} className="dest-card group cursor-pointer">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-md relative">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-active:scale-110 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2 left-2 text-white text-xs font-semibold drop-shadow">{dest.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <motion.div variants={fadeUp} className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">Đề xuất ✨</h3>
              <button className="flex items-center gap-1 text-xs text-primary font-semibold">Xem tất cả <ChevronRight className="w-3.5 h-3.5" /></button>
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              {recommended.map((item) => (
                <motion.div key={item.name} variants={fadeUp} whileTap={{ scale: 0.95 }} className="dest-card cursor-pointer">
                  <div className="rounded-2xl overflow-hidden shadow-md bg-white border border-border/50">
                    <div className="aspect-[4/3] overflow-hidden"><img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" /></div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-text-muted text-xs mt-0.5">{item.subtitle}</p>
                      <p className="text-primary font-bold text-sm mt-1">{item.price}<span className="text-text-muted font-normal text-xs">/người</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl lg:text-3xl font-bold text-text-primary">Khám phá</motion.h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Tìm kiếm điểm đến..." className="pl-11 pr-6 py-2.5 bg-white border border-border rounded-xl text-sm w-56 lg:w-72 placeholder:text-text-muted" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div>
                <p className="text-sm font-semibold text-right">Quốc Khanh</p>
                <p className="text-[11px] text-text-muted text-right">khanh@gmail.com</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Hero Banner */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer">
              <div className="aspect-[2.2/1] relative">
                <img src="/images/hero.png" alt="Hội An" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h2 className="text-white text-2xl lg:text-3xl font-bold leading-tight mb-2">
                    Phố cổ <span className="text-primary-light">Hội An</span><br />Thành phố <span className="text-primary-light">đèn lồng</span>
                  </h2>
                  <p className="text-white/70 text-sm max-w-sm mb-4">Khám phá vẻ đẹp cổ kính với những con phố rực rỡ đèn lồng bên dòng sông Thu Bồn</p>
                  <div className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/30 cursor-pointer"><Ticket className="w-4 h-4" /> Đặt vé</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-xl border border-white/20 cursor-pointer"><Play className="w-4 h-4 fill-white" /> Xem video</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Destination + Hotels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Điểm đến</h3>
                  <button className="flex items-center gap-1 text-xs text-text-muted font-medium cursor-pointer hover:text-text-primary">Thành phố <ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {destinations.map((dest) => (
                    <motion.div key={dest.name} whileHover={{ y: -4 }} className="rounded-2xl overflow-hidden shadow-sm border border-border/50 bg-white cursor-pointer group">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-white/90 rounded-full"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /><span className="text-[11px] font-bold">{dest.rating}</span></div>
                        <div className="absolute bottom-3 left-3">
                          <p className="text-white font-bold text-sm">{dest.name}</p>
                          <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-white/70" /><p className="text-white/70 text-xs">{dest.country}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">Khách sạn</h3>
                  <button className="flex items-center gap-1 text-xs text-text-muted font-medium cursor-pointer hover:text-text-primary">Gần nhất <ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
                <div className="space-y-3">
                  {hotels.map((hotel) => (
                    <motion.div key={hotel.name} whileHover={{ x: 4 }} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-border/50 cursor-pointer hover:shadow-sm transition-shadow">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"><img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{hotel.name}</p>
                        <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-text-muted" /><p className="text-xs text-text-muted">{hotel.location}</p></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm">
              <h3 className="text-base font-bold mb-4">Thông báo</h3>
              <div className="space-y-3">
                {notifications.map((notif, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${notif.color}`}>{notif.icon}</div>
                    <div className="min-w-0"><p className="font-semibold text-sm">{notif.title}</p><p className="text-text-muted text-xs mt-0.5 truncate">{notif.desc}</p></div>
                  </div>
                ))}
              </div>
              <button className="text-primary text-xs font-semibold mt-4 cursor-pointer hover:underline">Xem thêm...</button>
            </div>

            {/* Dragon Bridge Location */}
            <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm">
              <h3 className="text-base font-bold mb-3">Vị trí</h3>
              <div className="aspect-[4/3] rounded-xl overflow-hidden relative group cursor-pointer">
                <img src="/images/dragon_bridge.png" alt="Cầu Rồng Đà Nẵng" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-white font-bold text-xs drop-shadow">Cầu Rồng, Đà Nẵng</p>
                  </div>
                </div>
                {/* Map pins */}
                <div className="absolute top-4 right-4 w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
