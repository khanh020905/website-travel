import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Get display info from the authenticated user.
 * - Google users: returns their Google avatar + full name
 * - Email/password users: returns first letter initial as avatar + display_name or email prefix
 */
export function useUserInfo() {
  const { user } = useAuth()

  if (!user) {
    return { displayName: 'Khách', email: '', avatarUrl: null, initial: 'K' }
  }

  const meta = user.user_metadata ?? {}

  // Google OAuth provides avatar_url and full_name
  const avatarUrl: string | null = meta.avatar_url || meta.picture || null
  const displayName: string =
    meta.display_name || meta.full_name || meta.name || user.email?.split('@')[0] || 'User'
  const email = user.email || ''
  const initial = displayName.charAt(0).toUpperCase()

  return { displayName, email, avatarUrl, initial }
}

/**
 * Get current user's role from the profiles table.
 * Returns 'user' by default, 'admin' for admin@gmail.com.
 */
export function useUserRole() {
  const { user } = useAuth()
  const [role, setRole] = useState<string>('user')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { role: string } | null }) => {
        if (data?.role) setRole(data.role)
        setLoading(false)
      })
  }, [user])

  return { role, loading, isAdmin: role === 'admin' }
}

/**
 * Hook to get user's gender from profiles.
 * Uses custom events so all UserAvatar instances update in realtime.
 */
export function useUserGender() {
  const { user } = useAuth()
  const [gender, setGenderState] = useState<string>('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { gender: string } | null }) => {
        if (data?.gender) setGenderState(data.gender)
      })

    // Listen for gender changes from other components
    const handler = (e: Event) => {
      setGenderState((e as CustomEvent).detail)
    }
    window.addEventListener('gender-changed', handler)
    return () => window.removeEventListener('gender-changed', handler)
  }, [user])

  const setGender = (g: string) => {
    setGenderState(g)
    window.dispatchEvent(new CustomEvent('gender-changed', { detail: g }))
  }

  return { gender, setGender }
}

/**
 * Reusable avatar component that shows:
 * - Google profile picture if available
 * - Gender-based avatar (male/female) if gender is set
 * - First letter initial on a gradient background otherwise
 */
export default function UserAvatar({
  size = 40,
  className = '',
  borderClass = '',
}: {
  size?: number
  className?: string
  borderClass?: string
}) {
  const { avatarUrl, initial } = useUserInfo()
  const { gender } = useUserGender()

  // Google avatar takes priority
  if (avatarUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden ${borderClass} ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    )
  }

  // Gender-based avatar
  if (gender === 'male' || gender === 'female') {
    const avatarSrc = gender === 'male' ? '/images/avatar_male.png' : '/images/avatar_female.png'
    return (
      <div
        className={`rounded-full overflow-hidden ${borderClass} ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={avatarSrc}
          alt={gender === 'male' ? 'Nam' : 'Nữ'}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Fallback: initial letter
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold ${borderClass} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  )
}
