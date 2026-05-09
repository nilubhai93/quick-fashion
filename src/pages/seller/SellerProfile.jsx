import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sellerSettingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Switch from '@mui/material/Switch';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ location, setLocation }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      setLocation({ lat: center.lat, lng: center.lng });
    },
  });

  useEffect(() => {
    if (location?.lat && location?.lng) {
      const currentCenter = map.getCenter();
      const dist = Math.sqrt(Math.pow(currentCenter.lat - location.lat, 2) + Math.pow(currentCenter.lng - location.lng, 2));
      if (dist > 0.0001) {
        map.flyTo([location.lat, location.lng], map.getZoom());
      }
    }
  }, [location, map]);

  return null; 
}

export default function SellerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      // Backend settings route already delivers storeName, businessPhone, gstNumber, etc
      const res = await sellerSettingsAPI.get();
      setProfile(res.data.settings);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await sellerSettingsAPI.update(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  const cardStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '32px', marginBottom: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Seller Profile
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Manage the public details of your store.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 20px', borderRadius: 'var(--radius-md)',
            background: saved ? '#10b981' : 'var(--accent)', color: '#fff',
            border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.3s', opacity: saving ? 0.7 : 1
          }}
        >
          {saved ? (
            <><CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> Saved!</>
          ) : saving ? (
            <><CircularProgress size={16} sx={{ color: '#fff' }} /> Saving...</>
          ) : (
            <><SaveOutlinedIcon sx={{ fontSize: 16 }} /> Save Profile</>
          )}
        </button>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '20px', marginBottom: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StorefrontIcon sx={{ fontSize: 20, color: 'var(--accent)' }} /> Store Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Store Name</label>
            <input
              style={inputStyle}
              value={profile?.storeName || ''}
              onChange={e => updateField('storeName', e.target.value)}
              placeholder="My Fashion Store"
            />
          </div>
          <div>
            <label style={labelStyle}>Owner Name</label>
            <input
              style={inputStyle}
              value={profile?.name || ''}
              onChange={e => updateField('name', e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label style={labelStyle}>Business Phone</label>
            <input
              style={inputStyle}
              value={profile?.businessPhone || ''}
              onChange={e => updateField('businessPhone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label style={labelStyle}>GST Number</label>
            <input
              style={inputStyle}
              value={profile?.gstNumber || ''}
              onChange={e => updateField('gstNumber', e.target.value)}
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
          <div>
            <label style={labelStyle}>Categories</label>
            <input
              style={inputStyle}
              value={profile?.categories || ''}
              onChange={e => updateField('categories', e.target.value)}
              placeholder="Men, Women, Accessories"
            />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
              value={profile?.email || ''}
              disabled
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={labelStyle}>Business Address</label>
          <input
            style={inputStyle}
            value={profile?.businessAddress || ''}
            onChange={e => updateField('businessAddress', e.target.value)}
            placeholder="123 Fashion Street, Mumbai"
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={labelStyle}>Store Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
            value={profile?.storeDescription || ''}
            onChange={e => updateField('storeDescription', e.target.value)}
            placeholder="Tell customers about your store, specialties, and what makes you unique..."
          />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <label style={{...labelStyle, marginBottom: '4px'}}>Show Rent Products on Home Page</label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Enable this to show your available rental clothes in the global New Arrivals section.
            </span>
          </div>
          <Switch
            checked={profile?.showRentOnHome || false}
            onChange={(e) => updateField('showRentOnHome', e.target.checked)}
            sx={{ 
              '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--accent)' }, 
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--accent)' } 
            }}
          />
        </div>

        {/* GPS Location Section */}
        <div style={{ 
          marginTop: '32px', padding: '24px', borderRadius: 'var(--radius-xl)', 
          background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.03))', 
          border: '1px solid rgba(99,102,241,0.2)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LocationOnIcon sx={{ color: 'var(--accent)' }} /> Store Location (GPS)
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px' }}>
                Set your precise store coordinates so delivery partners can find your pickup point easily.
              </p>
            </div>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      updateField('hubLocation', { lat: pos.coords.latitude, lng: pos.coords.longitude });
                      alert('Location captured successfully! Click "Save Profile" to update.');
                    },
                    (err) => alert('Error getting location: ' + err.message)
                  );
                } else {
                  alert('Geolocation is not supported by your browser');
                }
              }}
              style={{
                padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)',
                background: 'transparent', color: 'var(--accent)', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MyLocationIcon sx={{ fontSize: 18 }} /> Get Current Location
            </button>
          </div>

          <div style={{ 
            marginTop: '20px', padding: '12px 16px', borderRadius: 'var(--radius-md)', 
            background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'inline-flex', gap: '20px', marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>LATITUDE:</span> &nbsp;
              <span style={{ fontFamily: 'monospace', color: profile?.hubLocation?.lat ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {profile?.hubLocation?.lat?.toFixed(6) || 'Not set'}
              </span>
            </div>
            <div style={{ fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>LONGITUDE:</span> &nbsp;
              <span style={{ fontFamily: 'monospace', color: profile?.hubLocation?.lng ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {profile?.hubLocation?.lng?.toFixed(6) || 'Not set'}
              </span>
            </div>
          </div>

          {/* Leaflet Map with Fixed Center Crosshair */}
          <div style={{ height: '350px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
            <MapContainer 
              center={[profile?.hubLocation?.lat || 22.5726, profile?.hubLocation?.lng || 88.3639]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker location={profile?.hubLocation} setLocation={(loc) => updateField('hubLocation', loc)} />
              
              {/* Custom Map Controls */}
              <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px' }}>
                <div className="leaflet-control leaflet-bar">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            updateField('hubLocation', { lat: pos.coords.latitude, lng: pos.coords.longitude });
                          },
                          (err) => alert('Error: ' + err.message)
                        );
                      }
                    }}
                    title="Locate Me"
                    style={{
                      width: '34px', height: '34px', background: 'white', border: 'none', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#444'
                    }}
                  >
                    <MyLocationIcon sx={{ fontSize: 20 }} />
                  </button>
                </div>
              </div>
            </MapContainer>
            
            {/* Redesigned Premium Center Pin */}
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', 
              zIndex: 1001, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' 
            }}>
              {/* Floating Animation Wrapper */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <div style={{ 
                  width: '44px', height: '44px', 
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 15px rgba(99,102,241,0.4)', 
                  border: '2px solid white'
                }}>
                  <div style={{ 
                    width: '14px', height: '14px', background: 'white', borderRadius: '50%', 
                    transform: 'rotate(45deg)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' 
                  }} />
                </div>
              </motion.div>
              
              {/* Pulse Effect at the tip */}
              <div style={{ position: 'relative', marginTop: '-2px' }}>
                <div style={{ width: '4px', height: '4px', background: '#6366f1', borderRadius: '50%' }} />
                <motion.div 
                  animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ 
                    position: 'absolute', top: 0, left: 0, width: '4px', height: '4px', 
                    background: '#6366f1', borderRadius: '50%' 
                  }} 
                />
              </div>
            </div>
            
            <div style={{ 
              position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, 
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: 'white', 
              padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600,
              pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              Move map to align your store with the center pin
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
