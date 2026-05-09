import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../../api';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';

export default function Sell() {
  const [deals, setDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dealRes, allRes] = await Promise.all([
          productAPI.getDeals(),
          productAPI.getAll({ limit: 50, sort: '-createdAt' })
        ]);
        setDeals(dealRes.data.products || []);
        const products = allRes.data.products || [];
        // Filter products that have a discount
        const discounted = products.filter(p => p.discountPrice && p.discountPrice < p.price);
        setAllProducts(discounted);
      } catch (e) {
        console.error('Failed to load deals:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allDeals = [...deals];
  const dealIds = new Set(deals.map(d => d._id));
  allProducts.forEach(p => {
    if (!dealIds.has(p._id)) allDeals.push(p);
  });

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)', marginTop: '10px',
      background: 'radial-gradient(ellipse at 20% 10%, rgba(58,107,197,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(201,169,110,0.05) 0%, transparent 50%)',
    }}>
      {/* Hero */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px 20px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '50px',
            background: 'linear-gradient(135deg, rgba(58,107,197,0.12), rgba(201,169,110,0.08))',
            border: '1px solid rgba(58,107,197,0.2)',
            marginBottom: '16px',
          }}>
            <LocalOfferRoundedIcon sx={{ fontSize: 18, color: '#4a7fd4' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6b9ae8', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Exclusive Deals
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800,
            fontFamily: 'var(--font-display)', lineHeight: 1.1, marginBottom: '12px',
          }}>
            Discount{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3a6bc5, #c9a96e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Offers</span>
          </h1>

          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)',
            maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.6,
          }}>
            Grab unbeatable deals on premium fashion. Limited time offers you don't want to miss!
          </p>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{
          maxWidth: '800px', margin: '0 auto 24px', padding: '0 24px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
        }}
      >
        {[
          { value: `${allDeals.length}+`, label: 'Active Deals', icon: <BoltRoundedIcon sx={{ fontSize: 20, color: '#f59e0b' }} /> },
          { value: 'Up to 70%', label: 'Max Discount', icon: <PercentRoundedIcon sx={{ fontSize: 20, color: '#22c55e' }} /> },
          { value: '⚡ Flash', label: 'New Drops', icon: <StarRoundedIcon sx={{ fontSize: 20, color: '#ec4899' }} /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            style={{
              padding: '14px 12px', borderRadius: '12px',
              background: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2px' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Deals Grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : allDeals.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {allDeals.map((product, i) => {
              const discountPercent = product.discountPrice && product.discountPrice < product.price
                ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

              return (
                <motion.div key={product._id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(58,107,197,0.15)' }}
                  style={{
                    borderRadius: '16px', overflow: 'hidden',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                      <img src={product.images?.[0] || 'https://placehold.co/300x400'} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'}
                      />
                      {discountPercent > 0 && (
                        <div style={{
                          position: 'absolute', top: '12px', left: '12px',
                          padding: '6px 14px', borderRadius: '50px',
                          background: 'linear-gradient(135deg, #ef4444, #f97316)',
                          color: 'white', fontSize: '13px', fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                        }}>
                          -{discountPercent}% OFF
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '15px', fontWeight: 700, marginBottom: '6px',
                        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{product.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{product.description}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>
                          ₹{(product.discountPrice || product.price).toLocaleString()}
                        </span>
                        {discountPercent > 0 && (
                          <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No deals available right now</h3>
            <p>Check back soon — new deals drop daily!</p>
            <Link to="/products" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px',
              padding: '12px 24px', borderRadius: '50px',
              background: 'linear-gradient(135deg, #3a6bc5, #c9a96e)',
              color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}>
              Browse All Products <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
