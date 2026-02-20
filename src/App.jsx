import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { motion, AnimatePresence } from 'framer-motion';

import Login from './pages/public/Login';
import Register from './pages/public/Register';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import AdminDashboard from './pages/admin/AdminDashboard';
import CitizenDashboard from './pages/citizen/CitizenDashboard';

const AuthButtons = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Tracks where the user is
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function fetchRole() {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      }
    }
    fetchRole();
  }, [currentUser]);

  // LOGIC: Hide buttons if not logged in OR if on public pages
  const publicPages = ['/login', '/register', '/'];
  if (!currentUser || publicPages.includes(location.pathname)) {
    return null;
  }

  return (
    <motion.div 
      className="flex items-center gap-2 md:gap-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button 
        onClick={() => {
          if (userRole === 'admin') navigate('/admin/dashboard');
          else navigate('/citizen/dashboard');
        }}
        whileHover={{ scale: 1.05, backgroundColor: "rgba(37, 99, 235, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        className="text-sm flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-xl transition-all relative group"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -left-1 -top-1 opacity-0 group-hover:opacity-100"
        >
          <Sparkles size={12} className="text-yellow-500" />
        </motion.div>
        <LayoutDashboard size={18} /> 
        <span className="hidden sm:inline">Dashboard</span>
      </motion.button>

      <motion.button 
        onClick={() => { logout(); navigate('/login'); }} 
        whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}
        whileTap={{ scale: 0.95 }}
        className="text-sm flex items-center gap-2 font-bold text-red-600 hover:text-red-700 transition-all px-4 py-2 rounded-xl hover:bg-red-50"
      >
        <LogOut size={18} /> 
        <span className="hidden sm:inline">Sign Out</span>
      </motion.button>
    </motion.div>
  );
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-gov-base relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <motion.nav 
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-lg sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/50"
              animate={{ 
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 0 0 rgba(16, 185, 129, 0.4)",
                  "0 0 0 8px rgba(16, 185, 129, 0)",
                  "0 0 0 0 rgba(16, 185, 129, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.span 
              className="text-2xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent tracking-tight"
              whileHover={{ x: 2 }}
            >
              CIVIC<span className="text-blue-600">PORTAL</span>
            </motion.span>
          </motion.div>
          
          <AuthButtons />
        </div>
      </motion.nav>

      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-10"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <Routes location={location}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/citizen/submit" element={<SubmitComplaint />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;