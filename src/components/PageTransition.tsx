import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }}
      exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }}
      className={`page-container safe-bottom ${className}`}
    >
      {children}
    </motion.div>
  )
}
