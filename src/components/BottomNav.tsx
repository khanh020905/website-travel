import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Compass, Globe, Headphones, User } from 'lucide-react'

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/order', icon: Compass, label: 'Order' },
  { path: '/support', icon: Globe, label: '', isCenter: true },
  { path: '/support', icon: Headphones, label: 'CSKH' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.3 }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 md:hidden"
    >
      {/* Gradient fade above nav */}
      <div className="h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      <div className="bg-gradient-to-r from-primary via-primary-light to-primary rounded-t-3xl px-2 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-4px_30px_rgba(249,115,22,0.3)]">
        <div className="flex items-end justify-around">
          {navItems.map((item) => {
            const isActive = item.path === '/home' 
              ? location.pathname === '/home' || location.pathname === '/'
              : location.pathname.startsWith(item.path)
            const Icon = item.icon

            if (item.isCenter) {
              return (
                <motion.button
                  key="center"
                  whileTap={{ scale: 0.9, rotate: -10 }}
                  onClick={() => navigate('/support')}
                  className="-mt-7 relative"
                >
                  <div className="absolute inset-0 rounded-full bg-primary/30 scale-125 blur-md" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center shadow-xl border-4 border-white/90">
                    <Globe className="w-7 h-7 text-white" />
                    <div className="absolute inset-0 rounded-full">
                      <div className="absolute top-1 right-0 w-3 h-3 bg-orange-400 rounded-full shadow-md" />
                    </div>
                  </div>
                </motion.button>
              )
            }

            return (
              <motion.button
                key={item.path + item.label}
                whileTap={{ scale: 0.85 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-2 px-3 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-8 h-1 bg-white rounded-full"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
