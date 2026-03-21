import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Login from './pages/Login'
import Home from './pages/Home'
import Order from './pages/Order'
import Support from './pages/Support'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import ComingSoon from './pages/ComingSoon'
import BottomNav from './components/BottomNav'
import DesktopNavbar from './components/DesktopNavbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isHomePage = location.pathname === '/home'
  const needsNavbarPadding = !isLoginPage && !isHomePage

  return (
    <div className="relative min-h-dvh">
      <DesktopNavbar />
      <div className={needsNavbarPadding ? 'md:pt-16' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/order" element={<ProtectedRoute><Order /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/photos" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
        {!isLoginPage && <Footer />}
      </div>
      {!isLoginPage && <BottomNav />}
    </div>
  )
}

export default App
