import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Compass, Bookmark, MapPin, CalendarDays, Camera, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { useUserInfo } from './UserAvatar'
import { useAuth } from '../contexts/AuthContext'

const navLinks = ['Trang chủ', 'Giới thiệu', 'Bảng giá', 'Liên hệ', 'Blog']

const menuItems = [
  { path: '/home', icon: Compass, label: 'Khám phá' },
  { path: '/order', icon: Bookmark, label: 'Đã lưu' },
  { path: '/support', icon: MapPin, label: 'Vị trí' },
  { path: '/schedule', icon: CalendarDays, label: 'Lịch trình' },
  { path: '/photos', icon: Camera, label: 'Ảnh đẹp' },
  { path: '/admin', icon: LayoutDashboard, label: 'Admin' },
  { path: '/settings', icon: Settings, label: 'Cài đặt' },
  { path: '/login', icon: LogOut, label: 'Đăng xuất' },
]

export default function DesktopNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { displayName, email, avatarUrl, initial } = useUserInfo()
  const { signOut } = useAuth()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Don't render on login or home (home has its own transparent hero navbar)
  const isHidden = location.pathname === '/login' || location.pathname === '/home'
  if (isHidden) return null

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 lg:px-12 h-16 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      {/* Left — Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate('/home')}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Travelog
        </span>
      </div>

      {/* Center — Nav links */}
      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-text-secondary text-sm font-medium hover:text-primary transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Right — Search + Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 bg-surface-dim border border-border rounded-xl text-sm w-44 lg:w-52 placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full border-2 border-border overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xs">
                {initial}
              </div>
            )}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-border/60 overflow-hidden py-2 z-[999]"
              >
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">{initial}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    <p className="text-text-muted text-xs truncate">{email}</p>
                  </div>
                </div>

                {/* Menu items */}
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isLogout = item.path === '/login'
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  return (
                    <button
                      key={item.label}
                      onClick={async () => {
                        if (isLogout) {
                          await signOut()
                        }
                        navigate(item.path)
                        setDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                        isLogout ? 'text-red-500 hover:bg-red-50' :
                        isActive ? 'text-primary font-semibold bg-primary-50' :
                        'text-text-secondary hover:bg-surface-dim hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
