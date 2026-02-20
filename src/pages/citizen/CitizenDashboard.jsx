import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, MapPin, ChevronRight, Activity, Loader2, Sparkles, TrendingUp, X, Calendar, Tag, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "tween",
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null); // null = all, 'Resolved', 'In Progress', 'Pending'

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'complaints'),
      where('citizenId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setReports(fetchedData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-96 flex flex-col items-center justify-center gap-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="text-blue-600" size={48} />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 font-medium tracking-tight text-lg"
        >
          Syncing Live Records...
        </motion.p>
        <motion.div
          className="flex gap-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    );
  }

  const stats = {
    total: reports.length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    pending: reports.filter(r => r.status === 'Pending').length
  };

  // Filter reports based on selected filter
  const filteredReports = filter 
    ? reports.filter(r => r.status === filter)
    : reports;

  const handleFilterClick = (filterType) => {
    // Immediate state update for instant response
    if (filter === filterType) {
      setFilter(null); // Toggle off if already selected
    } else {
      setFilter(filterType);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-6"
    >
      {/* Enhanced Header with Gradient */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-end mb-8 pb-8 border-b border-gradient-to-r from-slate-100 via-blue-50 to-slate-100"
      >
        <div className="relative">
          <motion.div 
            className="flex items-center gap-2 text-blue-600 font-bold mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Activity size={20} />
            </motion.div>
            <span className="text-xs uppercase tracking-[0.2em]">Live Portal</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="ml-2"
            >
              <Sparkles size={14} className="text-yellow-500" />
            </motion.div>
          </motion.div>
          <motion.h1 
            className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            My Reports
          </motion.h1>
          {stats.total > 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-slate-500 mt-2 flex items-center gap-2"
            >
              <TrendingUp size={14} className="text-emerald-500" />
              {stats.resolved} resolved • {stats.inProgress} in progress • {stats.pending} pending
            </motion.p>
          )}
        </div>
        
        {/* Enhanced Button with Gradient Effect */}
        <Link to="/citizen/submit">
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.4)",
              y: -2
            }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 overflow-hidden group shadow-2xl shadow-blue-500/30"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              className="relative z-10 flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 90, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Plus size={22} strokeWidth={3} />
              </motion.div>
              <span>Add Complaint</span>
            </motion.div>
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: Activity, filterType: null },
            { label: 'Resolved', value: stats.resolved, color: 'emerald', icon: TrendingUp, filterType: 'Resolved' },
            { label: 'In Progress', value: stats.inProgress, color: 'blue', icon: Activity, filterType: 'In Progress' },
            { label: 'Pending', value: stats.pending, color: 'amber', icon: MapPin, filterType: 'Pending' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFilterClick(stat.filterType)}
              className={`bg-gradient-to-br from-white to-${stat.color}-50/30 p-5 rounded-2xl border-2 ${
                filter === stat.filterType 
                  ? `border-${stat.color}-500 shadow-xl` 
                  : `border-${stat.color}-100 shadow-lg hover:shadow-xl`
              } transition-all cursor-pointer relative overflow-hidden group`}
            >
              {filter === stat.filterType && (
                <motion.div
                  className={`absolute inset-0 bg-${stat.color}-100/20`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1 }}
                />
              )}
              <div className="flex items-center justify-between mb-2 relative z-10">
                <stat.icon className={`text-${stat.color}-600`} size={20} />
                <span className={`text-xs font-bold text-${stat.color}-600 uppercase tracking-wider`}>{stat.label}</span>
              </div>
              <p className={`text-3xl font-black text-${stat.color}-700 relative z-10`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Active Filter Indicator */}
      <AnimatePresence>
        {filter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="mb-6 flex items-center gap-3"
          >
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-xl border-2 border-blue-300">
            <span className="text-sm font-bold text-blue-700">
              Showing: <span className="uppercase">{filter}</span> complaints
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-slate-300 transition-all"
          >
            <X size={16} className="text-slate-600" />
            <span className="text-sm font-bold text-slate-700">Clear Filter</span>
          </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports List */}
      <motion.div 
        className="grid gap-5"
        key={filter || 'all'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <AnimatePresence mode="wait">
          {filteredReports.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="text-center py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="bg-white w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border-2 border-blue-100 relative z-10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MapPin className="text-blue-400" size={36} />
              </motion.div>
              <p className="text-slate-600 font-bold text-xl mb-2 relative z-10">
                {filter ? `No ${filter.toLowerCase()} complaints found` : 'No active reports found'}
              </p>
              <p className="text-slate-400 text-sm relative z-10">
                {filter ? 'Try selecting a different filter or clear the filter to see all complaints.' : 'Click the button above to report a new civic issue.'}
              </p>
            </motion.div>
          ) : (
            filteredReports.map((r, index) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, delay: index * 0.01 }}
                whileHover={{ 
                  y: -6, 
                  scale: 1.01,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}
                className="group bg-gradient-to-br from-white to-slate-50/50 p-6 rounded-[2rem] border border-slate-200 shadow-md hover:shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Animated background gradient on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                
                <div className="flex items-start gap-6 relative z-10 flex-1">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {r.imageUrl ? (
                      <motion.img 
                        src={r.imageUrl} 
                        alt="" 
                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100 group-hover:ring-blue-200 transition-all shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      />
                    ) : (
                      <motion.div 
                        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 shadow-lg"
                        animate={{ 
                          background: [
                            "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                            "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
                            "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <MapPin size={32} />
                      </motion.div>
                    )}
                    {r.status === 'Resolved' && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.div
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3 
                      className="font-bold text-slate-900 text-xl group-hover:text-blue-600 transition-colors mb-2"
                      whileHover={{ x: 4 }}
                    >
                      {r.title}
                    </motion.h3>
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <motion.span 
                        className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-tighter"
                        whileHover={{ scale: 1.05 }}
                      >
                        #{r.id.slice(0, 8)}
                      </motion.span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {r.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {r.category && (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                          <Tag size={12} />
                          {r.category}
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="text-sm text-slate-600 mb-2 flex items-start gap-2 line-clamp-2">
                        <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{r.description}</span>
                      </p>
                    )}
                    {r.priority && (
                      <motion.span 
                        className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                          r.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                          r.priority === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {r.priority} Priority
                      </motion.span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 relative z-10 flex-shrink-0">
                  <motion.span 
                    className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border-2 shadow-sm whitespace-nowrap ${
                      r.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      r.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    animate={r.status === 'In Progress' ? {
                      boxShadow: [
                        "0 0 0 0 rgba(37, 99, 235, 0.4)",
                        "0 0 0 8px rgba(37, 99, 235, 0)",
                        "0 0 0 0 rgba(37, 99, 235, 0)"
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {r.status || 'Pending'}
                  </motion.span>
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white transition-all shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}