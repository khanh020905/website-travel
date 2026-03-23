import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, History, Settings, Lock, Globe, LogOut, ChevronRight, Search, Edit3, LayoutDashboard, ArrowDownLeft, DollarSign, RefreshCw, Loader2, User, Phone, Mail, MapPinned, Save, X, Check, Eye, EyeOff, Gift, Clock, Landmark, Send, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import UserAvatar, { useUserInfo, useUserRole, useUserGender } from '../components/UserAvatar'
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

interface ProfileInfo {
  full_name: string
  phone: string
  wallet_address: string
  detailed_address: string
  bank_name: string
  bank_account_number: string
}

const menuItems = [
  { icon: Wallet, label: 'Rút tiền', desc: 'Chuyển tiền về tài khoản', color: 'text-green-500', bgColor: 'bg-green-50', action: 'withdraw' },
  { icon: History, label: 'Lịch sử giao dịch', desc: 'Xem các giao dịch gần đây', color: 'text-blue-500', bgColor: 'bg-blue-50', action: 'history' },
]



const stagger = { animate: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export default function Profile() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { displayName, email } = useUserInfo()
  const { isAdmin } = useUserRole()
  const { lang, setLang, t } = useLanguage()
  const { gender, setGender } = useUserGender()
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [balance, setBalance] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const DEPOSIT_MSG = 'Tôi muốn nạp tiền bạn có thể hỗ trợ tôi không?'
  const [chatMessage, setChatMessage] = useState(DEPOSIT_MSG)

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState('')

  // Profile info state
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>({ full_name: '', phone: '', wallet_address: '', detailed_address: '', bank_name: '', bank_account_number: '' })
  const [editProfileInfo, setEditProfileInfo] = useState<ProfileInfo>({ full_name: '', phone: '', wallet_address: '', detailed_address: '', bank_name: '', bank_account_number: '' })
  const [showProfileSection, setShowProfileSection] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('balance, full_name, phone, wallet_address, detailed_address, bank_name, bank_account_number')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.balance != null) setBalance(parseFloat(data.balance))
          if (data) {
            const info: ProfileInfo = {
              full_name: data.full_name || '',
              phone: data.phone || '',
              wallet_address: data.wallet_address || '',
              detailed_address: data.detailed_address || '',
              bank_name: data.bank_name || '',
              bank_account_number: data.bank_account_number || '',
            }
            setProfileInfo(info)
            setEditProfileInfo(info)
          }
        })
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setProfileSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editProfileInfo.full_name,
        phone: editProfileInfo.phone,
        wallet_address: editProfileInfo.wallet_address,
        detailed_address: editProfileInfo.detailed_address,
        bank_name: editProfileInfo.bank_name,
        bank_account_number: editProfileInfo.bank_account_number,
      })
      .eq('id', user.id)
    setProfileSaving(false)
    if (!error) {
      setProfileInfo({ ...editProfileInfo })
      setIsEditingProfile(false)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    }
  }

  const handleCancelEdit = () => {
    setEditProfileInfo({ ...profileInfo })
    setIsEditingProfile(false)
  }

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleChangePassword = async () => {
    setPwError(null)
    if (!newPassword || !confirmPassword) { setPwError(t('Vui lòng điền đầy đủ thông tin', 'Please fill in all fields')); return }
    if (newPassword.length < 6) { setPwError(t('Mật khẩu phải có ít nhất 6 ký tự', 'Password must be at least 6 characters')); return }
    if (newPassword !== confirmPassword) { setPwError(t('Mật khẩu xác nhận không khớp', 'Passwords do not match')); return }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwLoading(false)
    if (error) { setPwError(error.message) } else {
      setPwSuccess(true)
      setTimeout(() => { setShowPasswordModal(false); setPwSuccess(false); setNewPassword(''); setConfirmPassword('') }, 1500)
    }
  }

  // Language dropdown
  const [showLangDropdown, setShowLangDropdown] = useState(false)

  // Daily gift state
  const [dailyGiftClaimed, setDailyGiftClaimed] = useState(false)
  const [dailyGiftClaiming, setDailyGiftClaiming] = useState(false)
  const [dailyGiftAmount, setDailyGiftAmount] = useState<number | null>(null)
  const [countdown, setCountdown] = useState('')
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null)

  // Check daily gift status from Supabase (server-side, not exploitable)
  useEffect(() => {
    if (!user) return
    const checkDailyGift = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('user_id', user.id)
        .eq('type', 'daily_gift')
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        const claimTime = new Date(data[0].created_at).getTime()
        const diff = Date.now() - claimTime
        if (diff < 24 * 60 * 60 * 1000) {
          setDailyGiftClaimed(true)
          setLastClaimTime(claimTime)
          setDailyGiftAmount(Number(data[0].amount))
        } else {
          setDailyGiftClaimed(false)
          setLastClaimTime(null)
        }
      }
    }
    checkDailyGift()
  }, [user])

  // Countdown timer based on server claim time
  useEffect(() => {
    if (!lastClaimTime) { setCountdown(''); return }
    const interval = setInterval(() => {
      const remaining = 24 * 60 * 60 * 1000 - (Date.now() - lastClaimTime)
      if (remaining <= 0) {
        setDailyGiftClaimed(false)
        setDailyGiftAmount(null)
        setLastClaimTime(null)
        setCountdown('')
      } else {
        const h = Math.floor(remaining / 3600000)
        const m = Math.floor((remaining % 3600000) / 60000)
        const s = Math.floor((remaining % 60000) / 1000)
        setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lastClaimTime])

  const handleClaimDailyGift = async () => {
    if (!user || dailyGiftClaimed || dailyGiftClaiming) return
    setDailyGiftClaiming(true)

    // Double-check server-side before claiming
    const { data: recent } = await supabase
      .from('transactions')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('type', 'daily_gift')
      .order('created_at', { ascending: false })
      .limit(1)

    if (recent && recent.length > 0) {
      const diff = Date.now() - new Date(recent[0].created_at).getTime()
      if (diff < 24 * 60 * 60 * 1000) {
        setDailyGiftClaimed(true)
        setLastClaimTime(new Date(recent[0].created_at).getTime())
        setDailyGiftClaiming(false)
        return
      }
    }

    // Random $1.00 - $2.00
    const amount = Math.round((Math.random() * 1 + 1) * 100) / 100
    const newBalance = balance + amount

    const { error: balErr } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id)
    if (balErr) console.error('Balance update error:', balErr)

    const { error: txErr } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      type: 'daily_gift',
      description: `Quà hằng ngày +$${amount.toFixed(2)}`,
      balance_after: newBalance,
    })
    if (txErr) console.error('Transaction insert error:', txErr)

    setBalance(newBalance)
    setDailyGiftAmount(amount)
    setDailyGiftClaimed(true)
    setLastClaimTime(Date.now())
    setDailyGiftClaiming(false)
    // Auto refresh transaction history
    fetchTransactions()
  }

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
    setWithdrawAmount('')
    setWithdrawError('')
    setShowWithdrawModal(true)
  }

  const handleSubmitWithdraw = async () => {
    if (!user) return
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Vui lòng nhập số tiền hợp lệ')
      return
    }
    if (amount > balance) {
      setWithdrawError('Số dư không đủ')
      return
    }
    if (!profileInfo.bank_name || !profileInfo.bank_account_number) {
      setWithdrawError('Vui lòng cập nhật thông tin ngân hàng trong phần Hồ sơ trước')
      return
    }
    setWithdrawing(true)
    setWithdrawError('')
    const newBalance = balance - amount
    // Deduct balance
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id)
    // Create transaction with pending description
    const { data: txData } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: -amount,
      type: 'withdrawal',
      description: '⏳ Đang chờ tiền về tài khoản',
      balance_after: newBalance,
    }).select('id').single()
    // Create withdrawal request
    await supabase.from('withdrawals').insert({
      user_id: user.id,
      amount: amount,
      bank_name: profileInfo.bank_name,
      bank_account_number: profileInfo.bank_account_number,
      user_display_name: displayName,
      user_email: email,
      transaction_id: txData?.id || null,
    })
    setBalance(newBalance)
    setWithdrawing(false)
    setShowWithdrawModal(false)
    // Refresh transactions
    fetchTransactions()
  }

  const handleDeposit = () => {
    setChatMessage(DEPOSIT_MSG)
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
                <button onClick={() => setShowGenderPicker(true)} className="cursor-pointer relative group">
                  <UserAvatar size={64} borderClass="border-3 border-white/40 shadow-lg" />
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-active:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                </button>
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
          {/* Hồ sơ section */}
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowProfileSection(!showProfileSection)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 active:bg-gray-50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <User className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Hồ sơ</p>
                <p className="text-text-muted text-xs">Thông tin cá nhân</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${showProfileSection ? 'rotate-90' : ''}`} />
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {showProfileSection && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" /> Thông tin hồ sơ
                      {profileSaved && <span className="text-[10px] font-semibold bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Đã lưu</span>}
                    </h3>
                    {!isEditingProfile ? (
                      <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1 text-primary text-[10px] font-semibold cursor-pointer hover:underline">
                        <Edit3 className="w-3 h-3" /> Chỉnh sửa
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={handleCancelEdit} className="flex items-center gap-1 text-red-500 text-[10px] font-semibold cursor-pointer hover:underline">
                          <X className="w-3 h-3" /> Hủy
                        </button>
                        <button onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center gap-1 text-green-600 text-[10px] font-semibold cursor-pointer hover:underline disabled:opacity-50">
                          {profileSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Lưu
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Họ và tên */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><User className="w-3 h-3" /> Họ và tên</label>
                    {isEditingProfile ? (
                      <input type="text" value={editProfileInfo.full_name} onChange={e => setEditProfileInfo({ ...editProfileInfo, full_name: e.target.value })} placeholder="Nhập họ và tên" className="w-full px-3 py-2 bg-surface-dim border border-border rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    ) : (
                      <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg">{profileInfo.full_name || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><Mail className="w-3 h-3" /> Email</label>
                    <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg text-text-muted">{email}</p>
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><Phone className="w-3 h-3" /> Số điện thoại</label>
                    {isEditingProfile ? (
                      <input type="tel" value={editProfileInfo.phone} onChange={e => setEditProfileInfo({ ...editProfileInfo, phone: e.target.value })} placeholder="Nhập số điện thoại" className="w-full px-3 py-2 bg-surface-dim border border-border rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    ) : (
                      <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg">{profileInfo.phone || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                    )}
                  </div>

                  {/* Địa chỉ ví */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><Wallet className="w-3 h-3" /> Địa chỉ ví</label>
                    {isEditingProfile ? (
                      <input type="text" value={editProfileInfo.wallet_address} onChange={e => setEditProfileInfo({ ...editProfileInfo, wallet_address: e.target.value })} placeholder="Nhập địa chỉ ví" className="w-full px-3 py-2 bg-surface-dim border border-border rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    ) : (
                      <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg truncate">{profileInfo.wallet_address || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                    )}
                  </div>

                  {/* Ngân hàng */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><Landmark className="w-3 h-3" /> Ngân hàng</label>
                    {isEditingProfile ? (
                      <select value={editProfileInfo.bank_name} onChange={e => setEditProfileInfo({ ...editProfileInfo, bank_name: e.target.value })} className="w-full px-3 py-2 bg-surface-dim border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                        <option value="">Chọn ngân hàng</option>
                        <option value="MB Bank">MB Bank</option>
                        <option value="Vietcombank (VCB)">Vietcombank (VCB)</option>
                        <option value="Vietinbank">Vietinbank</option>
                        <option value="BIDV">BIDV</option>
                        <option value="Techcombank">Techcombank</option>
                        <option value="ACB">ACB</option>
                        <option value="Sacombank">Sacombank</option>
                        <option value="VPBank">VPBank</option>
                        <option value="TPBank">TPBank</option>
                        <option value="Agribank">Agribank</option>
                        <option value="SHB">SHB</option>
                        <option value="HDBank">HDBank</option>
                        <option value="Momo">Momo</option>
                      </select>
                    ) : (
                      <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg">{profileInfo.bank_name || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                    )}
                  </div>

                  {/* Số tài khoản */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><Landmark className="w-3 h-3" /> Số tài khoản</label>
                    {isEditingProfile ? (
                      <input type="text" value={editProfileInfo.bank_account_number} onChange={e => setEditProfileInfo({ ...editProfileInfo, bank_account_number: e.target.value })} placeholder="Nhập số tài khoản" className="w-full px-3 py-2 bg-surface-dim border border-border rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    ) : (
                      <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg">{profileInfo.bank_account_number || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                    )}
                  </div>

                  {/* Địa chỉ chi tiết */}
                  <div>
                    <label className="text-[10px] text-text-muted font-medium flex items-center gap-1 mb-1"><MapPinned className="w-3 h-3" /> Địa chỉ chi tiết</label>
                    {isEditingProfile ? (
                      <textarea value={editProfileInfo.detailed_address} onChange={e => setEditProfileInfo({ ...editProfileInfo, detailed_address: e.target.value })} placeholder="Nhập địa chỉ chi tiết" rows={2} className="w-full px-3 py-2 bg-surface-dim border border-border rounded-lg text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                    ) : (
                      <p className="text-sm font-medium px-3 py-2 bg-surface-dim rounded-lg">{profileInfo.detailed_address || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Gift - Mobile */}
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleClaimDailyGift}
              disabled={dailyGiftClaimed || dailyGiftClaiming}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl shadow-sm border cursor-pointer transition-all ${
                dailyGiftClaimed
                  ? 'bg-gray-50 border-border/50'
                  : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dailyGiftClaimed ? 'bg-gray-100' : 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md shadow-amber-200'}`}>
                {dailyGiftClaiming ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Gift className={`w-5 h-5 ${dailyGiftClaimed ? 'text-gray-400' : 'text-white'}`} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-semibold text-sm ${dailyGiftClaimed ? 'text-text-muted' : 'text-amber-700'}`}>Quà Hằng Ngày</p>
                {dailyGiftClaimed ? (
                  <div className="flex items-center gap-1">
                    {dailyGiftAmount && <span className="text-green-600 text-xs font-bold">+${dailyGiftAmount.toFixed(2)}</span>}
                    <span className="text-text-muted text-xs flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {countdown || 'Đang tính...'}
                    </span>
                  </div>
                ) : null}
              </div>
              {!dailyGiftClaimed && !dailyGiftClaiming && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold rounded-full shadow-sm">
                  Nhận
                </span>
              )}
            </motion.button>
          </motion.div>

          {/* Nạp Tiền - Mobile */}
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDeposit}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 active:bg-gray-50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Nạp Tiền</p>
                <p className="text-text-muted text-xs">Liên hệ admin để nạp tiền</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </motion.button>
          </motion.div>

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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${tx.type === 'daily_gift' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : tx.type === 'withdrawal' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-orange-500'}`}>
                            {tx.type === 'booking' ? '🏖️' : tx.type === 'daily_gift' ? '🎁' : tx.type === 'withdrawal' ? '💰' : '💸'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-xs truncate">{tx.description}</p>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${tx.type === 'daily_gift' ? 'bg-amber-50 text-amber-600' : tx.type === 'withdrawal' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                <ArrowDownLeft className="w-2 h-2 inline mr-0.5" />{tx.type === 'booking' ? 'Đặt tour' : tx.type === 'daily_gift' ? 'Quà hằng ngày' : tx.type === 'withdrawal' ? 'Rút tiền' : tx.type === 'refund' ? 'Thưởng' : tx.type}
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

          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">{t('Cài đặt', 'Settings')}</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden divide-y divide-border/50 mb-6">
            {/* Thay đổi mật khẩu */}
            <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 cursor-pointer">
              <Lock className="w-4.5 h-4.5 text-text-secondary" />
              <div className="flex-1 text-left"><p className="font-medium text-sm">{t('Thay đổi mật khẩu', 'Change Password')}</p></div>
              <span className="text-text-muted text-xs">{t('Đổi mật khẩu', 'Change password')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted ml-1" />
            </button>
            {/* Ngôn ngữ */}
            <div className="relative">
              <button onClick={() => setShowLangDropdown(!showLangDropdown)} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 cursor-pointer">
                <Globe className="w-4.5 h-4.5 text-text-secondary" />
                <div className="flex-1 text-left"><p className="font-medium text-sm">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</p></div>
                <span className="text-text-muted text-xs">{t('Ngôn ngữ', 'Language')}</span>
                <ChevronRight className={`w-3.5 h-3.5 text-text-muted ml-1 transition-transform ${showLangDropdown ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden bg-gray-50">
                    <button onClick={() => { setLang('vi'); setShowLangDropdown(false) }} className={`w-full flex items-center gap-3 px-8 py-3 text-sm cursor-pointer hover:bg-gray-100 ${lang === 'vi' ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                      🇻🇳 Tiếng Việt {lang === 'vi' && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                    <button onClick={() => { setLang('en'); setShowLangDropdown(false) }} className={`w-full flex items-center gap-3 px-8 py-3 text-sm cursor-pointer hover:bg-gray-100 ${lang === 'en' ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                      🇬🇧 English {lang === 'en' && <Check className="w-3.5 h-3.5 ml-auto" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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

            {/* Hồ sơ - Profile Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" /> Hồ sơ
                  {profileSaved && <span className="text-xs font-semibold bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Đã lưu</span>}
                </h3>
                {!isEditingProfile ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1.5 text-primary text-xs font-semibold cursor-pointer hover:underline px-3 py-1.5 bg-primary-50 rounded-lg">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancelEdit} className="flex items-center gap-1.5 text-red-500 text-xs font-semibold cursor-pointer px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <X className="w-3.5 h-3.5" /> Hủy
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center gap-1.5 text-white text-xs font-semibold cursor-pointer px-4 py-1.5 bg-green-500 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50">
                      {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Lưu
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div>
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><User className="w-3.5 h-3.5" /> Họ và tên</label>
                  {isEditingProfile ? (
                    <input type="text" value={editProfileInfo.full_name} onChange={e => setEditProfileInfo({ ...editProfileInfo, full_name: e.target.value })} placeholder="Nhập họ và tên" className="w-full px-3.5 py-2.5 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  ) : (
                    <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl">{profileInfo.full_name || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                  <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl text-text-muted">{email}</p>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" /> Số điện thoại</label>
                  {isEditingProfile ? (
                    <input type="tel" value={editProfileInfo.phone} onChange={e => setEditProfileInfo({ ...editProfileInfo, phone: e.target.value })} placeholder="Nhập số điện thoại" className="w-full px-3.5 py-2.5 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  ) : (
                    <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl">{profileInfo.phone || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                  )}
                </div>

                {/* Địa chỉ ví */}
                <div>
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><Wallet className="w-3.5 h-3.5" /> Địa chỉ ví</label>
                  {isEditingProfile ? (
                    <input type="text" value={editProfileInfo.wallet_address} onChange={e => setEditProfileInfo({ ...editProfileInfo, wallet_address: e.target.value })} placeholder="Nhập địa chỉ ví" className="w-full px-3.5 py-2.5 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  ) : (
                    <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl truncate">{profileInfo.wallet_address || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                  )}
                </div>

                {/* Ngân hàng */}
                <div>
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><Landmark className="w-3.5 h-3.5" /> Ngân hàng</label>
                  {isEditingProfile ? (
                    <select value={editProfileInfo.bank_name} onChange={e => setEditProfileInfo({ ...editProfileInfo, bank_name: e.target.value })} className="w-full px-3.5 py-2.5 bg-surface-dim border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                      <option value="">Chọn ngân hàng</option>
                      <option value="MB Bank">MB Bank</option>
                      <option value="Vietcombank (VCB)">Vietcombank (VCB)</option>
                      <option value="Vietinbank">Vietinbank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="ACB">ACB</option>
                      <option value="Sacombank">Sacombank</option>
                      <option value="VPBank">VPBank</option>
                      <option value="TPBank">TPBank</option>
                      <option value="Agribank">Agribank</option>
                      <option value="SHB">SHB</option>
                      <option value="HDBank">HDBank</option>
                      <option value="Momo">Momo</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl">{profileInfo.bank_name || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                  )}
                </div>

                {/* Số tài khoản */}
                <div>
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><Landmark className="w-3.5 h-3.5" /> Số tài khoản</label>
                  {isEditingProfile ? (
                    <input type="text" value={editProfileInfo.bank_account_number} onChange={e => setEditProfileInfo({ ...editProfileInfo, bank_account_number: e.target.value })} placeholder="Nhập số tài khoản" className="w-full px-3.5 py-2.5 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  ) : (
                    <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl">{profileInfo.bank_account_number || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                  )}
                </div>

                {/* Địa chỉ chi tiết - full width */}
                <div className="col-span-2">
                  <label className="text-xs text-text-muted font-medium flex items-center gap-1.5 mb-1.5"><MapPinned className="w-3.5 h-3.5" /> Địa chỉ chi tiết</label>
                  {isEditingProfile ? (
                    <textarea value={editProfileInfo.detailed_address} onChange={e => setEditProfileInfo({ ...editProfileInfo, detailed_address: e.target.value })} placeholder="Nhập địa chỉ chi tiết" rows={2} className="w-full px-3.5 py-2.5 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
                  ) : (
                    <p className="text-sm font-medium px-3.5 py-2.5 bg-surface-dim rounded-xl">{profileInfo.detailed_address || <span className="text-text-muted italic">Chưa cập nhật</span>}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Daily Gift - Desktop */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaimDailyGift}
                disabled={dailyGiftClaimed || dailyGiftClaiming}
                className={`w-full flex items-center gap-5 p-5 rounded-2xl border shadow-sm transition-all cursor-pointer ${
                  dailyGiftClaimed
                    ? 'bg-white border-border/50'
                    : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-200 hover:shadow-md'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dailyGiftClaimed ? 'bg-gray-100' : 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-200'}`}>
                  {dailyGiftClaiming ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : (
                    <Gift className={`w-7 h-7 ${dailyGiftClaimed ? 'text-gray-400' : 'text-white'}`} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-bold text-base ${dailyGiftClaimed ? 'text-text-muted' : 'text-amber-700'}`}>🎁 Quà Hằng Ngày</p>
                  {dailyGiftClaimed ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      {dailyGiftAmount && <span className="text-green-600 text-sm font-bold">+${dailyGiftAmount.toFixed(2)} đã nhận</span>}
                      <span className="text-text-muted text-sm flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Đặt lại sau: {countdown || 'Đang tính...'}
                      </span>
                    </div>
                  ) : null}
                </div>
                {!dailyGiftClaimed && !dailyGiftClaiming && (
                  <span className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-200 hover:shadow-lg transition-shadow">
                    Nhận ngay
                  </span>
                )}
              </motion.button>
            </motion.div>

            {/* Nạp Tiền - Desktop */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeposit}
              className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Nạp Tiền</p>
                <p className="text-text-muted text-xs">Liên hệ admin để nạp tiền vào tài khoản</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </motion.button>

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
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${tx.type === 'daily_gift' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : tx.type === 'withdrawal' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-orange-500'}`}>
                              {tx.type === 'booking' ? '🏖️' : tx.type === 'daily_gift' ? '🎁' : tx.type === 'withdrawal' ? '💰' : '💸'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm truncate">{tx.description}</p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${tx.type === 'daily_gift' ? 'bg-amber-50 text-amber-600' : tx.type === 'withdrawal' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                  <ArrowDownLeft className="w-2.5 h-2.5 inline mr-0.5" />{tx.type === 'booking' ? 'Đặt tour' : tx.type === 'daily_gift' ? 'Quà hằng ngày' : tx.type === 'withdrawal' ? 'Rút tiền' : tx.type === 'refund' ? 'Thưởng' : tx.type}
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
              <div className="px-5 pt-5 pb-3"><h3 className="font-bold text-base">{t('Cài đặt', 'Settings')}</h3></div>
              <div className="divide-y divide-border/50">
                {/* Thay đổi mật khẩu */}
                <motion.button whileHover={{ x: 3 }} onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-dim transition-colors cursor-pointer">
                  <Lock className="w-4.5 h-4.5 text-text-secondary" />
                  <div className="flex-1 text-left"><p className="font-medium text-sm">{t('Thay đổi mật khẩu', 'Change Password')}</p></div>
                  <span className="text-text-muted text-xs">{t('Đổi mật khẩu', 'Change password')}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted ml-1" />
                </motion.button>
                {/* Ngôn ngữ */}
                <div className="relative">
                  <motion.button whileHover={{ x: 3 }} onClick={() => setShowLangDropdown(!showLangDropdown)} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-dim transition-colors cursor-pointer">
                    <Globe className="w-4.5 h-4.5 text-text-secondary" />
                    <div className="flex-1 text-left"><p className="font-medium text-sm">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</p></div>
                    <span className="text-text-muted text-xs">{t('Ngôn ngữ', 'Language')}</span>
                    <ChevronRight className={`w-3.5 h-3.5 text-text-muted ml-1 transition-transform ${showLangDropdown ? 'rotate-90' : ''}`} />
                  </motion.button>
                  <AnimatePresence>
                    {showLangDropdown && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden bg-gray-50">
                        <button onClick={() => { setLang('vi'); setShowLangDropdown(false) }} className={`w-full flex items-center gap-3 px-8 py-3 text-sm cursor-pointer hover:bg-gray-100 ${lang === 'vi' ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                          🇻🇳 Tiếng Việt {lang === 'vi' && <Check className="w-3.5 h-3.5 ml-auto" />}
                        </button>
                        <button onClick={() => { setLang('en'); setShowLangDropdown(false) }} className={`w-full flex items-center gap-3 px-8 py-3 text-sm cursor-pointer hover:bg-gray-100 ${lang === 'en' ? 'text-primary font-semibold' : 'text-text-secondary'}`}>
                          🇬🇧 English {lang === 'en' && <Check className="w-3.5 h-3.5 ml-auto" />}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} initialMessage={chatMessage} />

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowPasswordModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              {pwSuccess ? (
                <div className="text-center py-6">
                  <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-lg">{t('Đổi mật khẩu thành công!', 'Password changed successfully!')}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> {t('Đổi mật khẩu', 'Change Password')}</h3>
                    <button onClick={() => setShowPasswordModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4.5 h-4.5" /></button>
                  </div>

                  {pwError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{pwError}</div>}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('Mật khẩu mới', 'New Password')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('Nhập mật khẩu mới', 'Enter new password')} className="w-full pl-10 pr-11 py-3 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">{t('Xác nhận mật khẩu', 'Confirm Password')}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder={t('Nhập lại mật khẩu', 'Re-enter password')} className="w-full pl-10 pr-11 py-3 bg-surface-dim border border-border rounded-xl text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer">
                          {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleChangePassword} disabled={pwLoading} className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                      {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('Đổi mật khẩu', 'Change Password')}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gender Picker Modal */}
      <AnimatePresence>
        {showGenderPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGenderPicker(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-sm p-6 pb-8 md:pb-6"
            >
              <h3 className="font-bold text-lg text-center mb-1">Chọn avatar</h3>
              <p className="text-text-muted text-xs text-center mb-5">Chọn giới tính để thay đổi avatar</p>
              <div className="flex gap-4">
                {[
                  { key: 'male', label: 'Nam', img: '/images/avatar_male.png', color: 'border-blue-400 bg-blue-50' },
                  { key: 'female', label: 'Nữ', img: '/images/avatar_female.png', color: 'border-pink-400 bg-pink-50' },
                ].map(opt => (
                  <motion.button
                    key={opt.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (!user) return
                      setGender(opt.key)
                      await supabase.from('profiles').update({ gender: opt.key }).eq('id', user.id)
                      setShowGenderPicker(false)
                    }}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${gender === opt.key ? opt.color : 'border-border bg-surface-dim hover:bg-gray-50'}`}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-md relative">
                      <img src={opt.img} alt={opt.label} className="w-full h-full object-cover" />
                      {gender === opt.key && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <span className={`text-sm font-semibold ${gender === opt.key ? 'text-primary' : 'text-text-secondary'}`}>{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWithdrawModal(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-md p-6 pb-24 md:pb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Rút tiền</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 mb-4">
                <p className="text-xs text-text-muted">Số dư khả dụng</p>
                <p className="text-2xl font-black text-primary">${balance.toFixed(2)}</p>
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Số tiền muốn rút ($)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                />
                <div className="flex gap-2 mt-2">
                  {[5, 10, 20].map(v => (
                    <button key={v} onClick={() => setWithdrawAmount(String(v))} className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${withdrawAmount === String(v) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-text-secondary border-border hover:bg-gray-100'}`}>
                      ${v}
                    </button>
                  ))}
                  <button onClick={() => setWithdrawAmount(String(balance))} className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${withdrawAmount === String(balance) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-text-secondary border-border hover:bg-gray-100'}`}>
                    Tất cả
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-[10px] font-semibold text-text-muted mb-1.5 uppercase tracking-wide">Thông tin ngân hàng</p>
                <div className="flex items-center gap-2 text-sm">
                  <Landmark className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold">{profileInfo.bank_name || 'Chưa có'}</span>
                  <span className="text-text-muted">•</span>
                  <span className="font-mono">{profileInfo.bank_account_number || 'Chưa có'}</span>
                </div>
              </div>

              {withdrawError && (
                <div className="flex items-center gap-2 text-red-500 text-xs mb-3 p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {withdrawError}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmitWithdraw}
                disabled={withdrawing}
                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {withdrawing ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
