import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import InventoryIcon from '@mui/icons-material/InventoryRounded';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import AccountCircleIcon from '@mui/icons-material/AccountCircleRounded';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import MenuIcon from '@mui/icons-material/MenuRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { useAuth } from '../context/AuthContext';

export default function SellerLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false); // Close menu on route change
  }, [location.pathname]);

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      navigate(user ? '/shop' : '/login');
    }
  }, [user, loading, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/seller', icon: <DashboardIcon /> },
    { name: 'My Products', path: '/seller/products', icon: <InventoryIcon /> },
    { name: 'Orders', path: '/seller/orders', icon: <LocalShippingIcon /> },
    { name: 'Wallet', path: '/seller/wallet', icon: <WalletIcon /> },
    { name: 'Add Product', path: '/seller/add-product', icon: <AddCircleOutlineIcon /> },
    { name: 'Profile', path: '/seller/profile', icon: <PersonIcon /> },
    { name: 'Settings', path: '/seller/settings', icon: <SettingsIcon /> },
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
      {/* Seller Top Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, height: '64px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 24px',
        zIndex: 2000,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
          {isMobile && (
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {showMobileMenu ? <CloseIcon /> : <MenuIcon />}
            </button>
          )}
          <Link to="/shop" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <ArrowBackIcon />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ background: 'var(--gradient-primary)', width: '28px', height: '28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>F</div>
            {!isMobile && <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>FlashFit</span>}
          </div>
        </div>
        <div>
          <Link to="/seller/profile" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <AccountCircleIcon sx={{ fontSize: 28 }} />
            {!isMobile && <span style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name || 'Profile'}</span>}
          </Link>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', paddingTop: '64px' }}>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(showMobileMenu || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -280 } : { x: 0 }}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -280 } : {}}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
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
              zIndex: 1999,
              boxShadow: isMobile ? '20px 0 50px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
              <h2 style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 800 }}>
                Seller Central
              </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/seller'}
                  style={({ isActive }) => {
                    const isProductForm = (item.path === '/seller/add-product' && location.pathname.includes('/seller/edit-product'));
                    const active = isActive || isProductForm;
                    return {
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                      color: active ? 'white' : 'var(--text-secondary)',
                      background: active ? 'var(--accent)' : 'transparent',
                      transition: 'all 0.2s'
                    };
                  }}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'transparent',
                  border: 'none', color: 'var(--error)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogoutIcon />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      {isMobile && showMobileMenu && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMobileMenu(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)', zIndex: 1998, marginTop: '64px' }}
        />
      )}

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? '0' : '260px',
        padding: isMobile ? '20px 16px' : '30px 40px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '1400px',
        overflowX: 'hidden'
      }}>
        <Outlet />
      </main>

    </div>
    </>
  );
}
