import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Compass, Bookmark, MapPin, CalendarDays, Camera, LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { useUserInfo } from './UserAvatar'
import { useAuth } from '../contexts/AuthContext'

const navLinks = ['Trang chủ', 'Giới thiệu', 'Bảng giá', 'Liên hệ', 'Blog']

const featureCards = [
  {
    title: 'Lựa Chọn Hàng Đầu',
    desc: 'Hơn 600 điểm đến hấp dẫn đang chờ bạn khám phá.',
  },
  {
    title: 'Hướng Dẫn Chất Lượng',
    desc: 'Đội ngũ hướng dẫn viên với hơn 20 năm kinh nghiệm.',
  },
  {
    title: 'Đặt Vé Dễ Dàng',
    desc: 'Hệ thống đặt vé hiện đại, nhanh chóng và tiện lợi.',
  },
]

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

export default function HeroSection() {
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

  return (
    <section className="travelog-hero">
      <div className="travelog-hero__bg">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2400&q=90&auto=format"
          alt="Phong cảnh núi non"
          className="travelog-hero__bg-img"
        />
        <div className="travelog-hero__overlay" />
      </div>

      <nav className="travelog-nav">
        <div className="travelog-nav__left">
          <div className="travelog-nav__logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
          <span className="travelog-nav__brand">Travelog</span>
        </div>

        <div className="travelog-nav__center">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="travelog-nav__link">
              {link}
            </a>
          ))}
        </div>

        <div className="travelog-nav__right">
          <div className="travelog-nav__search">
            <Search className="w-4 h-4 text-white/60" />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="travelog-nav__avatar overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white font-bold text-sm">{initial}</span>
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="travelog-dropdown"
                >
                  <div className="travelog-dropdown__header">
                    <div className="travelog-dropdown__avatar-lg">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg">{initial}</div>
                      )}
                    </div>
                    <div>
                      <p className="travelog-dropdown__name">{displayName}</p>
                      <p className="travelog-dropdown__email">{email}</p>
                    </div>
                  </div>
                  <div className="travelog-dropdown__divider" />
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
                        className={`travelog-dropdown__item ${isLogout ? 'travelog-dropdown__item--danger' : ''} ${isActive && !isLogout ? 'travelog-dropdown__item--active' : ''}`}
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

      <div className="travelog-hero__content">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="travelog-hero__heading"
        >
          Thế Giới Rộng Lớn<br />
          Đang Chờ Bạn<br />
          Khám Phá.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="travelog-hero__subtitle"
        >
          Khám phá những điểm đến mới và trải nghiệm phù hợp<br />
          với sở thích và phong cách du lịch của bạn.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="travelog-hero__cta"
        >
          Đặt Ngay
        </motion.button>
      </div>

      <div className="travelog-hero__cards">
        {featureCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
            className="travelog-feature-card"
          >
            <h3 className="travelog-feature-card__title">{card.title}</h3>
            <p className="travelog-feature-card__desc">{card.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
