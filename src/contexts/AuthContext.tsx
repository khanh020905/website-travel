import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isRecovery: boolean
  clearRecovery: () => void
  signIn: (displayName: string, password: string) => Promise<{ error: string | null }>
  signUp: (displayName: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Detect password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          setIsRecovery(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const clearRecovery = () => setIsRecovery(false)

  const signIn = async (displayName: string, password: string) => {
    // Look up the user's email by their display_name
    const { data: email, error: lookupError } = await supabase.rpc('get_email_by_display_name', {
      p_display_name: displayName
    })
    if (lookupError || !email) {
      return { error: 'Tên đăng nhập hoặc mật khẩu không đúng' }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (displayName: string, password: string) => {
    // Generate a unique email for Supabase (users never see this)
    const slug = displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const email = `${slug}_${Date.now()}@travel.local`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    })
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isRecovery, clearRecovery, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
