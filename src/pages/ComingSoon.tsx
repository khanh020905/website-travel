import { motion } from 'framer-motion'
import { CalendarDays, Camera, Settings, ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const pageConfig: Record<string, { icon: typeof CalendarDays; title: string; desc: string; color: string }> = {
  '/schedule': {
    icon: CalendarDays,
    title: 'Lịch Trình',
    desc: 'Lên kế hoạch và quản lý lịch trình du lịch của bạn một cách thông minh.',
    color: '#3b82f6',
  },
  '/photos': {
    icon: Camera,
    title: 'Ảnh Đẹp',
    desc: 'Khám phá bộ sưu tập ảnh du lịch tuyệt đẹp từ cộng đồng.',
    color: '#8b5cf6',
  },
  '/settings': {
    icon: Settings,
    title: 'Cài Đặt',
    desc: 'Tùy chỉnh trải nghiệm của bạn theo sở thích cá nhân.',
    color: '#f97316',
  },
}

export default function ComingSoon() {
  const navigate = useNavigate()
  const location = useLocation()
  const config = pageConfig[location.pathname] || pageConfig['/schedule']
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="coming-soon-page"
    >
      <div className="coming-soon-content">
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="coming-soon-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </motion.button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="coming-soon-icon-wrapper"
          style={{ background: `${config.color}15`, boxShadow: `0 0 60px ${config.color}20` }}
        >
          <div className="coming-soon-icon" style={{ background: config.color }}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="coming-soon-text"
        >
          <h1 className="coming-soon-title">{config.title}</h1>
          <div className="coming-soon-badge">
            <Sparkles className="w-3.5 h-3.5" />
            Sắp Ra Mắt
          </div>
          <p className="coming-soon-desc">{config.desc}</p>
          <p className="coming-soon-subdesc">
            Chúng tôi đang hoàn thiện tính năng này. Hãy quay lại sau nhé!
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="coming-soon-progress"
        >
          <div className="coming-soon-progress-header">
            <span>Tiến độ phát triển</span>
            <span style={{ color: config.color, fontWeight: 700 }}>75%</span>
          </div>
          <div className="coming-soon-progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="coming-soon-progress-fill"
              style={{ background: `linear-gradient(90deg, ${config.color}, ${config.color}99)` }}
            />
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/home')}
          className="coming-soon-cta"
          style={{ background: config.color }}
        >
          Khám Phá Trang Chủ
        </motion.button>
      </div>
    </motion.div>
  )
}
