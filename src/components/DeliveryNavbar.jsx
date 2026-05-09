import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsRounded';
import { deliveryAPI } from '../api';

export default function DeliveryNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    // Load initial online status from profile on mount
    const fetchProfile = async () => {
      try {
        const res = await deliveryAPI.getProfile();
        setIsOnline(res.data.user?.deliveryProfile?.isOnline || false);
      } catch (e) {
        console.error('Failed to load profile status');
      }
    };
    if (user?.role === 'delivery') fetchProfile();
  }, [user]);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;

    if (newStatus) {
      // Request location permission when going online
      if (navigator.geolocation) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
          });
        } catch (err) {
          console.error('Location permission denied or failed', err);
          alert('Location permission is required to go online for deliveries.');
          return;
        }
      } else {
        alert('Geolocation is not supported by your browser.');
        return;
      }
    } else {
      // Check for active orders when attempting to go offline
      try {
        const res = await deliveryAPI.getCurrentOrders();
        const activeOrders = res.data.orders.filter(o => 
          o.delivery?.status === 'accepted' || o.delivery?.status === 'assigned'
        );
        
        if (activeOrders.length > 0) {
          alert('First complete your assigned orders.');
          return; // Stop if there are active orders
        }
      } catch (err) {
        console.error('Failed to check active orders', err);
      }
    }

    setIsOnline(newStatus); // optimistic update
    try {
      await deliveryAPI.updateStatus(newStatus);
    } catch (e) {
      console.error('Failed to update status on server');
      setIsOnline(!newStatus); // Revert on failure
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(12, 12, 18, 0.95)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(41, 255, 198, 0.1)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Brand / Online Toggle */}
        <div 
          onClick={handleToggleOnline}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '20px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Slider Track */}
          <div style={{
            width: '44px',
            height: '22px',
            backgroundColor: isOnline ? 'rgba(41, 255, 198, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '3px',
            position: 'relative',
            border: `1px solid ${isOnline ? 'rgba(41, 255, 198, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Slider Thumb */}
            <motion.div
              animate={{ x: isOnline ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: isOnline ? '#29ffc6' : '#ef4444',
                borderRadius: '50%',
                boxShadow: isOnline ? '0 0 8px rgba(41, 255, 198, 0.5)' : '0 0 8px rgba(239, 68, 68, 0.5)',
                zIndex: 2
              }}
            />
          </div>
          <motion.span
            initial={false}
            animate={{ color: isOnline ? '#29ffc6' : '#ef4444' }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: '13px', fontWeight: 700 }}>
            {isOnline ? 'Online' : 'Offline'}
          </motion.span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Notifications */}
        <Link to="/delivery/notifications" style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-primary)', textDecoration: 'none',
          position: 'relative'
        }}>
          <NotificationsNoneIcon />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', border: '2px solid var(--bg-card)' }} />
        </Link>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid rgba(41, 255, 198, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden'
            }}
          >
            <span style={{ fontWeight: 800, color: '#29ffc6' }}>{user?.name?.[0]?.toUpperCase() || 'D'}</span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                  width: '260px', borderRadius: '16px',
                  background: 'rgba(18, 18, 28, 0.98)',
                  backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                  overflow: 'hidden', zIndex: 1001
                }}
              >
                <button
                  onClick={() => setProfileOpen(false)}
                  style={{
                    position: 'absolute', top: '12px', right: '12px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', cursor: 'pointer', zIndex: 2
                  }}
                >
                  <CloseIcon sx={{ fontSize: '18px' }} />
                </button>

                <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0cebeb 0%, #29ffc6 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 800, color: '#000', flexShrink: 0
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'D'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Rider'}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                </div>

                <div style={{ padding: '8px' }}>
                  <Link to="/delivery/profile" onClick={() => setProfileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    <AccountCircleOutlinedIcon sx={{ fontSize: '22px', color: '#29ffc6' }} /> My Profile
                  </Link>
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button onClick={() => { logout(); setProfileOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '8px', color: 'var(--error)', fontSize: '14px', fontWeight: 500, width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <LogoutIcon sx={{ fontSize: '22px' }} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
