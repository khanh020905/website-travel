import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Plane, ChevronsRight, Loader2, User, Ticket, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

// ─── Swipe-to-Submit Button ────────────────────────────
function SwipeButton({ loading, label, onSwipeComplete }: {
  loading: boolean
  label: string
  onSwipeComplete: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [swiped, setSwiped] = useState(false)

  const maxDrag = 260 // max swipe distance
  const threshold = maxDrag * 0.7

  // Arrow opacity fades as you drag
  const arrowOpacity = useTransform(x, [0, threshold], [1, 0])
  // Text opacity fades
  const textOpacity = useTransform(x, [0, threshold * 0.5], [1, 0])
  // Background fill as progress
  const bgWidth = useTransform(x, [0, maxDrag], ['0%', '100%'])

  const handleDragEnd = () => {
    if (x.get() >= threshold) {
      setSwiped(true)
      onSwipeComplete()
      // Reset after a delay
      setTimeout(() => {
        setSwiped(false)
        x.set(0)
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full mt-6 h-[52px] bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/30 overflow-hidden select-none"
    >
      {/* Success fill */}
      <motion.div
        className="absolute inset-0 bg-green-500 rounded-full"
        style={{ width: swiped ? '100%' : bgWidth }}
        transition={{ duration: 0.3 }}
      />

      {/* Label text */}
      <motion.span
        style={{ opacity: swiped ? 0 : textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm pointer-events-none"
      >
        {swiped ? '✓' : label}
      </motion.span>

      {/* Draggable thumb */}
      {!swiped && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxDrag }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing z-10 touch-none"
        >
          <motion.div style={{ opacity: arrowOpacity }}>
            <ChevronsRight className="w-5 h-5 text-orange-500" />
          </motion.div>
        </motion.div>
      )}

      {/* Success checkmark */}
      {swiped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-white text-xl font-bold">✓</span>
        </motion.div>
      )}
    </div>
  )
}

type AuthMode = 'login' | 'register' | 'forgot'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, user, loading: authLoading } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirect if already logged in
  if (!authLoading && user) {
    return <Navigate to="/home" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    // Validate invite code for registration
    if (mode === 'register') {
      if (!inviteCode.trim()) {
        setError('Vui lòng nhập mã mời')
        return
      }
      const { data: codeData } = await supabase
        .from('invite_codes')
        .select('id, status')
        .eq('code', inviteCode.trim().toUpperCase())
        .single()
      if (!codeData) {
        setError('Mã mời không hợp lệ')
        return
      }
      if (codeData.status !== 'active') {
        setError('Mã mời đã được sử dụng hoặc đã hủy')
        return
      }
    }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : error)
        setLoading(false)
      } else {
        navigate('/home')
      }
    } else {
      const { error } = await signUp(email, password, displayName)
      if (error) {
        setError(error)
        setLoading(false)
      } else {
        // Mark invite code as used
        const { data: userData } = await supabase.auth.getUser()
        await supabase
          .from('invite_codes')
          .update({ status: 'used', used_by: userData?.user?.id || null, used_at: new Date().toISOString() })
          .eq('code', inviteCode.trim().toUpperCase())
        setSuccess('Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.')
        setLoading(false)
      }
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!forgotEmail) {
      setError('Vui lòng nhập email của bạn')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư của bạn.')
    }
  }

  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirmPassword('')
    setDisplayName('')
    setInviteCode('')
    setForgotEmail('')
  }

  return (
    <div className="min-h-dvh flex flex-col md:flex-row relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* DESKTOP: Full-screen background with glassmorphism card */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="hidden md:flex w-full min-h-dvh relative">
        {/* Background image — Hội An */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1920&q=80"
            alt="Hội An, Việt Nam"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/10" />
        </div>

        {/* Left: Branding */}
        <div className="relative z-10 w-[55%] flex flex-col justify-center p-12 lg:p-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Plane className="w-5 h-5 text-white rotate-[-30deg]" />
              </div>
              <span className="text-white/90 font-bold text-lg tracking-wide">ABAYTRIPVIOR</span>
            </div>
            <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] mb-5">
              KHÁM PHÁ<br />CHÂN TRỜI MỚI
            </h1>
            <p className="text-white/80 text-lg font-medium mb-3 max-w-md">
              Nơi giấc mơ du lịch trở thành hiện thực.
            </p>
            <p className="text-white/60 text-sm max-w-md leading-relaxed">
              Bắt đầu hành trình khám phá mọi ngóc ngách của thế giới ngay trong tầm tay bạn.
            </p>
          </motion.div>
        </div>

        {/* Right: Glass card (form) */}
        <div className="relative z-10 w-[45%] flex items-center justify-center p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-[420px] bg-white/80 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 border border-white/40 shadow-2xl"
          >
            <AnimatePresence mode="wait">
            {mode === 'forgot' ? (
              /* ── Forgot Password View (Desktop) ── */
              <motion.div
                key="forgot-desktop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => switchMode('login')}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium mb-6 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </button>

                <h2 className="text-gray-900 text-xl font-bold mb-2">Quên mật khẩu?</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>

                {/* Error/Success messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4"
                    >
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 mb-4"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'GỬI LINK ĐẶT LẠI'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              /* ── Login / Register View (Desktop) ── */
              <motion.div
                key="auth-desktop"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Đăng ký
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error/Success messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Display Name (register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Tên đăng nhập</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-gray-700 text-sm font-medium mb-1.5">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Invite Code (register only) - DESKTOP */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-gray-700 text-sm font-medium mb-1.5"> Mã mời</label>
                    <div className="relative">
                      <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Nhập mã mời 6 ký tự"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength={6}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-300 font-mono tracking-[0.15em] uppercase"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember me / Forgot password (login only) */}
              {mode === 'login' && (
                <div className="flex items-center justify-end">
                  <button type="button" onClick={() => switchMode('forgot')} className="text-primary text-sm font-medium hover:text-primary-dark transition-colors cursor-pointer">
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  mode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs font-medium">hoặc</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Đăng nhập với Google
            </button>

            {/* Toggle mode */}
            <p className="text-center mt-6 text-gray-500 text-sm">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary font-semibold hover:text-primary-dark transition-colors cursor-pointer"
              >
                {mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}
              </button>
            </p>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE: Orange gradient header + white card body */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col min-h-dvh md:hidden">
        {/* Orange gradient header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-red-500 pt-12 pb-10 px-6 text-center overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute top-[40%] left-[10%] w-12 h-12 bg-white/5 rounded-full" />

          {/* Logo */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="mb-3"
          >
            <Plane className="w-10 h-10 text-white mx-auto rotate-[-30deg] drop-shadow-lg" />
          </motion.div>
          <p className="text-white/90 text-sm font-medium tracking-wider mb-2">ABAYTRIPVIOR</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-white text-2xl font-black mb-1">
                {mode === 'login' ? 'Chào mừng trở lại' : mode === 'register' ? 'Tạo tài khoản' : 'Quên mật khẩu'}
              </h1>
              <p className="text-white/80 text-xs max-w-[240px] mx-auto leading-relaxed">
                {mode === 'login'
                  ? 'Đăng nhập để tiếp tục khám phá những điểm đến tuyệt vời.'
                  : mode === 'register'
                  ? 'Tham gia ngay và bắt đầu hành trình khám phá thế giới.'
                  : 'Nhập email để nhận link đặt lại mật khẩu.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* White card body */}
        <div className="flex-1 bg-white rounded-t-[28px] -mt-5 relative z-10 px-6 pt-6 pb-8 flex flex-col">
          {/* Tab switcher (hidden in forgot mode) */}
          {mode !== 'forgot' && (
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Đăng ký
            </button>
          </div>
          )}

          {/* Error/Success messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl px-4 py-3 mb-4"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Forgot Password View (Mobile) ── */}
          {mode === 'forgot' && (
            <div className="flex-1 flex flex-col">
              <button
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium mb-4 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </button>

              <p className="text-gray-500 text-sm mb-5">
                Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-text-primary text-sm font-semibold mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                    <input
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-text-muted focus:border-primary focus:bg-white transition-all duration-300"
                    />
                  </div>
                </div>

                <SwipeButton
                  loading={loading}
                  label="Vuốt để gửi link đặt lại"
                  onSwipeComplete={() => {
                    const fakeEvent = { preventDefault: () => {} } as React.FormEvent
                    handleForgotPassword(fakeEvent)
                  }}
                />
              </form>
            </div>
          )}

          {mode !== 'forgot' && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-4">
              {/* Display Name (register only) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-text-primary text-sm font-semibold mb-1.5">Tên đăng nhập</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-text-muted focus:border-primary focus:bg-white transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-text-primary text-sm font-semibold mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-text-muted focus:border-primary focus:bg-white transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-text-primary text-sm font-semibold mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-text-muted focus:border-primary focus:bg-white transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (register) */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-text-primary text-sm font-semibold mb-1.5">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-text-muted focus:border-primary focus:bg-white transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Invite Code (register only) - MOBILE */}
              <AnimatePresence>
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-text-primary text-sm font-semibold mb-1.5">Mã mời</label>
                    <div className="relative">
                      <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Nhập mã mời 6 ký tự"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength={6}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-text-muted focus:border-primary focus:bg-white transition-all duration-300 font-mono tracking-[0.15em] uppercase"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember me / Forgot password (login only) */}
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer"
                    />
                    <span className="text-text-secondary text-xs font-medium">Nhớ mật khẩu</span>
                  </label>
                  <button type="button" onClick={() => switchMode('forgot')} className="text-primary text-xs font-semibold cursor-pointer">
                    Quên mật khẩu?
                  </button>
                </div>
              )}
            </div>

            {/* Swipe to submit */}
            <SwipeButton
              loading={loading}
              label={mode === 'login' ? 'Vuốt để đăng nhập' : 'Vuốt để đăng ký'}
              onSwipeComplete={() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent
                handleSubmit(fakeEvent)
              }}
            />

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-text-muted text-xs">Hoặc tiếp tục với</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Social buttons */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Đăng nhập với Google
            </button>

            {/* Toggle mode */}
            <p className="text-center mt-5 mb-3 text-text-secondary text-sm">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}
              </button>
            </p>
          </form>
          )}
        </div>
      </div>
    </div>
  )
}
