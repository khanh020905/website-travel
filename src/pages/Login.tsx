import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Plane, Loader2, User, Ticket } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

type AuthMode = 'login' | 'register'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp, user, loading: authLoading } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [inviteCode, setInviteCode] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

    if (!username || !password) {
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
      const { error } = await signIn(username, password)
      if (error) {
        setError(error === 'Invalid login credentials' ? 'Tên đăng nhập hoặc mật khẩu không đúng' : error)
        setLoading(false)
      } else {
        navigate('/home')
      }
    } else {
      const { error } = await signUp(username, password)
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
        setSuccess('Đăng ký thành công! Đang chuyển hướng...')
        setTimeout(() => { setMode('login') }, 1500)
        setLoading(false)
      }
    }
  }





  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirmPassword('')

    setInviteCode('')
    setUsername('')
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
              {/* ── Login / Register View (Desktop) ── */}
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

              {/* Tên đăng nhập */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
          {/* Tab switcher */}
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

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="space-y-4">

              {/* Tên đăng nhập */}
              <div>
                <label className="block text-text-primary text-sm font-semibold mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

            </div>

            {/* Submit button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              type="submit"
              className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
            </motion.button>

            {/* Toggle login/register */}
            <p className="text-center mt-5 text-text-muted text-sm">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary font-semibold cursor-pointer"
              >
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
