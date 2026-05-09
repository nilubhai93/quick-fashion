import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import PlaceIcon from '@mui/icons-material/PlaceRounded';
import ExploreIcon from '@mui/icons-material/ExploreRounded';

export default function Map({ onAddressSelect }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);   // { lat, lng }
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const ref = useRef(null);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });

        // Reverse geocode using OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setAddress(addr);
          if (onAddressSelect) onAddressSelect(addr);
        } catch {
          const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setAddress(fallback);
          if (onAddressSelect) onAddressSelect(fallback);
        }

        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enable it in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('The request to get location timed out.');
            break;
          default:
            setError('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleOpenAndLocate = () => {
    setOpen(true);
    if (!location) {
      getCurrentLocation();
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {/* Map Trigger Button */}
      <button
        id="map-locate-btn"
        onClick={handleOpenAndLocate}
        title="Use current location"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: open ? 'var(--accent-light)' : 'var(--text-secondary)',
          background: open
            ? 'var(--accent-bg)'
            : 'var(--bg-glass)',
          border: open
            ? '1px solid rgba(168,85,247,0.3)'
            : '1px solid var(--border)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <MyLocationIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
      </button>

      {/* Map Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="map-popup"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '380px',
              maxWidth: 'calc(100vw - 32px)',
              zIndex: 1002,
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(18, 18, 28, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px 12px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ExploreIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)', color: '#fff' }} />
                </div>
                <span style={{
                  fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 700, color: 'var(--text-primary)',
                  letterSpacing: '-0.3px',
                }}>
                  Your Location
                </span>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <CloseIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
              </button>
            </div>

            {/* Map Body */}
            <div style={{ padding: '12px' }}>
              {/* Map Embed */}
              <div style={{
                width: '100%',
                height: '200px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                position: 'relative',
              }}>
                {loading && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-card)', zIndex: 2,
                    gap: '12px',
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '36px', height: '36px',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--accent-light)',
                        borderRadius: '50%',
                      }}
                    />
                    <span style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--text-muted)' }}>
                      Detecting location…
                    </span>
                  </div>
                )}

                {error && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-card)', zIndex: 2,
                    padding: '20px', textAlign: 'center', gap: '12px',
                  }}>
                    <PlaceIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--error)', opacity: 0.6 }} />
                    <span style={{ fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--error)', fontWeight: 500 }}>
                      {error}
                    </span>
                    <button
                      onClick={getCurrentLocation}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--radius-full)',
                        background: 'var(--accent-bg)', color: 'var(--accent-light)',
                        border: '1px solid rgba(168,85,247,0.2)',
                        fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {location && !loading && (
                  <iframe
                    title="User Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(1.1) contrast(1.1)' }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.005},${location.lat - 0.005},${location.lng + 0.005},${location.lat + 0.005}&layer=mapnik&marker=${location.lat},${location.lng}`}
                    loading="lazy"
                  />
                )}

                {!location && !loading && !error && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '10px',
                  }}>
                    <PlaceIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--text-muted)', opacity: 0.4 }} />
                    <span style={{ fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--text-muted)' }}>
                      Click to detect your location
                    </span>
                  </div>
                )}
              </div>

              {/* Address info */}
              {address && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '12px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}
                >
                  <PlaceIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{
                      fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, textTransform: 'uppercase',
                      color: 'var(--success)', letterSpacing: '0.5px', marginBottom: '4px',
                    }}>
                      Current Location
                    </div>
                    <div style={{
                      fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--text-primary)',
                      lineHeight: 1.5, fontWeight: 500,
                    }}>
                      {address}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Use This Address button */}
              {address && (
                <button
                  onClick={() => {
                    if (onAddressSelect) onAddressSelect(address);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%', marginTop: '12px',
                    padding: '11px', borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-primary)', color: 'white',
                    fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, cursor: 'pointer',
                    border: 'none', letterSpacing: '0.3px',
                    boxShadow: '0 4px 15px var(--accent-glow)',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Use This Address
                </button>
              )}

              {/* Refresh location */}
              {location && !loading && (
                <button
                  onClick={getCurrentLocation}
                  style={{
                    width: '100%', marginTop: '8px',
                    padding: '10px', borderRadius: 'var(--radius-md)',
                    background: 'transparent', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <MyLocationIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
                  Refresh Location
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
