import { useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import {
  Compass,
  Bookmark,
  MapPin,
  CalendarDays,
  Camera,
  Settings,
  LogOut,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react'

const mainMenu = [
  { path: '/home', icon: Compass, label: 'Khám phá' },
  { path: '/order', icon: Bookmark, label: 'Đã lưu' },
  { path: '/support', icon: MapPin, label: 'Vị trí' },
  { path: '/schedule', icon: CalendarDays, label: 'Lịch trình' },
  { path: '/photos', icon: Camera, label: 'Ảnh đẹp' },
]

const secondaryMenu = [
  { path: '/admin', icon: LayoutDashboard, label: 'Admin' },
  { path: '/settings', icon: Settings, label: 'Cài đặt' },
  { path: '/login', icon: LogOut, label: 'Đăng xuất' },
]

export default function DesktopSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!ringRef.current) return

    // Animate the ring drawing
    gsap.fromTo(ringRef.current,
      { strokeDashoffset: 138 },
      { strokeDashoffset: 0, duration: 1.8, ease: 'power3.out', delay: 0.3 }
    )

    // Subtle pulse
    gsap.to(ringRef.current, {
      opacity: 1,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: 2,
    })
  }, [])

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] lg:w-[240px] bg-white flex-col z-50 border-r border-border/60">
      <div className="px-6 pt-7 pb-5 flex items-center gap-3">
        <div className="relative w-11 h-11 flex-shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="shineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Shield body */}
            <path d="M24 4 L42 12 L42 28 Q42 40 24 46 Q6 40 6 28 L6 12 Z" fill="url(#logoGrad)" />
            {/* Shine overlay */}
            <path d="M24 4 L42 12 L42 28 Q42 40 24 46 Q6 40 6 28 L6 12 Z" fill="url(#shineGrad)" clipPath="inset(0 0 50% 0)" />
            {/* Globe lines */}
            <circle cx="24" cy="24" r="11" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />
            <ellipse cx="24" cy="24" rx="5" ry="11" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
            <line x1="13" y1="24" x2="35" y2="24" stroke="white" strokeWidth="1" opacity="0.4" />
            <line x1="15" y1="18" x2="33" y2="18" stroke="white" strokeWidth="0.7" opacity="0.3" />
            <line x1="15" y1="30" x2="33" y2="30" stroke="white" strokeWidth="0.7" opacity="0.3" />
            {/* Airplane */}
            <g transform="translate(24, 22) rotate(-30)">
              <path d="M0 -8 L2 -3 L8 0 L2 1 L1 6 L0 4 L-1 6 L-2 1 L-8 0 L-2 -3 Z" fill="white" />
            </g>
            {/* Ring accent */}
            <circle
              ref={ringRef}
              cx="24" cy="24" r="22" fill="none"
              stroke="#fdba74" strokeWidth="1.5" strokeLinecap="round"
              strokeDasharray="138" strokeDashoffset="138"
              opacity="0.7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Du Lịch
        </h1>
      </div>

      <div className="px-4 flex-1">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">Menu chính</p>
        <nav className="space-y-0.5">
          {mainMenu.map((item) => {
            const active = location.pathname === item.path
            const Icon = item.icon
            return (
              <motion.button key={item.label} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer relative ${active ? 'text-primary font-semibold bg-primary-50' : 'text-text-secondary hover:text-text-primary hover:bg-surface-dim'}`}>
                {active && <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />}
                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-sm">{item.label}</span>
                {active && <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />}
              </motion.button>
            )
          })}
        </nav>

        <div className="mt-6">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 mb-2">Khác</p>
          <nav className="space-y-0.5">
            {secondaryMenu.map((item) => {
              const active = item.path === '/admin' 
                ? location.pathname.startsWith('/admin')
                : location.pathname === item.path
              const Icon = item.icon
              return (
                <motion.button key={item.label} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer relative ${active ? 'text-primary font-semibold bg-primary-50' : 'text-text-secondary hover:text-text-primary hover:bg-surface-dim'}`}>
                  {active && <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />}
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="bg-surface-dim rounded-2xl p-4 text-center border border-border/50">
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs text-text-secondary mb-1">
            Nâng cấp <span className="font-bold text-primary">ứng dụng</span><br />
            để <span className="font-bold text-danger">xóa</span> quảng cáo
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-2 w-full py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 cursor-pointer">
            Nâng cấp
          </motion.button>
        </div>
      </div>
    </aside>
  )
}
