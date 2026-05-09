import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const STORAGE_KEY = 'flashfit_browsing_history';

// Utility to get history from localStorage
const getHistory = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Utility to add a product to history
export const addToHistory = (product) => {
  if (!product || !product._id) return;
  try {
    let history = getHistory();
    // Remove duplicate
    history = history.filter(h => h._id !== product._id);
    // Add to front
    history.unshift({
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images?.slice(0, 1) || [],
      category: product.category,
      brand: product.brand,
      rating: product.rating,
      viewedAt: new Date().toISOString(),
    });
    // Keep only latest 50
    history = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save browsing history:', e);
  }
};

export default function BrowsingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  const removeItem = (id) => {
    const updated = history.filter(h => h._id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  const categories = [...new Set(history.map(h => h.category).filter(Boolean))];
  const filteredHistory = filter === 'all'
    ? history
    : history.filter(h => h.category === filter);

  const userName = user?.name?.split(' ')[0] || 'You';

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', marginTop: '10px',
      background: 'radial-gradient(ellipse at 30% 10%, rgba(58,107,197,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(201,169,110,0.04) 0%, transparent 50%)',
    }}>
      {/* Hero */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px 20px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '50px',
            background: 'linear-gradient(135deg, rgba(58,107,197,0.12), rgba(201,169,110,0.08))',
            border: '1px solid rgba(58,107,197,0.2)', marginBottom: '16px',
          }}>
            <HistoryRoundedIcon sx={{ fontSize: 18, color: '#4a7fd4' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6b9ae8', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Your History
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800,
            fontFamily: 'var(--font-display)', lineHeight: 1.1, marginBottom: '12px',
          }}>
            Browsing{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3a6bc5, #c9a96e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>History</span>
          </h1>

          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)',
            maxWidth: '600px', margin: '0 auto 10px', lineHeight: 1.6,
          }}>
            {userName}, here are all the products you've been eyeing. Pick up where you left off!
          </p>
        </motion.div>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
              <VisibilityRoundedIcon sx={{ fontSize: 16, verticalAlign: 'middle', marginRight: '4px' }} />
              {history.length} viewed
            </span>
            <button onClick={() => setFilter('all')} style={{
              padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600,
              background: filter === 'all' ? 'linear-gradient(135deg, rgba(58,107,197,0.15), rgba(201,169,110,0.1))' : 'var(--bg-card)',
              color: filter === 'all' ? '#6b9ae8' : 'var(--text-muted)',
              border: `1px solid ${filter === 'all' ? 'rgba(58,107,197,0.3)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}>All</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600,
                textTransform: 'capitalize',
                background: filter === cat ? 'linear-gradient(135deg, rgba(58,107,197,0.15), rgba(201,169,110,0.1))' : 'var(--bg-card)',
                color: filter === cat ? '#6b9ae8' : 'var(--text-muted)',
                border: `1px solid ${filter === cat ? 'rgba(58,107,197,0.3)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}>{cat}</button>
            ))}
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} style={{
              padding: '8px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: 600,
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* History Grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        {filteredHistory.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            <AnimatePresence>
              {filteredHistory.map((item, i) => {
                const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                return (
                  <motion.div key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(58,107,197,0.12)' }}
                    style={{
                      borderRadius: '16px', overflow: 'hidden',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      position: 'relative', transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Remove button */}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeItem(item._id); }}
                      style={{
                        position: 'absolute', top: '10px', right: '10px', zIndex: 5,
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                        border: 'none', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    </button>

                    <Link to={`/products/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ aspectRatio: '3/4', overflow: 'hidden', position: 'relative' }}>
                        <img src={item.images?.[0] || 'https://placehold.co/300x400'} alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                          onMouseOut={e => e.target.style.transform = 'scale(1)'}
                        />
                        {/* Time badge */}
                        <div style={{
                          position: 'absolute', bottom: '10px', left: '10px',
                          padding: '4px 10px', borderRadius: '50px',
                          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                          color: 'white', fontSize: '11px', fontWeight: 600,
                        }}>
                          {formatDate(item.viewedAt)}
                        </div>
                      </div>
                      <div style={{ padding: '14px' }}>
                        {item.brand && (
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                            {item.brand}
                          </p>
                        )}
                        <h3 style={{
                          fontSize: '14px', fontWeight: 700, marginBottom: '6px',
                          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{item.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>
                              ₹{(item.discountPrice || item.price || 0).toLocaleString()}
                            </span>
                            {hasDiscount && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                ₹{item.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {item.rating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <StarRoundedIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👀</div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              No browsing history yet
            </h3>
            <p style={{ marginBottom: '24px' }}>Start exploring products to build your history!</p>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '50px',
              background: 'linear-gradient(135deg, #3a6bc5, #c9a96e)',
              color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}>
              Explore Products <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
