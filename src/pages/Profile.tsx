import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wallet, History, Settings, MapPin, Lock, Globe, LogOut, ChevronRight, Shield, Search, Edit3, LayoutDashboard, ArrowDownLeft, DollarSign, RefreshCw, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserAvatar, { useUserInfo, useUserRole } from '../components/UserAvatar'
import PageTransition from '../components/PageTransition'
import ChatWidget from '../components/ChatWidget'
import { supabase } from '../lib/supabase'

interface Transaction {
  id: string
  user_id: string
  amount: number
  type: string
  description: string
  balance_after: number
  created_at: string
}

const menuItems = [
  { icon: Wallet, label: 'Rút tiền', desc: 'Chuyển tiền về tài khoản', color: 'text-green-500', bgColor: 'bg-green-50', action: 'withdraw' },
  { icon: History, label: 'Lịch sử giao dịch', desc: 'Xem các giao dịch gần đây', color: 'text-blue-500', bgColor: 'bg-blue-50', action: 'history' },
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
  const { signOut, user } = useAuth()
  const { displayName, email } = useUserInfo()
  const { isAdmin } = useUserRole()
  const [balance, setBalance] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const WITHDRAW_MSG = 'Tôi đang muốn rút tiền bạn có thể hỗ trợ tôi được không'

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.balance != null) setBalance(parseFloat(data.balance))
        })
    }
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return
    setTxLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setTransactions(data)
    setTxLoading(false)
  }

  const handleWithdraw = () => {
    setChatOpen(true)
  }

  const handleMenuClick = (action: string) => {
    if (action === 'withdraw') handleWithdraw()
    if (action === 'history') {
      setShowHistory(!showHistory)
      if (!showHistory && transactions.length === 0) fetchTransactions()
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

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
                <UserAvatar size={64} borderClass="border-3 border-white/40 shadow-lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-400 rounded-full border-2 border-primary" />
              </motion.div>
              <div>
                <h2 className="text-white font-bold text-lg">{displayName}</h2>
                <p className="text-white/60 text-xs">{email}</p>
                <div className="mt-1"><div className="px-2 py-0.5 bg-white/15 rounded-full inline-block"><span className="text-white/80 text-[10px] font-medium">⭐ Thành viên Premium</span></div></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-5 -mt-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-lg shadow-black/5 p-5 border border-border/50">
            <div className="flex items-center justify-between">
              <div><p className="text-text-muted text-xs font-medium">Số dư khả dụng</p><p className="text-2xl font-black mt-0.5">${balance.toFixed(2)}</p></div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleWithdraw} className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold rounded-xl shadow-md shadow-primary/20 cursor-pointer">Rút tiền</motion.button>
            </div>
          </motion.div>
        </div>

        <div className="px-5 pt-5">
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.button key={item.label} variants={fadeUp} whileTap={{ scale: 0.97 }} onClick={() => handleMenuClick(item.action)} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 active:bg-gray-50 cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}><Icon className={`w-5 h-5 ${item.color}`} /></div>
                  <div className="flex-1 text-left"><p className="font-semibold text-sm">{item.label}</p><p className="text-text-muted text-xs">{item.desc}</p></div>
                  <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${item.action === 'history' && showHistory ? 'rotate-90' : ''}`} />
                </motion.button>
              )
            })}
          </motion.div>

          {showHistory && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 pb-3 border-b border-border/50">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-500" /> Lịch sử giao dịch
                    {transactions.length > 0 && <span className="text-[10px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">{transactions.length}</span>}
                  </h3>
                  <button onClick={fetchTransactions} className="flex items-center gap-1 text-primary text-[10px] font-semibold cursor-pointer hover:underline">
                    <RefreshCw className="w-3 h-3" /> Làm mới
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {txLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8"><History className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-text-muted text-xs">Chưa có giao dịch nào</p></div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {tx.type === 'booking' ? '🏖️' : '💸'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-xs truncate">{tx.description}</p>
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">
                                <ArrowDownLeft className="w-2 h-2 inline mr-0.5" />{tx.type === 'booking' ? 'Đặt tour' : tx.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-muted">{formatDate(tx.created_at)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-xs font-black ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount).toFixed(2)}
                            </p>
                            <p className="text-[9px] text-text-muted flex items-center gap-0.5 justify-end">
                              <DollarSign className="w-2 h-2" />{(tx.balance_after ?? 0).toFixed(2)} còn lại
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

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

          {isAdmin && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/admin')}
              className="w-full mb-4 flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 active:bg-purple-100 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-purple-700">Bảng điều khiển</p>
                <p className="text-purple-400 text-xs">Quản trị hệ thống</p>
              </div>
              <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">Admin</span>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </motion.button>
          )}

          <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout} className="w-full mb-6 flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-500 font-semibold text-sm rounded-2xl border border-red-100 cursor-pointer">
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
              <div><p className="text-sm font-semibold text-right">{displayName}</p><p className="text-[11px] text-text-muted text-right">{email}</p></div>
              <UserAvatar size={40} borderClass="border-2 border-primary/30" />
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
                  <UserAvatar size={80} className="rounded-2xl shadow-md" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="text-text-muted text-sm">{email}</p>
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
                <div><p className="text-white/70 text-sm font-medium">Số dư khả dụng</p><p className="text-3xl font-black mt-1">${balance.toFixed(2)}</p></div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleWithdraw} className="px-6 py-3 bg-white text-primary font-bold text-sm rounded-xl shadow-md cursor-pointer">Rút tiền</motion.button>
              </div>
            </motion.div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.button key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }} whileHover={{ y: -4 }} onClick={() => handleMenuClick(item.action)} className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm text-center hover:shadow-md transition-all cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}><Icon className={`w-6 h-6 ${item.color}`} /></div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-text-muted text-xs mt-0.5">{item.desc}</p>
                  </motion.button>
                )
              })}
            </div>

            {/* Transaction history */}
            {showHistory && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-5 pb-4 border-b border-border/50">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <History className="w-5 h-5 text-blue-500" /> Lịch sử giao dịch
                      {transactions.length > 0 && <span className="ml-1 text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">{transactions.length}</span>}
                    </h3>
                    <button onClick={fetchTransactions} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline">
                      <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                    </button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {txLoading ? (
                      <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>
                    ) : transactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <History className="w-10 h-10 text-gray-300 mb-2" />
                        <p className="text-text-muted text-sm">Chưa có giao dịch nào</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {transactions.map((tx) => (
                          <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {tx.type === 'booking' ? '🏖️' : '💸'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm truncate">{tx.description}</p>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 flex-shrink-0">
                                  <ArrowDownLeft className="w-2.5 h-2.5 inline mr-0.5" />{tx.type === 'booking' ? 'Đặt tour' : tx.type}
                                </span>
                              </div>
                              <p className="text-[10px] text-text-muted truncate">{tx.description} • {formatDate(tx.created_at)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className={`text-sm font-black ${tx.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {tx.amount < 0 ? '' : '+'}${Math.abs(tx.amount).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-text-muted flex items-center gap-0.5 justify-end">
                                <DollarSign className="w-2.5 h-2.5" />{(tx.balance_after ?? 0).toFixed(2)} còn lại
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
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

            {isAdmin && (
              <motion.button
                whileHover={{ x: 3 }}
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors cursor-pointer rounded-b-2xl"
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-purple-600" />
                <div className="flex-1 text-left"><p className="font-medium text-sm text-purple-700">Bảng điều khiển</p></div>
                <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 ml-1" />
              </motion.button>
            )}

            {/* Logout */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 text-red-500 font-semibold text-sm rounded-2xl border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
              <LogOut className="w-4.5 h-4.5" /> Đăng xuất
            </motion.button>
          </div>
        </div>
      </div>
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} initialMessage={WITHDRAW_MSG} />
    </PageTransition>
  )
}
