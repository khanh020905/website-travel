import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Login from './pages/Login'
import Home from './pages/Home'
import Order from './pages/Order'
import Support from './pages/Support'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import BottomNav from './components/BottomNav'
import DesktopSidebar from './components/DesktopSidebar'
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="relative min-h-dvh">
      {!isLoginPage && <DesktopSidebar />}
      <div className={!isLoginPage ? 'md:ml-[220px] lg:ml-[240px]' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/order" element={<Order />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/schedule" element={<Order />} />
            <Route path="/photos" element={<Profile />} />
            <Route path="/settings" element={<Profile />} />
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
