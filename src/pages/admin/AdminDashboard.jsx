import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LayoutDashboard, Map as MapIcon, AlertTriangle, CheckCircle, Clock, Maximize, BarChart3 } from 'lucide-react';
import L from 'leaflet';

// Custom Map Markers
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const icons = {
  High: createIcon('red'),
  Medium: createIcon('gold'),
  Low: createIcon('blue'),
  Resolved: createIcon('green')
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try { await updateDoc(doc(db, 'complaints', id), { status: newStatus }); } catch (err) { console.error(err); }
  };

  const viewFullImage = (base64String) => {
    const imageWindow = window.open("");
    imageWindow.document.write(`<body style="margin:0;display:flex;justify-content:center;background:#f4f5f7;"><img src="${base64String}" style="max-height:100vh;"/></body>`);
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    high: complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-display font-black text-gov-ink tracking-tight">Command Center</h1>
          <p className="text-gray-500 font-medium mt-1">Real-time civic intelligence and response unit.</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200 shadow-inner">
          <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-gov-cobalt scale-105' : 'text-gray-500 hover:text-gov-ink'}`}>
            <LayoutDashboard size={18} /> Data View
          </button>
          <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-gov-cobalt scale-105' : 'text-gray-500 hover:text-gov-ink'}`}>
            <MapIcon size={18} /> Live Map
          </button>
        </div>
      </div>

      {/* Enhanced Analytics Cards with Color Accents */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-gov-cobalt/10 group-hover:text-gov-cobalt/20 transition-colors">
            <BarChart3 size={64} />
          </div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">System Total</p>
          <p className="text-4xl font-display font-bold text-gov-ink">{stats.total}</p>
          <div className="w-12 h-1.5 bg-gov-cobalt rounded-full mt-4"></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-gov-amber/10 group-hover:text-gov-amber/20 transition-colors">
            <Clock size={64} />
          </div>
          <p className="text-gov-amber text-xs font-black uppercase tracking-widest mb-1">Awaiting Action</p>
          <p className="text-4xl font-display font-bold text-gov-ink">{stats.pending}</p>
          <div className="w-12 h-1.5 bg-gov-amber rounded-full mt-4"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-gov-emerald/10 group-hover:text-gov-emerald/20 transition-colors">
            <CheckCircle size={64} />
          </div>
          <p className="text-gov-emerald text-xs font-black uppercase tracking-widest mb-1">Resolved Cases</p>
          <p className="text-4xl font-display font-bold text-gov-ink">{stats.resolved}</p>
          <div className="w-12 h-1.5 bg-gov-emerald rounded-full mt-4"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-gov-vermilion/10 group-hover:text-gov-vermilion/20 transition-colors">
            <AlertTriangle size={64} />
          </div>
          <p className="text-gov-vermilion text-xs font-black uppercase tracking-widest mb-1">Critical Priority</p>
          <p className="text-4xl font-display font-bold text-gov-ink">{stats.high}</p>
          <div className="w-12 h-1.5 bg-gov-vermilion rounded-full mt-4"></div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-scale-up">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-xs font-black text-gray-400 uppercase tracking-tighter">
                <th className="p-5">Issue & Evidence</th>
                <th className="p-5">Geo-Coordinates</th>
                <th className="p-5">System Priority</th>
                <th className="p-5">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-gov-base/50 transition-colors group">
                  <td className="p-5">
                    <p className="font-bold text-lg text-gov-ink group-hover:text-gov-cobalt transition-colors">{c.title}</p>
                    {c.imageUrl && (
                      <button onClick={() => viewFullImage(c.imageUrl)} className="flex items-center gap-1.5 text-xs text-gov-cobalt font-black mt-2 uppercase tracking-wide hover:underline">
                        <Maximize size={12} /> View High-Res Evidence
                      </button>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="text-xs font-mono bg-gray-100 inline-block px-2 py-1 rounded text-gray-600 border border-gray-200">
                      {c.location?.latitude?.toFixed(4)}, {c.location?.longitude?.toFixed(4)}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      c.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                      c.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="p-5">
                    <select 
                      value={c.status} 
                      onChange={(e) => updateStatus(c.id, e.target.value)} 
                      className={`text-sm font-bold py-2 px-3 rounded-xl border outline-none transition-all cursor-pointer ${
                        c.status === 'Resolved' ? 'bg-gov-emerald text-white border-transparent' : 
                        c.status === 'In Progress' ? 'bg-gov-cobalt text-white border-transparent' : 
                        'bg-white text-gov-ink border-gray-200 hover:border-gov-cobalt'
                      }`}
                    >
                      <option value="Pending" className="text-gov-ink bg-white">Pending</option>
                      <option value="In Progress" className="text-gov-ink bg-white">In Progress</option>
                      <option value="Resolved" className="text-gov-ink bg-white">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {complaints.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest">No active reports found in local sector.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-[650px] rounded-3xl overflow-hidden border-4 border-white shadow-2xl animate-scale-up">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            {complaints.map(c => c.location && (
              <Marker key={c.id} position={[c.location.latitude, c.location.longitude]} icon={icons[c.priority] || icons.Medium}>
                <Popup className="font-sans">
                  <p className="font-black text-gov-ink uppercase text-xs mb-1">{c.title}</p>
                  <p className="text-[10px] text-gray-500 font-bold">{c.status}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}