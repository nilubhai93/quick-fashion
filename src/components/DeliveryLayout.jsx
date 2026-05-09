import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import HistoryIcon from '@mui/icons-material/HistoryRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import DeliveryNavbar from './DeliveryNavbar';
import { deliveryAPI } from '../api';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeedRounded';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';

export default function DeliveryLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [assignedOrder, setAssignedOrder] = useState(null);

  useEffect(() => {
    if (loading) return;
    // Only allow delivery or admin
    if (!user || (user.role !== 'delivery' && user.role !== 'admin')) {
      navigate(user ? '/shop' : '/login');
      return;
    }

    // Auto-fetch unassigned/assigned logic
    let failCount = 0;
    const fetchAssigned = async () => {
      try {
        const res = await deliveryAPI.getCurrentOrders();
        // Look for any order currently specifically in 'assigned' state to us
        const pending = res.data.orders.find(o => o.delivery?.status === 'assigned');
        setAssignedOrder(pending || null);
        failCount = 0; // reset on success
      } catch (e) {
        failCount++;
        if (failCount <= 3) console.error('Failed to poll assigned orders', e);
      }
    };

    fetchAssigned();
    const interval = setInterval(fetchAssigned, 15000); // 15 sec interval
    return () => clearInterval(interval);
  }, [user, loading, navigate]);

  // Track driver location for distance calculation
  const [driverPos, setDriverPos] = useState(null);
  useEffect(() => {
    if (!user || user.role !== 'delivery') return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err)
    );
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  const pickupDist = (driverPos && assignedOrder?.sellerHubLocation?.lat) 
    ? getDistanceKm(driverPos.lat, driverPos.lng, assignedOrder.sellerHubLocation.lat, assignedOrder.sellerHubLocation.lng)
    : null;

  const navItems = [
    { name: 'Dashboard', path: '/delivery', icon: <DashboardIcon /> },
    { name: 'My Orders', path: '/delivery/orders', icon: <DirectionsBikeIcon /> },
    { name: 'History', path: '/delivery/history', icon: <HistoryIcon /> },
    { name: 'Earnings', path: '/delivery/earnings', icon: <AccountBalanceWalletIcon /> },
    { name: 'Profile', path: '/delivery/profile', icon: <PersonIcon /> },
    { name: 'Notifications', path: '/delivery/notifications', icon: <NotificationsIcon /> },
    { name: 'Support', path: '/delivery/support', icon: <SupportAgentIcon /> },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <>
      <DeliveryNavbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: 'var(--bg-secondary)', paddingTop: '64px' }}>

        {/* Sidebar Navigation */}
        {!isMobile && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            style={{
              width: '260px',
              background: 'var(--bg-card)',
              borderRight: '1px solid var(--border)',
              padding: '30px 20px',
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              top: '64px',
              bottom: 0,
              left: 0,
              zIndex: 10
            }}
          >
            <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-light)', fontWeight: 700 }}>
                Delivery Hub
              </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/delivery'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600,
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? 'var(--gradient-primary)' : 'transparent',
                    transition: 'all var(--transition-fast)'
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.style.background.includes('var(--gradient-primary)')) {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.className.includes('active')) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: 'auto' }}>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'transparent',
                  border: 'none', color: 'var(--error)', fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogoutIcon />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? '0px' : '260px',
          padding: isMobile ? '16px' : '32px 40px',
          paddingBottom: isMobile ? '80px' : '32px',
          maxWidth: '1200px'
        }}>
          <Outlet />
        </main>

        {/* Mobile Footer Navigation - Stabilized */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: '72px',
            background: 'rgba(18, 18, 28, 0.95)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 1000,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
          }}>
            {[
              { name: 'Feed', path: '/delivery', icon: <DynamicFeedIcon /> },
              { name: 'Earnings', path: '/delivery/earnings', icon: <AccountBalanceWalletIcon /> },
              { name: 'Slot', path: '/delivery/profile', icon: <ScheduleIcon /> },
              { name: 'Offers', path: '/delivery/offers', icon: <LocalOfferIcon /> },
              { name: 'Market', path: '/delivery/market', icon: <StorefrontIcon /> },
            ].map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/delivery'}
                style={({ isActive }) => ({
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textDecoration: 'none',
                  color: isActive ? '#29ffc6' : 'rgba(255,255,255,0.4)',
                  fontSize: '10px', fontWeight: 700,
                  flex: 1, height: '100%', gap: '4px',
                  position: 'relative',
                  transition: 'color 0.3s'
                })}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        style={{ position: 'absolute', top: 0, width: '40px', height: '3px', background: '#29ffc6', borderRadius: '0 0 4px 4px' }} 
                      />
                    )}
                    <div style={{ fontSize: '24px', display: 'flex' }}>{item.icon}</div>
                    <span style={{ fontSize: '10px' }}>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}

      </div>

      {/* Auto-Assignment Popup Modal */}
      <AnimatePresence>
        {assignedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }}
              style={{
                background: 'var(--bg-card)', padding: '40px 32px', borderRadius: 'var(--radius-xl)',
                maxWidth: '420px', width: '90%', border: '1px solid var(--accent)',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(41,255,198,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <DirectionsBikeIcon sx={{ fontSize: '40px', color: 'var(--accent)' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>
                {assignedOrder.status === 'return-requested' ? 'New Return Assigned!' : 'New Order Assigned!'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                Order <strong>#{assignedOrder._id.slice(-6).toUpperCase()}</strong> — {assignedOrder.items?.length || 0} items
              </p>

              {/* Multi-Distance & Earnings Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                <div style={{ padding: '12px 4px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Pickup</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#6366f1' }}>
                    {pickupDist !== null ? `${pickupDist} km` : '--'}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>To {assignedOrder.status === 'return-requested' ? 'User' : 'Store'}</div>
                </div>
                
                <div style={{ padding: '12px 4px', borderRadius: '12px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Drop</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f97316' }}>
                    {assignedOrder.deliveryDistanceKm ? `${assignedOrder.deliveryDistanceKm} km` : '--'}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>To {assignedOrder.status === 'return-requested' ? 'Hub' : 'User'}</div>
                </div>

                <div style={{ padding: '12px 4px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Earnings</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>
                    ₹{assignedOrder.deliveryEarnings || 0}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>Profit</div>
                </div>
              </div>

              {/* Payment Badge */}
              <div style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)', marginBottom: '24px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: assignedOrder.paymentMethod === 'cod' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${assignedOrder.paymentMethod === 'cod' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                color: assignedOrder.paymentMethod === 'cod' ? '#f59e0b' : '#10b981',
                fontSize: '13px', fontWeight: 700
              }}>
                {assignedOrder.status === 'return-requested' ? '🔄 Product Return' : (assignedOrder.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '✅ Prepaid')}
                {' · '}₹{Math.round(assignedOrder.totalAmount).toLocaleString()}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                <button
                  onClick={async () => {
                    await deliveryAPI.acceptOrder(assignedOrder._id);
                    setAssignedOrder(null);
                    navigate('/delivery/orders');
                  }}
                  style={{ padding: '16px', background: 'var(--gradient-primary)', color: 'white', borderRadius: 'var(--radius-full)', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '16px' }}
                >
                  {assignedOrder.status === 'return-requested' ? 'Accept Return' : 'Accept Delivery'}
                </button>
                <button
                  onClick={async () => {
                    await deliveryAPI.rejectOrder(assignedOrder._id);
                    setAssignedOrder(null);
                  }}
                  style={{ padding: '16px', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 'var(--radius-full)', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }}
                >
                  Reject & Reassign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
