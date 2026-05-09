import { motion } from 'framer-motion';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import BarChartIcon from '@mui/icons-material/BarChartRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import CampaignIcon from '@mui/icons-material/CampaignRounded';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Only allow admin
    if (user && user.role !== 'admin') {
      navigate('/shop');
    }
  }, [user, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { name: 'Seller Approvals', path: '/admin/sellers', icon: <StorefrontIcon /> },
    { name: 'Users', path: '/admin/users', icon: <PeopleIcon /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon /> },
    { name: 'Products', path: '/admin/products', icon: <CategoryIcon /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChartIcon /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <CampaignIcon /> },
    { name: 'Support', path: '/admin/support', icon: <SupportAgentIcon /> },
    { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const accentColor = '#FF6B6B';
  const accentGradient = 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)';

  return (
    <>
      <AdminNavbar />
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
              <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)', textTransform: 'uppercase', letterSpacing: '1px', color: accentColor, fontWeight: 700 }}>
                Admin Panel
              </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/admin'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '11px 16px', borderRadius: 'var(--radius-md)',
                    textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    background: isActive ? accentGradient : 'transparent',
                    transition: 'all 0.2s ease'
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.style.background.includes('linear-gradient')) {
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
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'transparent',
                  border: 'none', color: 'var(--error)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
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

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '8px 4px',
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
            zIndex: 50
          }}>
            {[
              { name: 'Home', path: '/admin', icon: <DashboardIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Sellers', path: '/admin/sellers', icon: <StorefrontIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Users', path: '/admin/users', icon: <PeopleIcon sx={{ fontSize: '24px' }} /> },
              { name: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon sx={{ fontSize: '24px' }} /> },
              { name: 'More', path: '/admin/settings', icon: <SettingsIcon sx={{ fontSize: '24px' }} /> },
            ].map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  textDecoration: 'none',
                  color: isActive ? accentColor : 'var(--text-secondary)',
                  fontSize: '11px', fontWeight: 600,
                  flex: 1
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        )}

      </div>
    </>
  );
}
