import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ShoppingBag, Wallet, HeadphonesIcon, Shield, ArrowRight, Globe, Users, Clock, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: ShoppingBag,
    title: 'Đặt Hàng Dễ Dàng',
    desc: 'Duyệt và đặt hơn 600 gói du lịch chỉ với vài cú nhấp chuột. Theo dõi đơn hàng theo thời gian thực.',
    color: 'orange',
  },
  {
    icon: Wallet,
    title: 'Ví An Toàn',
    desc: 'Quản lý số dư, xem lịch sử giao dịch và rút tiền — tất cả trong một bảng điều khiển bảo mật.',
    color: 'green',
  },
  {
    icon: HeadphonesIcon,
    title: 'Hỗ Trợ 24/7',
    desc: 'Đội ngũ chăm sóc khách hàng tận tâm luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.',
    color: 'blue',
  },
  {
    icon: Shield,
    title: 'Bảo Mật Tài Khoản',
    desc: 'Toàn quyền kiểm soát hồ sơ cá nhân, quản lý mật khẩu, cài đặt ngôn ngữ và tùy chọn tài khoản.',
    color: 'purple',
  },
]

const steps = [
  { num: '01', title: 'Tạo Tài Khoản', desc: 'Đăng ký chỉ trong vài giây và thiết lập hồ sơ cá nhân.' },
  { num: '02', title: 'Duyệt & Đặt Hàng', desc: 'Khám phá 600+ điểm đến và đặt tour du lịch của bạn.' },
  { num: '03', title: 'Theo Dõi Tiến Trình', desc: 'Giám sát đơn hàng và thu nhập theo thời gian thực.' },
  { num: '04', title: 'Rút Tiền', desc: 'Rút số dư của bạn một cách an toàn, bất cứ lúc nào.' },
]

const stats = [
  { endValue: 600, suffix: '+', label: 'Điểm Đến', icon: Globe },
  { endValue: 50, suffix: 'K+', label: 'Người Dùng', icon: Users },
  { endValue: 24, suffix: '/7', label: 'Hỗ Trợ', icon: Clock },
  { endValue: 99.9, suffix: '%', label: 'Hoạt Động', icon: TrendingUp },
]

function AnimatedCounter({ endValue, suffix, duration = 2 }: { endValue: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Number((eased * endValue).toFixed(endValue % 1 !== 0 ? 1 : 0)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, endValue, duration])

  return <div ref={ref} className="landing-stat__value">{count}{suffix}</div>
}

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

export default function LandingSections() {
  return (
    <>
      {/* ===== TÍNH NĂNG ===== */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <motion.div {...fadeInUp} transition={{ duration: 0.6 }} className="landing-section__header">
            <span className="landing-tag">Tính Năng</span>
            <h2 className="landing-title">Tất Cả Những Gì Bạn Cần Trong Một Nền Tảng</h2>
            <p className="landing-subtitle">
              Từ đặt gói du lịch đến quản lý tài khoản — chúng tôi đã xây dựng mọi công cụ bạn cần cho trải nghiệm hoàn hảo.
            </p>
          </motion.div>

          <div className="landing-features-grid">
            {features.map((feat, i) => {
              const Icon = feat.icon
              const gradientMap: Record<string, string> = {
                orange: 'linear-gradient(hsl(43, 90%, 50%), hsl(28, 90%, 50%))',
                green: 'linear-gradient(hsl(123, 90%, 40%), hsl(108, 90%, 40%))',
                blue: 'linear-gradient(hsl(223, 90%, 50%), hsl(208, 90%, 50%))',
                purple: 'linear-gradient(hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
              }
              return (
                <motion.div
                  key={feat.title}
                  {...fadeInUp}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="landing-feature-card"
                >
                  <div className="landing-feature-card__content">
                    <div
                      className="glass-icon-wrapper group"
                      style={{ width: '4.5em', height: '4.5em', perspective: '24em', transformStyle: 'preserve-3d', position: 'relative', marginBottom: '24px' }}
                    >
                      {/* Shadow layer */}
                      <span
                        className="glass-icon-shadow"
                        style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                          borderRadius: '1.25em', display: 'block',
                          background: gradientMap[feat.color],
                          transform: 'rotate(15deg)', transformOrigin: '100% 100%',
                          boxShadow: '0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15)',
                          transition: 'transform 0.3s cubic-bezier(0.83,0,0.17,1)',
                        }}
                      />
                      {/* Glass layer */}
                      <span
                        className="glass-icon-glass"
                        style={{
                          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                          borderRadius: '1.25em',
                          background: 'hsla(0,0%,100%,0.15)',
                          backdropFilter: 'blur(0.75em)', WebkitBackdropFilter: 'blur(0.75em)',
                          boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'transform 0.3s cubic-bezier(0.83,0,0.17,1)',
                        }}
                      >
                        <Icon style={{ width: '1.5em', height: '1.5em', color: 'white' }} />
                      </span>
                    </div>
                    <h3 className="landing-feature-card__title">{feat.title}</h3>
                    <p className="landing-feature-card__desc">{feat.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== CÁCH HOẠT ĐỘNG ===== */}
      <section className="landing-section landing-section--accent">
        <div className="landing-container">
          <motion.div {...fadeInUp} transition={{ duration: 0.6 }} className="landing-section__header">
            <span className="landing-tag">Cách Hoạt Động</span>
            <h2 className="landing-title">Bắt Đầu Chỉ Với 4 Bước Đơn Giản</h2>
          </motion.div>

          <div className="landing-steps">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                {...fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.3 }}
                className="landing-step"
              >
                <div className="landing-step__num">{step.num}</div>
                <h3 className="landing-step__title">{step.title}</h3>
                <p className="landing-step__desc">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="landing-step__arrow">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THỐNG KÊ ===== */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <div className="landing-stats">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  {...fadeInUp}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="landing-stat"
                >
                  <Icon className="landing-stat__icon" />
                  <AnimatedCounter endValue={stat.endValue} suffix={stat.suffix} />
                  <div className="landing-stat__label">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== KÊU GỌI HÀNH ĐỘNG ===== */}
      <section className="landing-section landing-section--cta">
        <div className="landing-cta-bg">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2400&q=80"
            alt="Con đường du lịch"
            loading="lazy"
          />
          <div className="landing-cta-bg__overlay" />
        </div>
        <div className="landing-container landing-cta-content">
          <motion.div {...fadeInUp} transition={{ duration: 0.7 }}>
            <span className="landing-tag landing-tag--light">Bắt Đầu Hành Trình</span>
            <h2 className="landing-cta__title">Sẵn Sàng Khám Phá<br />Thế Giới?</h2>
            <p className="landing-cta__desc">
              Tham gia cùng hơn 50.000 du khách tin tưởng nền tảng của chúng tôi. Tạo tài khoản ngay hôm nay và bắt đầu khám phá.
            </p>
            <div className="landing-cta__buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="landing-cta__btn landing-cta__btn--primary"
              >
                Bắt Đầu Ngay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="landing-cta__btn landing-cta__btn--outline"
              >
                Tìm Hiểu Thêm
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
