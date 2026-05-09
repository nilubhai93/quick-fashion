import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/AddRounded';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import AutorenewIcon from '@mui/icons-material/AutorenewRounded';
import InventoryIcon from '@mui/icons-material/Inventory2Rounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIosRounded';
import { productAPI } from '../../api';

const ProductCarousel = ({ title, products }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      if (direction === 'left') {
        current.scrollBy({ left: -300, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827', fontFamily: 'var(--font-sans)' }}>{title}</h3>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => scroll('left')} style={{ position: 'absolute', left: '-15px', zIndex: 10, background: 'white', border: '1px solid #d1d5db', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <ArrowBackIosNewIcon sx={{ fontSize: '18px', color: '#4b5563' }} />
        </button>
        <div ref={scrollRef} style={{ display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '10px 0', scrollSnapType: 'x mandatory' }}>
          {products.map((p, i) => (
            <Link key={`${p._id}-${i}`} to={`/products/${p._id}`} style={{ textDecoration: 'none', minWidth: '180px', maxWidth: '180px', scrollSnapAlign: 'start', flexShrink: 0 }}>
              <div style={{ background: '#f9fafb', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eaeaea', height: '220px', position: 'relative' }}>
                <img src={p.images?.[0] || 'https://placehold.co/180x220/1a1a25/9a9ab0?text=Img'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.brand}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>{p.name}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#b45309' }}>₹{p.discountPrice || p.price}</div>
              </div>
            </Link>
          ))}
        </div>
        <button onClick={() => scroll('right')} style={{ position: 'absolute', right: '-15px', zIndex: 10, background: 'white', border: '1px solid #d1d5db', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <ArrowForwardIosIcon sx={{ fontSize: '18px', color: '#4b5563' }} />
        </button>
      </div>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default function CartPage() {
  const { items, subtotal, bundleSuggestion, updateItem, removeItem, clearCart, acceptBundle } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [acceptingBundle, setAcceptingBundle] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    productAPI.getAll({ limit: 15 }).then(res => {
      setRecommendations(res.data.products || []);
    }).catch(console.error);
  }, []);

  const multipliedRecs = [...recommendations, ...recommendations, ...recommendations, ...recommendations];
  const row1 = multipliedRecs.slice(0, 10);
  const row2 = multipliedRecs.slice(2, 12);
  const row3 = multipliedRecs.slice(4, 14);

  const handleAcceptBundle = async () => {
    setAcceptingBundle(true);
    try { await acceptBundle(); } catch (e) { console.error(e); }
    finally { setAcceptingBundle(false); }
  };

  const deliveryFee = subtotal > 999 ? 0 : 49;
  const bundleDiscount = bundleSuggestion?.isActive ? (subtotal * (bundleSuggestion.discount || 15)) / 100 : 0;
  const total = subtotal - bundleDiscount + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: 'clamp(40px, 10vw, 64px)', marginBottom: '20px' }}>🛍️</div>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Your bag is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: 'clamp(13px, 2.8vw, 16px)' }}>Looks like you haven't added anything yet. Let our AI stylist help!</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: 'var(--radius-full)' }}>
              <ShoppingBagOutlinedIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} /> Start Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '10px 24px 60px', marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Your Bag <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 400 }}>({items.length} items)</span></h1>
        <button onClick={clearCart} style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DeleteOutlineIcon sx={{ fontSize: '18px' }} /> Clear All
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item._id} layout exit={{ opacity: 0, x: -100 }}
                style={{ display: 'flex', gap: '20px', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Link to={`/products/${item.product?._id}`}>
                  <img src={item.product?.images?.[0] || 'https://placehold.co/100x120/1a1a25/9a9ab0?text=Img'} alt={item.product?.name}
                    style={{ width: '100px', height: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                </Link>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'clamp(10px, 2.2vw, 12px)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.product?.brand}</div>
                  <Link to={`/products/${item.product?._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', marginBottom: '6px' }}>{item.product?.name}</h3>
                  </Link>
                  <div style={{ display: 'flex', gap: '12px', fontSize: 'clamp(12px, 2.5vw, 14px)', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>Size: <strong style={{ color: 'var(--text-primary)' }}>{item.size}</strong></span>
                    {item.color && <span>Color: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{item.color}</strong></span>}
                    {item.isRental && (
                      <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--info)', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700 }}>
                        Rent · {item.rentalDays}d
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => updateItem(item._id, item.quantity - 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RemoveIcon sx={{ fontSize: 'clamp(16px, 3vw, 20px)' }} />
                      </button>
                      <span style={{ fontWeight: 700, fontSize: 'clamp(14px, 3vw, 18px)', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AddIcon sx={{ fontSize: 'clamp(16px, 3vw, 20px)' }} />
                      </button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.isRental && item.rentalDays > 0 ? (
                        <>
                          <div style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700, color: 'var(--info)' }}>
                            ₹{((item.product?.rentPricePerDay || 0) * item.rentalDays * item.quantity).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: 'var(--text-muted)' }}>
                            {item.quantity} × {item.rentalDays}d × ₹{item.product?.rentPricePerDay}/day
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700 }} className="gradient-text">₹{((item.product?.discountPrice || item.product?.price || 0) * item.quantity).toLocaleString()}</div>
                          {item.product?.discountPrice && <div style={{ fontSize: 'clamp(11px, 2.2vw, 13px)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item._id)} style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', padding: '4px' }}>
                  <DeleteOutlineIcon sx={{ fontSize: 'clamp(18px, 3.5vw, 22px)' }} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Bundle Suggestion */}
          {bundleSuggestion?.isActive && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.06))', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <AutoAwesomeIcon sx={{ color: 'var(--accent-light)', fontSize: 'clamp(18px, 3.5vw, 22px)' }} />
                <h3 style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 700 }}>⚡ {bundleSuggestion.bundleName || 'Flash Bundle'}</h3>
                <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)', fontSize: 'clamp(11px, 2.2vw, 13px)', fontWeight: 700, color: 'white' }}>{bundleSuggestion.discount}% OFF</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(12px, 2.5vw, 14px)', marginBottom: '16px' }}>
                Bundle these items with your cart for {bundleSuggestion.discount}% off — delivered in the same bag!
              </p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAcceptBundle} disabled={acceptingBundle}
                  className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 'clamp(13px, 2.5vw, 15px)', borderRadius: 'var(--radius-full)' }}>
                  {acceptingBundle ? 'Adding...' : 'Accept Bundle Deal'}
                </motion.button>
                <button style={{ color: 'var(--text-muted)', fontSize: 'clamp(13px, 2.5vw, 15px)' }}>No thanks</button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: '96px' }}>
          <div style={{ padding: '24px', borderRadius: '12px', background: '#ffffff', border: '1px solid #eaeaea' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#111827', fontFamily: 'var(--font-sans)' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ color: '#4b5563' }}>Subtotal</span>
                <span style={{ color: '#4b5563' }}>₹{subtotal.toLocaleString()}</span>
              </div>
              {bundleDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ color: '#0d9488' }}>Savings</span>
                <span style={{ color: '#0d9488' }}>-₹{bundleDiscount.toLocaleString()}</span>
              </div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ color: '#4b5563' }}>Delivery fee</span>
                <span style={{ color: '#4b5563' }}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ color: '#4b5563' }}>Platform fee</span>
                <span style={{ color: '#4b5563' }}>₹5</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>₹{Math.round(total + 5).toLocaleString()}</span>
            </div>

            <button onClick={() => navigate(isAuthenticated ? '/checkout' : '/login')}
              style={{ width: '100%', padding: '13px', borderRadius: '8px', background: 'var(--gradient-primary)', border: 'none', color: '#ffffff', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 14px var(--accent-glow)' }}>
              Proceed to Checkout <span style={{ fontWeight: '400' }}>→</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '24px' }}>
              <AccessTimeIcon sx={{ fontSize: '16px', color: '#6b7280' }} />
              <span style={{ color: '#0d9488' }}>Estimated delivery: <strong style={{ color: '#064e3b', fontWeight: '600' }}>8-12 min</strong></span>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PaymentIcon sx={{ fontSize: '16px', color: '#0ea5e9' }} /> <span>Secure<br />pay</span>
              </div>
              <span style={{ color: '#d1d5db', alignSelf: 'center' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AutorenewIcon sx={{ fontSize: '16px', color: '#3b82f6' }} /> <span>Easy<br />returns</span>
              </div>
              <span style={{ color: '#d1d5db', alignSelf: 'center' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LocalShippingOutlinedIcon sx={{ fontSize: '16px', color: '#059669' }} /> <span>30m<br />delivery</span>
              </div>
            </div>

            {subtotal < 999 && <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>Add ₹{999 - subtotal} more for free delivery</p>}
          </div>
        </div>
      </div>

      {/* Product Carousels */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <ProductCarousel title="Customers who bought items in your cart also bought" products={row1} />
          <ProductCarousel title="Inspired by your browsing history" products={row2} />
          <ProductCarousel title="Your browsing history" products={row3} />
        </div>
      )}

      <style>{`@media(max-width:768px){.container>div:nth-child(2){grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
