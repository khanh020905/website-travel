import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Mail, Clock, ChevronRight, Headphones, Search } from 'lucide-react'
import UserAvatar, { useUserInfo } from '../components/UserAvatar'
import PageTransition from '../components/PageTransition'
import ChatWidget from '../components/ChatWidget'

const faqItems = [
  { q: 'Làm sao để đặt tour?', a: 'Duyệt qua các điểm đến và nhấn nút ĐẶT TOUR để bắt đầu đặt chuyến đi.' },
  { q: 'Phương thức thanh toán?', a: 'Chúng tôi chấp nhận VISA, Mastercard, Momo, ZaloPay và chuyển khoản ngân hàng.' },
  { q: 'Chính sách hoàn tiền?', a: 'Miễn phí hủy trong vòng 24 giờ sau khi đặt. Sau đó sẽ áp dụng phí nhỏ.' },
  { q: 'Liên hệ hỗ trợ?', a: 'Chat trực tiếp 24/7 hoặc gửi email cho chúng tôi.' },
]

const contactMethods = [
  { icon: MessageCircle, label: 'Chat trực tiếp', desc: 'Chat ngay', color: 'bg-blue-500', action: 'chat' },
  { icon: Mail, label: 'Email', desc: 'hotro@abaytripvior.vn', color: 'bg-purple-500', action: 'email' },
]

const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } }

export default function Support() {
  const { displayName, email } = useUserInfo()
  const [chatOpen, setChatOpen] = useState(false)

  const handleContact = (action: string) => {
    if (action === 'chat') {
      setChatOpen(true)
    } else if (action === 'email') {
      window.location.href = 'mailto:hotro@abaytripvior.vn'
    }
  }

  return (
    <PageTransition>
      {/* ===== MOBILE ===== */}
      <div className="md:hidden">
        <div className="bg-gradient-to-br from-primary via-primary to-primary-dark px-5 pt-4 pb-8 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Headphones className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-white font-bold text-xl">Chăm sóc khách hàng</h1>
              <p className="text-white/70 text-xs">Trung tâm hỗ trợ 24/7</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mt-4 flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 relative z-10">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">Đang trực tuyến — phản hồi trong 2 phút</span>
          </motion.div>
        </div>

        <div className="px-5 pt-5">
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2.5 mb-6">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <motion.button key={method.label} variants={fadeUp} whileTap={{ scale: 0.97 }} onClick={() => handleContact(method.action)} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 active:bg-gray-50 cursor-pointer">
                  <div className={`w-11 h-11 rounded-xl ${method.color} flex items-center justify-center shadow-md`}><Icon className="w-5 h-5 text-white" /></div>
                  <div className="flex-1 text-left"><p className="font-semibold text-sm">{method.label}</p><p className="text-text-muted text-xs">{method.desc}</p></div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </motion.button>
              )
            })}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 p-4 bg-primary-50 rounded-2xl mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <div><p className="font-semibold text-sm">Giờ hoạt động</p><p className="text-text-secondary text-xs">24/7 — Luôn sẵn sàng hỗ trợ bạn</p></div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h3 className="font-bold text-base mb-3">Câu hỏi thường gặp</h3>
            <div className="space-y-2 pb-6">
              {faqItems.map((item, i) => (
                <motion.details key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }} className="group bg-surface-dim rounded-xl border border-border/50 overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-sm list-none">{item.q}<ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" /></summary>
                  <div className="px-4 pb-3 text-text-secondary text-xs">{item.a}</div>
                </motion.details>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block p-6 lg:p-8">
        {/* Top bar - synced with Khám phá */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl lg:text-3xl font-bold text-text-primary">Hỗ trợ</motion.h1>
            <p className="text-text-muted text-sm mt-0.5">Trung tâm chăm sóc khách hàng</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input type="text" placeholder="Tìm câu hỏi..." className="pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm w-48 lg:w-56 placeholder:text-text-muted" />
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div><p className="text-sm font-semibold text-right">{displayName}</p><p className="text-[11px] text-text-muted text-right">{email}</p></div>
              <UserAvatar size={40} borderClass="border-2 border-primary/30" />
            </div>
          </div>
        </div>

        {/* Online status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-6 w-fit">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 text-sm font-medium">Đang trực tuyến — phản hồi trong 2 phút</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Left */}
          <div className="space-y-6">
            {/* Contact methods */}
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2"><Headphones className="w-5 h-5 text-primary" /> Liên hệ với chúng tôi</h3>
              <div className="grid grid-cols-2 gap-4">
                {contactMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <motion.button key={method.label} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => handleContact(method.action)} className="p-5 rounded-2xl border border-border/50 text-center hover:shadow-md transition-all cursor-pointer group">
                      <div className={`w-12 h-12 rounded-xl ${method.color} flex items-center justify-center shadow-md mx-auto mb-3 group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6 text-white" /></div>
                      <p className="font-semibold text-sm">{method.label}</p>
                      <p className="text-text-muted text-xs mt-0.5">{method.desc}</p>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <h3 className="font-bold text-base mb-4">Câu hỏi thường gặp</h3>
              <div className="space-y-2">
                {faqItems.map((item, i) => (
                  <motion.details key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="group bg-surface-dim rounded-xl border border-border/50 overflow-hidden hover:shadow-sm transition-shadow">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-sm list-none">{item.q}<ChevronRight className="w-4 h-4 text-text-muted group-open:rotate-90 transition-transform" /></summary>
                    <div className="px-4 pb-3 text-text-secondary text-sm">{item.a}</div>
                  </motion.details>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <div><p className="font-bold text-sm">Giờ hoạt động</p><p className="text-text-muted text-xs">24/7 — Luôn sẵn sàng</p></div>
              </div>
              <div className="space-y-2">
                {['Thứ 2 - Thứ 6: 8:00 - 22:00', 'Thứ 7 - CN: 9:00 - 21:00', 'Online chat: 24/7'].map((time) => (
                  <div key={time} className="flex items-center gap-2 text-sm text-text-secondary"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" />{time}</div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-md">
              <h3 className="font-bold text-lg mb-2">Chat trực tiếp ngay!</h3>
              <p className="text-white/70 text-sm mb-4">Nhấn để kết nối với đội ngũ hỗ trợ chuyên nghiệp 24/7.</p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setChatOpen(true)} className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" /> Bắt đầu chat
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </PageTransition>
  )
}
