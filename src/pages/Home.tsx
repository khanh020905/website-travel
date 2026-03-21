import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import PageTransition from '../components/PageTransition'
import UserAvatar, { useUserInfo } from '../components/UserAvatar'
import HeroSection from '../components/HeroSection'
import LandingSections from '../components/LandingSections'

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
  const { displayName } = useUserInfo()

  useEffect(() => {
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.dest-card')
      gsap.fromTo(cards, { opacity: 0, y: 30, scale: 0.9 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.3,
      })
    }
  }, [])

  return (
    <>
      {/* ===== MOBILE LAYOUT (with page transition) ===== */}
      <PageTransition className="md:hidden">
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
            <UserAvatar size={44} borderClass="border-2 border-white/30" />
            <div>
              <h2 className="text-white font-bold text-lg">Xin chào! 👋</h2>
              <p className="text-white/70 text-xs">{displayName}</p>
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
      </PageTransition>

      {/* ===== DESKTOP LAYOUT (no page transition for instant hero) ===== */}
      <div className="hidden md:block">
        <HeroSection />
        <LandingSections />
      </div>
    </>
  )
}
