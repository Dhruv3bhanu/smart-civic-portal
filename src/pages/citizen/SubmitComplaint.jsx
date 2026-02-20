import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, addDoc, GeoPoint, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl } from 'react-leaflet';
import { MapPin, UploadCloud, AlertCircle, CheckCircle2, Crosshair, Loader2 } from 'lucide-react';
import { calculateDistance } from '../../utils/geo'; 
import { motion, AnimatePresence } from 'framer-motion';

// Required for Leaflet maps
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition(e.latlng); },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function SubmitComplaint() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads & Infrastructure');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [position, setPosition] = useState({ lat: 19.0760, lng: 72.8777 });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.5)); 
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please upload a photo of the issue.');
    if (!currentUser) return setError('You must be logged in to submit a report.');

    try {
      setLoading(true);
      setError('');

      // 1. Fetch active complaints to check for duplicates
      const complaintsRef = collection(db, 'complaints');
      const activeQuery = query(complaintsRef, where('status', 'in', ['Pending', 'In Progress']));
      const snapshot = await getDocs(activeQuery);

      let isDuplicate = false;
      let nearbyCount = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.location) {
          // Calculate distance in meters
          const dist = calculateDistance(position.lat, position.lng, data.location.latitude, data.location.longitude);
          
          // CHECK: Both Title and Proximity must match for an automatic block
          const titleMatches = data.title?.toLowerCase().trim() === title.toLowerCase().trim();
          const locationMatches = dist <= 100; // 100 meters threshold

          if (titleMatches && locationMatches) {
            isDuplicate = true;
          }

          // Count general nearby issues for Priority logic (within 250m)
          if (dist <= 250) nearbyCount++;
        }
      });

      // 2. Alert and Stop if exact duplicate is found
      if (isDuplicate) {
        setError(`An issue with the title "${title}" has already been reported at this exact location.`);
        setLoading(false);
        return;
      }

      // 3. Priority Logic
      let priority = nearbyCount >= 6 ? 'High' : nearbyCount >= 3 ? 'Medium' : 'Low';
      const base64Image = await compressImage(image);

      // 4. Save to Firestore
      await addDoc(collection(db, 'complaints'), {
        citizenId: currentUser.uid,
        title,
        category,
        description,
        imageUrl: base64Image,
        location: new GeoPoint(position.lat, position.lng),
        status: 'Pending',
        priority,
        createdAt: serverTimestamp(),
      });

      setSuccess(`Report successfully submitted! Priority: ${priority}`);
      setTimeout(() => navigate('/citizen/dashboard'), 2000);

    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-6"
    >
      <motion.div 
        className="mb-8 border-b border-gradient-to-r from-transparent via-gray-200 to-transparent pb-6 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <motion.h1 
            className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Report a Civic Issue
          </motion.h1>
          <motion.p 
            className="text-slate-500 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Provide details and tag the location for rapid resolution.
          </motion.p>
        </div>
        <motion.button 
          onClick={() => navigate('/citizen/dashboard')} 
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm font-bold text-slate-600 hover:text-blue-600 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all"
        >
          ← Back to Dashboard
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20, scale: 0.95 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="mb-6 p-5 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <AlertCircle size={24} />
            </motion.div>
            <p className="font-bold">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-l-4 border-emerald-500 text-emerald-700 flex items-center gap-3 rounded-r-xl shadow-lg"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle2 size={24} />
            </motion.div>
            <p className="font-bold">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Issue Title</label>
              <motion.input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md" 
                placeholder="e.g., Pothole near station"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Category</label>
              <motion.select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer appearance-none shadow-sm hover:shadow-md transition-all"
                whileFocus={{ scale: 1.01 }}
              >
                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                <option value="Garbage & Waste">Garbage & Waste</option>
                <option value="Street Lighting">Street Lighting</option>
                <option value="Water & Drainage">Water & Drainage</option>
              </motion.select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Description</label>
              <motion.textarea 
                required 
                rows="4" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md resize-none" 
                placeholder="Describe the issue in detail..."
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Photo Evidence</label>
              <motion.label 
                className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-300 border-dashed rounded-3xl cursor-pointer bg-gradient-to-br from-slate-50 to-white hover:from-blue-50 hover:to-white transition-all relative overflow-hidden group"
                whileHover={{ scale: 1.02, borderColor: "#3b82f6" }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {image ? (
                  <motion.div 
                    className="text-center relative z-10"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                    </motion.div>
                    <p className="text-sm font-bold text-slate-700">{image.name}</p>
                  </motion.div>
                ) : (
                  <div className="text-center relative z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <UploadCloud className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                    </motion.div>
                    <p className="text-sm text-slate-600 font-bold">Click to upload photo</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </motion.label>
            </motion.div>

            <motion.button 
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 40px -12px rgba(37, 99, 235, 0.4)",
                y: -2
              }}
              whileTap={{ scale: 0.98 }}
              disabled={loading} 
              type="submit"
              className="relative w-full py-5 bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    Verifying...
                  </>
                ) : (
                  "Submit Official Report"
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-white to-slate-50/50 p-8 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all flex flex-col h-full min-h-[600px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h2 
              className="text-xl font-black text-slate-900 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MapPin size={24} className="text-blue-600" />
              </motion.div>
              Pinpoint Location
            </motion.h2>
            <motion.button 
              onClick={() => navigator.geolocation.getCurrentPosition(l => setPosition({lat: l.coords.latitude, lng: l.coords.longitude}))} 
              whileHover={{ scale: 1.05, backgroundColor: "#3b82f6", color: "white" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-sm bg-white border-2 border-gray-200 px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-bold shadow-sm hover:shadow-md"
            >
              <Crosshair size={18} /> Auto-Detect
            </motion.button>
          </div>

          <motion.div 
            className="flex-grow rounded-3xl overflow-hidden border-2 border-gray-200 shadow-inner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ borderColor: "#3b82f6" }}
          >
            <MapContainer center={[position.lat, position.lng]} zoom={13} zoomControl={false} className="h-full w-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <ZoomControl position="bottomright" />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </motion.div>
          
          <motion.div 
            className="mt-6 flex items-center justify-between text-xs font-mono font-black text-slate-500 bg-gradient-to-r from-slate-100 to-blue-50/50 p-4 rounded-2xl border border-slate-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
            >
              LAT: {position.lat.toFixed(6)}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
            >
              LNG: {position.lng.toFixed(6)}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}