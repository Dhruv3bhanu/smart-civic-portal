import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, AlertCircle, ShieldCheck, User, Mail, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [adminCode, setAdminCode] = useState(''); // New state for admin verification
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // THE SECRET ADMIN CODE (You can change this to whatever you like)
  const SECRET_ADMIN_KEY = "123456789"; 

  async function handleSubmit(e) {
    e.preventDefault();
    
    // 1. Check if the admin code is correct BEFORE calling signup
    if (role === 'admin' && adminCode !== SECRET_ADMIN_KEY) {
      return setError('Invalid Official Access Code. Registration denied.');
    }

    try {
      setError('');
      setLoading(true);
      
      // 2. Call your existing signup function
      await signup(email, password, name, role);
      
      // 3. Navigate based on the verified role
      role === 'admin' ? navigate('/admin/dashboard') : navigate('/citizen/submit');
    } catch (err) {
      setError('Registration failed. Please check your details or connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 relative overflow-hidden bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-gray-200/50 relative z-10"
      >
        {/* Decorative gradient top bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-[2rem]"
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
            className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-5 rounded-2xl text-blue-600 mb-4 relative overflow-hidden"
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
            <UserPlus size={36} />
          </motion.div>
          <motion.h2 
            className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Create Account
          </motion.h2>
          <motion.p 
            className="text-gray-500 text-sm mt-1 text-center font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Join the smart civic management network.
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
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <motion.input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </motion.div>
          
          {/* Email */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <motion.input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@portal.com"
                className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </motion.div>
          
          {/* Password */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <motion.input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
                whileFocus={{ scale: 1.01 }}
              />
            </div>
          </motion.div>
          
          {/* Portal Role */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Portal Role</label>
            <motion.select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium shadow-sm hover:shadow-md"
              whileFocus={{ scale: 1.01 }}
            >
              <option value="citizen">Citizen (Reporting)</option>
              <option value="admin">Official (Management)</option>
            </motion.select>
          </motion.div>

          {/* Conditional Admin Code with Animation */}
          <AnimatePresence>
            {role === 'admin' && (
              <motion.div 
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-xs font-black uppercase tracking-widest text-blue-600 ml-1 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  Official Access Code
                </label>
                <div className="relative">
                  <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                  <motion.input 
                    type="text" 
                    required 
                    value={adminCode} 
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter Secret Code"
                    className="w-full p-4 pl-12 bg-gradient-to-r from-blue-50 to-purple-50/50 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-blue-700 font-bold placeholder:text-blue-300 shadow-sm"
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ 
              scale: loading ? 1 : 1.02,
              boxShadow: "0 20px 40px -12px rgba(17, 24, 39, 0.4)",
              y: loading ? 0 : -2
            }}
            whileTap={{ scale: 0.98 }}
            disabled={loading} 
            type="submit"
            className="relative w-full text-white py-5 rounded-2xl font-black text-lg tracking-wide transition-all shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/50 disabled:opacity-50 mt-6 overflow-hidden group bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  Securing Profile...
                </>
              ) : (
                "Complete Registration"
              )}
            </span>
          </motion.button>
        </form>

        <motion.div 
          className="mt-8 text-center text-sm text-gray-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          Already a member?{' '}
          <Link 
            to="/login" 
            className="text-blue-600 font-black hover:text-blue-700 hover:underline transition-colors relative group"
          >
            Sign In Here
            <motion.span
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all"
            />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}