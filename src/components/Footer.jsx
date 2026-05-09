import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import HomeOutlinedIcon from '@mui/icons-material/HomeRounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import ReplayIcon from '@mui/icons-material/ReplayRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondRounded';
import DiamondIcon from '@mui/icons-material/DiamondRounded';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      path: '/shop',
      icon: HomeOutlinedIcon,
      activeIcon: HomeIcon,
      match: (p) => p === '/shop'
    },
    {
      id: 'buyagain',
      label: 'Buy Again',
      path: '/orders',
      icon: ReplayIcon,
      activeIcon: ReplayIcon,
      match: (p) => p === '/orders'
    },
    {
      id: 'bucket',
      label: 'Bucket',
      path: '/cart',
      icon: ShoppingBagOutlinedIcon,
      activeIcon: ShoppingBagIcon,
      badge: itemCount,
      match: (p) => p === '/cart'
    },
    {
      id: 'categories',
      label: 'Categories',
      path: '/products',
      icon: CategoryOutlinedIcon,
      activeIcon: CategoryIcon,
      match: (p) => p === '/products' || p.startsWith('/products?')
    },
    {
      id: 'rent',
      label: 'Rent',
      path: '/rent',
      icon: DiamondOutlinedIcon,
      activeIcon: DiamondIcon,
      upcoming: true,
      match: (p) => p === '/rent'
    }
  ];

  const isActive = (tab) => tab.match(location.pathname);

  if (location.pathname === '/' || location.pathname.startsWith('/delivery') || location.pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed footer */}
      <div id="bottom-nav-spacer" style={{ height: '80px' }} />

      <motion.nav
        id="bottom-nav"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          background: '#0a0a0a',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '0 4px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '560px',
          margin: '0 auto',
          height: '64px',
        }}>
          {tabs.map((tab) => {
            const active = isActive(tab);
            const IconComp = active ? tab.activeIcon : tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  padding: '8px 0',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  minWidth: '64px',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Icon wrapper */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp
                    sx={{
                      fontSize: '24px',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.6)',
                    }}
                  />

                  {/* Cart badge */}
                  {tab.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-8px',
                        minWidth: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#ff5722',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 2px',
                        border: '2px solid #0a0a0a'
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}

                  {/* Upcoming "NEW" badge */}
                  {tab.upcoming && (
                    <span style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '-20px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#ff5722',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      NEW
                    </span>
                  )}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: '10px',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  marginTop: '2px',
                  letterSpacing: '0.3px',
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.nav>

      {/* Desktop Footer */}
      <div id="desktop-footer" style={{ background: '#232f3e', color: 'white', marginTop: '40px', fontFamily: 'Arial, sans-serif' }}>
        {/* Back to top */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ background: '#37475a', padding: '15px 0', textAlign: 'center', cursor: 'pointer', fontSize: '13px' }}
        >
          Back to top
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px', borderBottom: '1px solid #3a4553' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '60px', maxWidth: '1000px', width: '100%' }}>
            {/* Column 1 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>Get to Know Us</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="#" className="footer-link">About FlashFit</Link></li>
                <li><Link to="#" className="footer-link">Careers</Link></li>
                <li><Link to="#" className="footer-link">Press Releases</Link></li>
                <li><Link to="#" className="footer-link">FlashFit Science</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>Connect with Us</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="#" className="footer-link">Facebook</Link></li>
                <li><Link to="#" className="footer-link">Twitter</Link></li>
                <li><Link to="#" className="footer-link">Instagram</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>Make Money with Us</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/become-seller" className="footer-link">Sell on FlashFit</Link></li>
                <li><Link to="#" className="footer-link">Protect and Build Your Brand</Link></li>
                <li><Link to="#" className="footer-link">FlashFit Global Selling</Link></li>
                <li><Link to="#" className="footer-link">Supply to FlashFit</Link></li>
                <li><Link to="#" className="footer-link">Become an Affiliate</Link></li>
                <li><Link to="#" className="footer-link">Fulfilment by FlashFit</Link></li>
                <li><Link to="#" className="footer-link">Advertise Your Products</Link></li>
                <li><Link to="#" className="footer-link">FlashFit Pay on Merchants</Link></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', color: 'white' }}>Let Us Help You</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/profile" className="footer-link">Your Account</Link></li>
                <li><Link to="#" className="footer-link">Returns Centre</Link></li>
                <li><Link to="#" className="footer-link">Recalls and Product Safety Alerts</Link></li>
                <li><Link to="#" className="footer-link">100% Purchase Protection</Link></li>
                <li><Link to="#" className="footer-link">FlashFit App Download</Link></li>
                <li><Link to="#" className="footer-link">Help</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '30px 20px' }}>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            <div style={{ background: 'var(--gradient-primary)', width: '28px', height: '28px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>F</div>
            <span style={{ fontWeight: 700, fontSize: '20px', color: 'white' }}>FlashFit</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ border: '1px solid #848688', padding: '6px 10px', borderRadius: '3px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <span style={{ fontSize: '16px' }}>🌐</span> English <span style={{ fontSize: '10px' }}>▼</span>
            </div>
            <div style={{ border: '1px solid #848688', padding: '6px 10px', borderRadius: '3px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="India Flag" style={{ width: '16px' }} /> India
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          #bottom-nav, #bottom-nav-spacer {
            display: none !important;
          }
          #desktop-footer {
            display: block !important;
          }
          .footer-link {
            color: #ddd;
            text-decoration: none;
            transition: color 0.2s;
          }
          .footer-link:hover {
            text-decoration: underline;
            color: white;
          }
        }
        @media (max-width: 767px) {
          #desktop-footer {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
