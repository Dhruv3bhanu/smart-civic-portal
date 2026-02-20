import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const userCreds = await login(email, password);
      const userDoc = await getDoc(doc(db, 'users', userCreds.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/citizen/submit');
      }
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <motion.div 
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-gray-200/50 relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        {/* Decorative gradient overlay */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-t-3xl"
          animate={{
            backgroundPosition: ["0%", "100%", "0%"]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <motion.div 
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5 rounded-2xl text-blue-600 mb-4 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(37, 99, 235, 0.4)",
                "0 0 0 10px rgba(37, 99, 235, 0)",
                "0 0 0 0 rgba(37, 99, 235, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <LogIn size={36} />
            <motion.div
              className="absolute top-2 right-2"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={16} className="text-yellow-500" />
            </motion.div>
          </motion.div>
          <motion.h2 
            className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Portal Login
          </motion.h2>
          <motion.p 
            className="text-gray-500 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Access the smart civic network.
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 text-red-700 rounded-xl text-sm flex items-center gap-2 shadow-lg"
            >
              <AlertCircle size={18} />
              <span className="font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-sm font-black text-gray-700 ml-1 uppercase tracking-wide">Email Address</label>
            <motion.input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
              whileFocus={{ scale: 1.01 }}
              placeholder="your.email@example.com"
            />
          </motion.div>
          
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="text-sm font-black text-gray-700 ml-1 uppercase tracking-wide">Password</label>
            <motion.input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
              whileFocus={{ scale: 1.01 }}
              placeholder="••••••••"
            />
          </motion.div>

          <motion.button 
            disabled={loading} 
            type="submit"
            whileHover={{ 
              scale: loading ? 1 : 1.02,
              boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.4)",
              y: loading ? 0 : -2
            }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full text-white py-5 rounded-xl font-black text-lg tracking-wide shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 mt-6 overflow-hidden group bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={20} />
                  </motion.div>
                  Authenticating...
                </>
              ) : (
                "Sign In to Portal"
              )}
            </span>
          </motion.button>
        </form>

        <motion.div 
          className="mt-8 text-center text-sm text-gray-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Need an account?{' '}
          <Link 
            to="/register" 
            className="text-blue-600 font-black hover:text-blue-700 hover:underline transition-colors relative group"
          >
            Register Here
            <motion.span
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all"
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}