import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Shared State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(''); setLoading(true);
      const userCreds = await login(email, password);
      const userDoc = await getDoc(doc(db, 'users', userCreds.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') navigate('/admin/dashboard');
      else navigate('/citizen/submit');
    } catch (err) { setError('Invalid email or password.'); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(''); setLoading(true);
      await signup(email, password, name, role);
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/citizen/submit');
    } catch (err) { setError('Failed to create account: ' + err.message); }
    setLoading(false);
  };

  const toggleFlip = () => {
    setError('');
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] perspective-1200 animate-scale-up">
      {/* Increased height to 650px so both sides fit identically */}
      <div className={`w-full max-w-md h-[650px] relative preserve-3d flip-transition ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* ================= FRONT FACE: LOGIN ================= */}
        <div className="absolute w-full h-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 backface-hidden flex flex-col">
          
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="bg-gov-ink/5 p-4 rounded-full text-gov-ink mb-3">
              <LogIn size={28} />
            </div>
            <h2 className="text-3xl text-gov-ink font-bold font-display">Secure Login</h2>
            <p className="text-gray-500 text-sm mt-1">Enter credentials to access the portal.</p>
          </div>

          {error && !isFlipped && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-cobalt outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-cobalt outline-none transition-all" />
            </div>

            <button disabled={loading} type="submit"
              className="w-full bg-gov-ink text-white py-3.5 rounded-lg font-bold tracking-wide hover:bg-gray-800 transition-all hover:shadow-lg disabled:opacity-50 mt-6">
              {loading ? 'Authenticating...' : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-auto pt-6 text-center text-sm text-gray-500 border-t border-gray-100">
            Don't have an account? <button type="button" onClick={toggleFlip} className="text-gov-cobalt font-bold hover:underline ml-1">Register Here</button>
          </div>
        </div>


        {/* ================= BACK FACE: REGISTER ================= */}
        <div className="absolute w-full h-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 backface-hidden rotate-y-180 flex flex-col">
          
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="bg-gov-ink/5 p-4 rounded-full text-gov-ink mb-3">
              <UserPlus size={28} />
            </div>
            <h2 className="text-3xl text-gov-ink font-bold font-display">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Register to start reporting issues.</p>
          </div>

          {error && isFlipped && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-cobalt outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-cobalt outline-none transition-all" />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-cobalt outline-none transition-all" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gov-cobalt outline-none cursor-pointer transition-all">
                  <option value="citizen">Citizen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button disabled={loading} type="submit"
              className="w-full bg-gov-ink text-white py-3.5 rounded-lg font-bold tracking-wide hover:bg-gray-800 transition-all hover:shadow-lg disabled:opacity-50 mt-6">
              {loading ? 'Registering...' : 'Register Access'}
            </button>
          </form>

          <div className="mt-auto pt-6 text-center text-sm text-gray-500 border-t border-gray-100">
            Already registered? <button type="button" onClick={toggleFlip} className="text-gov-cobalt font-bold hover:underline ml-1">Sign In Here</button>
          </div>
        </div>

      </div>
    </div>
  );
}