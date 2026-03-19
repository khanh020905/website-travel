import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Plane } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/home')
  }

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-gradient-to-b from-primary/5 to-white relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-20 w-40 h-40 bg-orange-200/30 rounded-full blur-2xl" />

      {/* Left - Hero image */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative md:w-1/2 md:min-h-dvh">
        <div className="flex justify-between items-center px-5 pt-3 pb-2 relative z-10 md:hidden">
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 bg-primary/70 rounded-full" style={{ height: `${8 + i * 3}px` }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 border border-primary/50 rounded-sm relative">
              <div className="absolute inset-0.5 bg-primary/60 rounded-xs" />
            </div>
          </div>
        </div>

        <div className="mx-4 mt-2 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 relative md:mx-0 md:mt-0 md:rounded-none md:h-full">
          <div className="aspect-[16/10] md:aspect-auto md:h-full bg-gradient-to-br from-blue-400 via-sky-300 to-orange-300 relative">
            <img src="/images/hero.png" alt="Hội An" className="w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="hidden md:flex absolute inset-0 flex-col justify-end p-12 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <h2 className="text-white text-4xl lg:text-5xl font-black leading-tight mb-3">
                Khám phá<br />Việt Nam tươi đẹp
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Trải nghiệm những điểm đến tuyệt vời, đặt tour cao cấp và tạo nên kỷ niệm đáng nhớ.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center md:w-1/2 md:px-12 lg:px-20 xl:px-28">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-center mt-6 mb-4 md:mt-0 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-wider gradient-text">ABAYTRIPVIOR</h1>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
            <Plane className="w-8 h-8 text-primary mx-auto mt-1 rotate-[-30deg]" />
          </motion.div>
          <p className="hidden md:block text-text-secondary mt-3 text-sm">Đăng nhập tài khoản để tiếp tục</p>
        </motion.div>

        <motion.form initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} onSubmit={handleLogin} className="px-8 flex-1 flex flex-col md:flex-none md:px-0">
          <div className="space-y-3 md:space-y-4">
            <div className="relative">
              <input type="text" placeholder="Tên đăng nhập hoặc email" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-3.5 md:py-4 bg-white/80 border border-border rounded-2xl text-sm font-medium placeholder:text-text-muted focus:border-primary transition-all duration-300" />
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3.5 md:py-4 bg-white/80 border border-border rounded-2xl text-sm font-medium placeholder:text-text-muted focus:border-primary transition-all duration-300 pr-12" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className="w-full mt-5 md:mt-6 py-3.5 md:py-4 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white font-bold text-lg rounded-2xl shadow-lg shadow-primary/30 active:shadow-md transition-shadow cursor-pointer">
            ĐĂNG NHẬP
          </motion.button>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center mt-3 text-sm text-text-secondary">
            <button type="button" className="text-primary font-medium hover:underline cursor-pointer">Quên mật khẩu?</button>
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-4 mb-8 text-sm text-text-secondary">
            Chưa có tài khoản?{' '}
            <button type="button" className="text-primary font-bold hover:underline cursor-pointer">Đăng ký</button>
          </motion.p>
        </motion.form>
      </div>

      <div className="h-2 bg-gradient-to-r from-primary via-orange-400 to-primary-light md:hidden" />
    </div>
  )
}
