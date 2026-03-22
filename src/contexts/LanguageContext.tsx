import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Lang = 'vi' | 'en'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (vi: string, en: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'vi',
  setLang: () => {},
  t: (vi: string) => vi,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('app_language')
    return (saved === 'en' ? 'en' : 'vi') as Lang
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('app_language', l)
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = (vi: string, en: string) => (lang === 'en' ? en : vi)

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
