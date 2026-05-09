import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneRounded';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsRounded';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
      borderBottom: '1px solid rgba(255, 107, 107, 0.15)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Brand */}
        <Link to="/admin" style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        textDecoration: 'none', color: 'inherit'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
        }}>
          <AdminPanelSettingsIcon sx={{ fontSize: '20px', color: '#fff' }} />
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: '17px', color: '#fff', letterSpacing: '-0.3px' }}>
            FlashFit
          </span>
          <span style={{
            marginLeft: '8px',
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
            padding: '2px 8px', borderRadius: '4px',
            fontSize: '10px', fontWeight: 700, color: '#fff',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            Admin
          </span>
        </div>
      </Link>
    </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Notifications */}
        <Link to="/admin/notifications" style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--text-primary)', textDecoration: 'none',
          position: 'relative'
        }}>
          <NotificationsNoneIcon />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#FF6B6B', border: '2px solid var(--bg-card)' }} />
        </Link>

        {/* Profile */}
        <div>
          <button
            onClick={() => navigate('/admin/profile')}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid rgba(255, 107, 107, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', overflow: 'hidden'
            }}
          >
            <span style={{ fontWeight: 800, color: '#FF6B6B' }}>{user?.name?.[0]?.toUpperCase() || 'A'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
