import { motion } from 'framer-motion'
import { Wallet, History, Settings, MapPin, Lock, Globe, LogOut, ChevronRight, CreditCard, Shield, Search, Edit3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

const menuItems = [
  { icon: Wallet, label: 'Rút tiền', desc: 'Chuyển tiền về tài khoản', color: 'text-green-500', bgColor: 'bg-green-50' },
  { icon: History, label: 'Lịch sử giao dịch', desc: 'Xem các giao dịch gần đây', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { icon: CreditCard, label: 'Số tài khoản', desc: 'Thông tin tài khoản ngân hàng', color: 'text-purple-500', bgColor: 'bg-purple-50' },
]

const settingsItems = [
  { icon: MapPin, label: 'Địa chỉ ví', desc: 'Wallet address' },
  { icon: Lock, label: 'Thay đổi mật khẩu', desc: 'Đổi mật khẩu' },
  { icon: Globe, label: 'Tiếng Việt', desc: 'Ngôn ngữ' },
  { icon: Shield, label: 'Quyền riêng tư', desc: 'Cài đặt bảo mật' },
]

const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function Profile() {
  const navigate = useNavigate()

  return (
    <PageTransition>
      {/* ===== MOBILE ===== */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-5 pt-4 pb-16 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-10 w-16 h-16 bg-white/5 rounded-full" />
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-white font-bold text-xl">Tài khoản</h1>
              <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center cursor-pointer"><Settings className="w-4.5 h-4.5 text-white" /></motion.button>
            </div>
            <div className="flex items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.2 }} className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/40 shadow-lg"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" alt="Avatar" className="w-full h-full object-cover" /></div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-400 rounded-full border-2 border-primary" />
              </motion.div>
              <div>
                <h2 className="text-white font-bold text-lg">Quốc Khanh</h2>
                <p className="text-white/60 text-xs">khanh@gmail.com</p>
                <div className="mt-1"><div className="px-2 py-0.5 bg-white/15 rounded-full inline-block"><span className="text-white/80 text-[10px] font-medium">⭐ Thành viên Premium</span></div></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-5 -mt-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-lg shadow-black/5 p-5 border border-border/50">
            <div className="flex items-center justify-between">
              <div><p className="text-text-muted text-xs font-medium">Số dư khả dụng</p><p className="text-2xl font-black mt-0.5">0.000đ</p></div>
              <motion.button whileTap={{ scale: 0.95 }} className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold rounded-xl shadow-md shadow-primary/20 cursor-pointer">Rút tiền</motion.button>
            </div>
          </motion.div>
        </div>

        <div className="px-5 pt-5">
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button key={item.label} variants={fadeUp} whileTap={{ scale: 0.97 }} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 active:bg-gray-50 cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}><Icon className={`w-5 h-5 ${item.color}`} /></div>
                  <div className="flex-1 text-left"><p className="font-semibold text-sm">{item.label}</p><p className="text-text-muted text-xs">{item.desc}</p></div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </motion.button>
              )
            })}
          </motion.div>

          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Cài đặt</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden divide-y divide-border/50 mb-6">
            {settingsItems.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 cursor-pointer">
                  <Icon className="w-4.5 h-4.5 text-text-secondary" />
                  <div className="flex-1 text-left"><p className="font-medium text-sm">{item.label}</p></div>
                  <span className="text-text-muted text-xs">{item.desc}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted ml-1" />
                </button>
              )
            })}
          </div>

          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')} className="w-full mb-6 flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-500 font-semibold text-sm rounded-2xl border border-red-100 cursor-pointer">
            <LogOut className="w-4.5 h-4.5" /> Đăng xuất
          </motion.button>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block p-6 lg:p-8">
        {/* Top bar - synced */}
        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl lg:text-3xl font-bold text-text-primary">Tài khoản</motion.h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm w-48 lg:w-56 placeholder:text-text-muted" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div><p className="text-sm font-semibold text-right">Quốc Khanh</p><p className="text-[11px] text-text-muted text-right">khanh@gmail.com</p></div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="Avatar" className="w-full h-full object-cover" /></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Profile card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md"><img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" alt="Avatar" className="w-full h-full object-cover" /></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Quốc Khanh</h2>
                  <p className="text-text-muted text-sm">khanh@gmail.com</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary-50 text-primary text-xs font-semibold rounded-full">⭐ Premium</span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">Đã xác minh</span>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2.5 bg-surface-dim rounded-xl hover:bg-primary-50 transition-colors cursor-pointer">
                  <Edit3 className="w-4 h-4 text-text-secondary" />
                </motion.button>
              </div>
            </motion.div>

            {/* Balance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div><p className="text-white/70 text-sm font-medium">Số dư khả dụng</p><p className="text-3xl font-black mt-1">0.000đ</p></div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 bg-white text-primary font-bold text-sm rounded-xl shadow-md cursor-pointer">Rút tiền</motion.button>
              </div>
            </motion.div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-4">
              {menuItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.button key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm text-center hover:shadow-md transition-all cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}><Icon className={`w-6 h-6 ${item.color}`} /></div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-text-muted text-xs mt-0.5">{item.desc}</p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Settings */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3"><h3 className="font-bold text-base">Cài đặt</h3></div>
              <div className="divide-y divide-border/50">
                {settingsItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.button key={item.label} whileHover={{ x: 3 }} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-dim transition-colors cursor-pointer">
                      <Icon className="w-4.5 h-4.5 text-text-secondary" />
                      <div className="flex-1 text-left"><p className="font-medium text-sm">{item.label}</p></div>
                      <span className="text-text-muted text-xs">{item.desc}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted ml-1" />
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Logout */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-500 font-semibold text-sm rounded-2xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
              <LogOut className="w-4.5 h-4.5" /> Đăng xuất
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
