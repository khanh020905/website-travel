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
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="relative min-h-dvh">
      <div>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/schedule" element={<ComingSoon />} />
            <Route path="/photos" element={<ComingSoon />} />
            <Route path="/settings" element={<ComingSoon />} />
            <Route path="/admin" element={<AdminDashboard />} />
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

