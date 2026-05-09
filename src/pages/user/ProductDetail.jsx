import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import RemoveIcon from '@mui/icons-material/RemoveRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartRounded';
import BoltIcon from '@mui/icons-material/BoltRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { AnimatePresence } from 'framer-motion';
import { addToHistory } from './BrowsingHistory';

const FALLBACK_IMAGE = 'https://placehold.co/600x800/f3f4f6/374151?text=FlashFit';

const ProductCarousel = ({ title, products }) => {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>{title}</h3>
      <div style={{ position: 'relative' }}>
        <button onClick={() => scroll('left')} style={{ position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>&lt;</button>
        <div ref={scrollRef} style={{ display: 'flex', overflowX: 'auto', gap: '16px', padding: '10px 50px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {products.map((p, idx) => (
            <Link key={p._id || idx} to={`/products/${p._id}`} style={{ minWidth: '180px', maxWidth: '180px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '8px', height: '100%' }}>
                <img 
                  src={p.images?.[0] || FALLBACK_IMAGE} 
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  alt={p.name} 
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} 
                />
                <p style={{ marginTop: 8, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <StarIcon sx={{ fontSize: '14px', color: '#f59e0b' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.rating || 4.5}</span>
                </div>
                <p style={{ marginTop: 4, color: 'var(--accent)', fontWeight: 700, fontSize: '15px' }}>₹{p.discountPrice || p.price}</p>
              </div>
            </Link>
          ))}
        </div>
        <button onClick={() => scroll('right')} style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>&gt;</button>
      </div>
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [hoveredSize, setHoveredSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [toast, setToast] = useState('');
  const [purchaseMode, setPurchaseMode] = useState('buy'); // 'buy' or 'rent'
  const [rentalDays, setRentalDays] = useState(1);
  const [showPriceWarning, setShowPriceWarning] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getById(id);
        setProduct(res.data.product);
        if (res.data.product.colors?.length) setSelectedColor(res.data.product.colors[0]);
        // Set default size to first in-stock size
        const firstInStock = res.data.product.sizes?.find(s => s.stock > 0);
        if (firstInStock) setSelectedSize(firstInStock.size);
        addToHistory(res.data.product);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    const loadRelated = async () => {
      try {
        const res = await productAPI.getAll();
        if (res.data?.products) {
          setRelatedProducts(res.data.products);
        }
      } catch (e) { console.error(e); }
    };
    load();
    loadRelated();
    window.scrollTo(0, 0);
  }, [id]);

  const getStockForSize = (size) => {
    if (!product || !size) return 0;
    const sizeObj = product.sizes?.find(s => s.size === size);
    return sizeObj?.stock || 0;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty < 1) return;
    const maxStock = getStockForSize(selectedSize);
    if (newQty > maxStock) {
      showToast(`Only ${maxStock} items available in size ${selectedSize}`);
      return;
    }
    setQuantity(newQty);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const handleAdd = async () => {
    if (!selectedSize) return;
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      const isRental = purchaseMode === 'rent';
      await addToCart(product._id, selectedSize, selectedColor, quantity, isRental, isRental ? rentalDays : undefined);
      setAdded(true);
      showToast(`${quantity} item${quantity > 1 ? 's' : ''} added to cart${isRental ? ` (${rentalDays}-day rental)` : ''}!`);
      setTimeout(() => setAdded(false), 2000);
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) return;
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAdding(true);
    try {
      const isRental = purchaseMode === 'rent';
      await addToCart(product._id, selectedSize, selectedColor, quantity, isRental, isRental ? rentalDays : undefined);
      navigate('/checkout');
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  // Determine which images to show based on selected color
  const getDisplayImages = () => {
    if (!product) return [];
    if (selectedColor) {
      const variant = product.colorImages?.find(ci => ci.color === selectedColor);
      if (variant && variant.images?.length > 0) return variant.images;
    }
    return product.images || [];
  };

  const displayImages = getDisplayImages();

  if (loading) return (
    <div className="container" style={{ padding: '40px 24px', marginTop: '80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        <div className="skeleton" style={{ aspectRatio: '3/4' }} />
        <div><div className="skeleton" style={{ height: '30px', width: '60%', marginBottom: '16px' }} /><div className="skeleton" style={{ height: '200px' }} /></div>
      </div>
    </div>
  );

  if (!product) return <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '80px' }}><h2>Product not found</h2><Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse</Link></div>;

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const fastDelivery = product.deliveryZones?.some(z => z.estimatedMinutes <= 30);

  return (
    <div style={{ '--bg-primary': '#ffffff', '--bg-card': '#ffffff', '--bg-elevated': '#f9fafb', '--text-primary': '#111827', '--text-secondary': '#4b5563', '--text-muted': '#6b7280', '--border': '#e5e7eb', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', width: '100%', paddingTop: '10px' }}>
      <div className="container" style={{ padding: '10px 12px 60px', maxWidth: '1100px' }}>
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '12px', fontSize: '12px', marginLeft: '4px' }}>
          <ArrowBackIcon sx={{ fontSize: '16px' }} /> Back to Shop
        </Link>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 340px) 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '4/5', background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative', touchAction: 'none' }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.img 
                  key={displayImages[selectedImage]}
                  src={displayImages[selectedImage] || FALLBACK_IMAGE} 
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  alt={product.name} 
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -100 && selectedImage < displayImages.length - 1) {
                      setSelectedImage(prev => prev + 1);
                    } else if (swipe > 100 && selectedImage > 0) {
                      setSelectedImage(prev => prev - 1);
                    }
                  }}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, cursor: 'grab' }}
                  whileTap={{ cursor: 'grabbing' }}
                />
              </AnimatePresence>
              
              {/* Navigation Arrows */}
              {selectedImage > 0 && (
                <button 
                  onClick={(e) => { e.preventDefault(); setSelectedImage(prev => prev - 1); }}
                  style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', zIndex: 10, transition: 'all 0.2s' }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 20 }} />
                </button>
              )}
              {selectedImage < displayImages.length - 1 && (
                <button 
                  onClick={(e) => { e.preventDefault(); setSelectedImage(prev => prev + 1); }}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', zIndex: 10, transition: 'all 0.2s' }}
                >
                  <ChevronRightIcon sx={{ fontSize: 20 }} />
                </button>
              )}
            </div>

            {/* Colors Selection */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>
                  COLORS: <span style={{ color: 'var(--text-primary)' }}>{selectedColor}</span>
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <button key={c} onClick={() => { setSelectedColor(c); setSelectedImage(0); }} style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: 'var(--radius-lg)', 
                      background: selectedColor === c ? 'var(--accent-bg)' : 'var(--bg-elevated)', 
                      color: selectedColor === c ? 'var(--accent-light)' : 'var(--text-primary)', 
                      border: `2px solid ${selectedColor === c ? 'var(--accent)' : 'var(--border)'}`, 
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.toLowerCase(), border: '1px solid rgba(0,0,0,0.1)' }} />
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {displayImages.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px' }}>
                {displayImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === selectedImage ? 'var(--accent)' : 'var(--border)'}`, opacity: i === selectedImage ? 1 : 0.6, flexShrink: 0 }}>
                    <img src={img} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</div>
              <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border)' }} />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{product.category}</div>
            </div>
            
            <h1 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '6px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {product.occasion?.map(occ => (
                <span key={occ} style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', border: '1px solid var(--border)' }}>{occ}</span>
              ))}
              {product.weather?.map(w => (
                <span key={w} style={{ padding: '2px 6px', background: 'var(--accent-bg)', color: 'var(--accent-light)', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>{w}</span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 6px', background: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fef3c7' }}>
                <StarIcon sx={{ fontSize: '12px', color: '#f59e0b' }} />
                <span style={{ fontWeight: 800, color: '#92400e', fontSize: '12px' }}>{product.rating || 4.8}</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>{product.reviewCount || 120} ratings</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900 }} className="gradient-text">₹{price.toLocaleString()}</span>
                {hasDiscount && (
                  <>
                    <span style={{ fontSize: '16px', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 500 }}>
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span style={{ 
                      padding: '3px 10px', borderRadius: 'var(--radius-full)', 
                      background: '#10b981', color: 'white', 
                      fontSize: '11px', fontWeight: 800,
                    }}>
                      {product.discountPercent || Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

              {/* Purchase Mode Toggle */}
              {product.isAvailableForRent && product.rentPricePerDay > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-elevated)', padding: '6px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                    <button onClick={() => { setPurchaseMode('buy'); setRentalDays(1); setShowPriceWarning(false); }} style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      background: purchaseMode === 'buy' ? 'var(--gradient-primary)' : 'transparent',
                      color: purchaseMode === 'buy' ? 'white' : 'var(--text-muted)',
                      border: 'none', transition: 'all 0.3s'
                    }}>Own This Piece</button>
                    <button onClick={() => setPurchaseMode('rent')} style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      background: purchaseMode === 'rent' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                      color: purchaseMode === 'rent' ? 'white' : 'var(--text-muted)',
                      border: 'none', transition: 'all 0.3s'
                    }}>Rent for Occasion</button>
                  </div>

                  {/* Rental Days Selector - Only show in Rent Mode */}
                  <AnimatePresence>
                    {purchaseMode === 'rent' && (
                      <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 16 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rental Duration</label>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>₹{product.rentPricePerDay}/day</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e0e7ff' }}>
                              <button onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 900 }}>-</button>
                              <div style={{ width: '48px', textAlign: 'center', fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>{rentalDays}</div>
                              <button onClick={() => {
                                const nextDays = rentalDays + 1;
                                // If it exceeds buy price, show warning and STOP increasing for a moment
                                if (nextDays * product.rentPricePerDay > price && !showPriceWarning) {
                                  setShowPriceWarning(true);
                                  return;
                                }
                                setRentalDays(nextDays);
                              }} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 900 }}>+</button>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Days Total</span>
                          </div>
                          {showPriceWarning && (
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', fontSize: '12px', fontWeight: 500 }}>
                              <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />
                              Rental cost exceeds buy price. Consider owning it!
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            {/* Sizes */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                SIZE <span style={{ color: 'var(--text-primary)', textTransform: 'none', fontWeight: 600 }}>{hoveredSize || selectedSize}</span>
                {!hoveredSize && !selectedSize && <span style={{ color: 'var(--warning)', fontWeight: 400, textTransform: 'none' }}>— Select</span>}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes?.map(s => (
                  <button 
                    key={s.size} 
                    onClick={() => handleSizeSelect(s.size)} 
                    onMouseEnter={() => setHoveredSize(s.size)} 
                    onMouseLeave={() => setHoveredSize('')} 
                    disabled={s.stock <= 0} 
                    style={{ 
                      padding: '10px 20px', borderRadius: 'var(--radius-md)', 
                      background: selectedSize === s.size ? 'var(--gradient-primary)' : 'var(--bg-elevated)', 
                      color: selectedSize === s.size ? 'white' : s.stock > 0 ? 'var(--text-primary)' : 'var(--text-muted)', 
                      border: `1px solid ${selectedSize === s.size ? 'transparent' : 'var(--border)'}`, 
                      fontSize: '14px', fontWeight: 600, 
                      cursor: s.stock > 0 ? 'pointer' : 'not-allowed', 
                      opacity: s.stock <= 0 ? 0.3 : 1 
                    }}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
              {selectedSize && <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{getStockForSize(selectedSize)} in stock</p>}
            {/* Tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>{product.tags?.map(t => <span key={t} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t}</span>)}</div>
            {/* Quantity Selector */}
            {selectedSize && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: quantity <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 700
                    }}><RemoveIcon sx={{ fontSize: 16 }} /></button>
                  <div style={{
                    width: '44px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)'
                  }}>{quantity}</div>
                  <button onClick={() => handleQuantityChange(1)}
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 700
                    }}><AddIcon sx={{ fontSize: 16 }} /></button>
                  <span style={{ marginLeft: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Total: <strong style={{ color: 'var(--text-primary)' }}>₹{(purchaseMode === 'rent' ? (product.rentPricePerDay * rentalDays * quantity) : (price * quantity)).toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(() => {
              const pid = product._id?.toString?.() || product._id;
              const cartItemsForProduct = items.filter(i => {
                const cartPid = (i.product?._id || i.product)?.toString?.() || (i.product?._id || i.product);
                return cartPid === pid;
              });
              const totalInCart = cartItemsForProduct.reduce((acc, i) => acc + i.quantity, 0);
              const isInCart = totalInCart > 0;

              return (
                <>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {isInCart ? (
                      /* Go to Cart button */
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/cart')}
                        style={{
                          width: '160px', padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                          background: 'var(--bg-card)',
                          color: 'var(--accent-light)',
                          fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          cursor: 'pointer',
                          border: '1px solid rgba(168, 85, 247, 0.3)'
                        }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} /> Cart ({totalInCart})
                      </motion.button>
                    ) : (
                      /* Add to Cart button */
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} disabled={adding || !selectedSize}
                        style={{
                          width: '160px', padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                          background: added ? 'var(--success)' : !selectedSize ? 'var(--bg-elevated)' : 'var(--bg-card)',
                          color: !selectedSize ? 'var(--text-muted)' : added ? 'white' : 'var(--text-primary)',
                          fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          cursor: selectedSize ? 'pointer' : 'not-allowed',
                          border: `1px solid ${added ? 'var(--success)' : selectedSize ? 'var(--border)' : 'transparent'}`
                        }}>
                        {added ? <><CheckCircleIcon sx={{ fontSize: 18 }} /> Added!</> : adding ? 'Adding...' : <><ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} /> Add to Cart</>}
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBuyNow} disabled={adding || !selectedSize}
                      style={{
                        width: '160px', padding: '10px 16px', borderRadius: 'var(--radius-lg)',
                        background: !selectedSize ? 'var(--bg-elevated)' : 'var(--gradient-primary)',
                        color: !selectedSize ? 'var(--text-muted)' : 'white',
                        fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: selectedSize ? 'pointer' : 'not-allowed',
                        border: 'none', boxShadow: selectedSize ? '0 4px 15px var(--accent-glow)' : 'none'
                      }}>
                      <BoltIcon sx={{ fontSize: 18 }} /> {selectedSize ? (purchaseMode === 'rent' ? 'Rent Now' : 'Buy Now') : 'Select Size'}
                    </motion.button>
                  </div>
                </>
              );
            })()}
            {/* Bundle */}
            {product.bundleCompatible?.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, marginBottom: '16px' }}>
                  ⚡ Complete the Look — <span className="gradient-text">15% Bundle</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {product.bundleCompatible.map(p => (
                    <Link key={p._id} to={`/products/${p._id}`} style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.images?.[0]} onError={(e) => { e.target.src = FALLBACK_IMAGE; }} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-light)' }}>₹{p.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Sections */}
        <div style={{ marginTop: '60px' }}>
          <ProductCarousel title="Customers who viewed this item also viewed" products={relatedProducts.slice(0, 8)} />
          <ProductCarousel title="Relevant to your selections" products={relatedProducts.slice(8, 16)} />

          <div style={{ padding: '24px 0', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Customer Reviews</h3>
            <div style={{ background: 'var(--bg-elevated)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <StarIcon sx={{ fontSize: '20px', color: '#f59e0b' }} /><StarIcon sx={{ fontSize: '20px', color: '#f59e0b' }} /><StarIcon sx={{ fontSize: '20px', color: '#f59e0b' }} /><StarIcon sx={{ fontSize: '20px', color: '#f59e0b' }} /><StarIcon sx={{ fontSize: '20px', color: 'var(--border)' }} />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{product.rating} out of 5</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Based on {product.reviewCount} global ratings. Customers love the fit and the quality. Fast delivery and accurate sizing.</p>
            </div>
          </div>

          <ProductCarousel title="Customers who bought this item also bought" products={relatedProducts.slice(2, 10)} />
          <ProductCarousel title="Your Browsing History" products={relatedProducts.slice(4, 12)} />
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 768px) {
            .container > div:nth-child(2) {
              grid-template-columns: 1fr !important;
            }
          }
        ` }} />

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              style={{
                position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                padding: '14px 28px', borderRadius: 'var(--radius-full)',
                background: 'var(--gradient-primary)', backdropFilter: 'blur(12px)',
                border: 'none', color: 'white',
                fontSize: '14px', fontWeight: 600, zIndex: 3000,
                boxShadow: '0 8px 30px var(--accent-glow)', whiteSpace: 'nowrap'
              }}
            >{toast}</motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPriceWarning && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowPriceWarning(false)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                style={{
                  position: 'relative', width: '100%', maxWidth: '400px', borderRadius: '24px',
                  background: 'white', border: '1px solid var(--border)',
                  padding: '40px 32px', textAlign: 'center',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 5001
                }}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setShowPriceWarning(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <CloseIcon sx={{ fontSize: '20px' }} />
                </button>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WarningAmberRoundedIcon sx={{ fontSize: '32px', color: '#d97706' }} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#111827', letterSpacing: '-0.5px' }}>Rental Exceeds Buy Price!</h3>
                <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, marginBottom: '24px' }}>
                  Renting for <strong style={{ color: '#d97706' }}>{rentalDays} days</strong> costs <strong style={{ color: '#d97706' }}>₹{(product.rentPricePerDay * rentalDays).toLocaleString()}</strong>.
                  The buy price is <strong style={{ color: '#059669' }}>₹{(product.discountPrice || product.price).toLocaleString()}</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button onClick={() => { setPurchaseMode('buy'); setShowPriceWarning(false); }} style={{
                    width: '100%', padding: '16px', borderRadius: '16px',
                    background: 'var(--gradient-primary)', color: 'white', border: 'none',
                    fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.4)'
                  }}>Switch to Buy & Save</button>
                  <button onClick={() => setShowPriceWarning(false)} style={{
                    width: '100%', padding: '16px', borderRadius: '16px',
                    background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                  }}>Continue Renting</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
