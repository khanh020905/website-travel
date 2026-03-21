import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserRole } from './UserAvatar'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: roleLoading } = useUserRole()

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-border/50 max-w-sm mx-4">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold mb-2">Truy cập bị từ chối</h2>
          <p className="text-text-muted text-sm mb-4">Bạn không có quyền truy cập trang quản trị. Chỉ tài khoản Admin mới có thể xem trang này.</p>
          <a href="/home" className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary-dark transition-colors">
            Về trang chủ
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
