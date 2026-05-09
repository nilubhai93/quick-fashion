import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../api/index';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadRounded';
import ToggleOffRoundedIcon from '@mui/icons-material/ToggleOffRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import ViewIcon from '@mui/icons-material/VisibilityRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SaveIcon from '@mui/icons-material/SaveRounded';
import WarningAmberIcon from '@mui/icons-material/WarningAmberRounded';
import AddIcon from '@mui/icons-material/AddRounded';

export default function ManageProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // View modal state
  const [viewTarget, setViewTarget] = useState(null);
  const [viewSelectedColor, setViewSelectedColor] = useState('');
  const [viewSelectedImage, setViewSelectedImage] = useState(0);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getDisplayImages = () => {
    if (!viewTarget) return [];
    if (viewSelectedColor) {
      const variant = viewTarget.colorImages?.find(ci => ci.color === viewSelectedColor);
      if (variant && variant.images?.length > 0) return variant.images;
    }
    return viewTarget.images || [];
  };

  const displayImages = getDisplayImages();

  // Toast
  const [toast, setToast] = useState('');

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const allTags = ['casual', 'formal', 'party', 'wedding', 'sporty', 'bohemian', 'streetwear', 'vintage', 'minimalist', 'trendy', 'classic', 'layering', 'semi-formal'];
  const allOccasions = ['office', 'wedding', 'party', 'date-night', 'casual', 'gym', 'beach', 'festival', 'interview'];
  const allWeather = ['hot', 'cold', 'mild', 'rainy', 'all-season'];

  const fetchProducts = async () => {
    try {
      const res = await api.get('/seller/dashboard/products');
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Toggle hide/unhide ──
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/seller/dashboard/products/${id}/toggle`);
      fetchProducts();
      showToast(res.data.product.isActive ? 'Product is now visible' : 'Product hidden from shop');
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  // ── Open edit modal ──
  const openEdit = (product) => {
    navigate(`/seller/edit-product/${product._id}`);
  };

  // ── Delete product ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/seller/dashboard/products/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchProducts();
      showToast('Product deleted permanently');
    } catch (err) {
      showToast('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = (p) => p.sizes?.reduce((a, s) => a + s.stock, 0) || 0;

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'all var(--transition-fast)'
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.8px', marginBottom: '6px'
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><CircularProgress sx={{ color: 'var(--accent)' }} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>My Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {products.length} items · {products.filter(p => p.isActive).length} active
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '8px 16px', width: '280px' }}>
          <SearchIcon sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '13px', marginLeft: '8px', width: '100%' }}
          />
        </div>
      </div>

      {/* Product Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Item</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Price</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Sizes</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Stock</th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, i) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    opacity: product.isActive ? 1 : 0.5
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={product.images?.[0] || 'https://placehold.co/50x50/1a1a25/9a9ab0?text=?'}
                        alt={product.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{product.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{product.brand} · {product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }} className="gradient-text">₹{product.price.toLocaleString()}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {product.sizes?.map(s => (
                        <span key={s.size} style={{
                          padding: '2px 8px', borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                          fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)'
                        }}>{s.size}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                    {totalStock(product)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                      background: product.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: product.isActive ? '#10b981' : '#f59e0b'
                    }}>
                      {product.isActive ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {/* Hide / Unhide */}
                      <button
                        title={product.isActive ? "Hide from shop" : "Make visible"}
                        onClick={() => handleToggleStatus(product._id)}
                        style={{
                          background: product.isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent', 
                          border: `1px solid ${product.isActive ? 'rgba(16, 185, 129, 0.2)' : 'var(--border)'}`,
                          padding: '7px', borderRadius: 'var(--radius-md)',
                          color: product.isActive ? '#10b981' : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {product.isActive ? <ToggleOnRoundedIcon sx={{ fontSize: 20 }} /> : <ToggleOffRoundedIcon sx={{ fontSize: 20 }} />}
                      </button>

                      {/* View Product */}
                      <button
                        title="Quick View"
                        onClick={() => { 
                          setViewTarget(product); 
                          setViewSelectedColor(product.colors?.[0] || ''); 
                          setViewSelectedImage(0);
                        }}
                        style={{
                          background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                          padding: '7px', borderRadius: 'var(--radius-md)',
                          color: '#3b82f6', cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <ViewIcon sx={{ fontSize: 17 }} />
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit product"
                        onClick={() => openEdit(product)}
                        style={{
                          background: 'var(--accent-bg)', border: '1px solid rgba(168,85,247,0.2)',
                          padding: '7px', borderRadius: 'var(--radius-md)',
                          color: 'var(--accent-light)', cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <EditIcon sx={{ fontSize: 17 }} />
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete product"
                        onClick={() => setDeleteTarget(product)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '7px', borderRadius: 'var(--radius-md)',
                          color: 'var(--error)', cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* ════════ QUICK VIEW MODAL ════════ */}
      <AnimatePresence>
        {viewTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewTarget(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(10px)', zIndex: 2500,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              padding: '40px 24px', overflowY: 'auto'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '850px', margin: 'auto',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-2xl)',
                border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1.1fr',
                boxShadow: '0 50px 120px rgba(0,0,0,0.8)', overflow: 'hidden'
              }}
            >
              {/* Left: Image Showcase */}
              <div style={{ position: 'relative', background: '#0a0a0f', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden' }}>
                  <motion.img 
                    key={displayImages[viewSelectedImage]}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={displayImages[viewSelectedImage] || 'https://placehold.co/600x800/1a1a25/9a9ab0?text=Product'} 
                    alt={viewTarget.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                  />
                </div>
                
                {/* Thumbnails Gallery */}
                <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '10px', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  {displayImages.map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setViewSelectedImage(i)}
                      style={{ 
                        width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', 
                        border: `2px solid ${i === viewSelectedImage ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`, 
                        cursor: 'pointer', flexShrink: 0, opacity: i === viewSelectedImage ? 1 : 0.6,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setViewTarget(null)}
                  style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>

              {/* Right: Detailed Specs */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(145deg, rgba(255,255,255,0.02), transparent)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '-12px' }}>
                  <span style={{ padding: '4px 12px', background: 'var(--accent-bg)', color: 'var(--accent-light)', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>{viewTarget.category}</span>
                  <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>{viewTarget.gender}</span>
                </div>

                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{viewTarget.brand}</p>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.1 }}>{viewTarget.name}</h2>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 900 }} className="gradient-text">₹{viewTarget.discountPrice ? viewTarget.discountPrice.toLocaleString() : viewTarget.price.toLocaleString()}</span>
                    {viewTarget.discountPrice && (
                      <>
                        <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '18px' }}>₹{viewTarget.price.toLocaleString()}</span>
                        <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 800 }}>{viewTarget.discountPercent || Math.round((1 - viewTarget.discountPrice / viewTarget.price) * 100)}% OFF</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Specs Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Colors</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {viewTarget.colors?.map(c => (
                        <button 
                          key={c} 
                          onClick={() => { setViewSelectedColor(c); setViewSelectedImage(0); }}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px', 
                            background: viewSelectedColor === c ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)', 
                            padding: '4px 10px', borderRadius: 'var(--radius-md)', 
                            border: `1px solid ${viewSelectedColor === c ? 'var(--accent)' : 'var(--border)'}`,
                            cursor: 'pointer', color: viewSelectedColor === c ? 'var(--accent-light)' : 'var(--text-primary)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.toLowerCase(), border: '1px solid rgba(255,255,255,0.2)' }} />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>{c}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Rental Price</p>
                    <p style={{ fontSize: '16px', fontWeight: 900, color: viewTarget.isAvailableForRent ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                      {viewTarget.isAvailableForRent ? `₹${viewTarget.rentPricePerDay}/day` : 'Not for Rent'}
                    </p>
                  </div>
                </div>

                {/* Sizes & Stock */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Inventory & Sizes</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {viewTarget.sizes?.map(s => (
                      <div key={s.size} style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px',
                        padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border)', transition: 'all 0.2s'
                      }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>{s.size}</span>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 700,
                          color: s.stock > 5 ? '#10b981' : s.stock > 0 ? '#f59e0b' : '#ef4444'
                        }}>
                          {s.stock} {s.stock === 1 ? 'Unit' : 'Units'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Product Narrative</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7, background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>{viewTarget.description || 'No description provided.'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Occasions</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {viewTarget.occasion?.map(occ => (
                        <span key={occ} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{occ}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Best Weather</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {viewTarget.weather?.map(w => (
                        <span key={w} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{w}</span>
                      ))}
                    </div>
                  </div>
                </div>

                </div>
                
                {/* Fixed Footer Actions */}
                <div style={{ padding: '20px 32px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => { setViewTarget(null); openEdit(viewTarget); }}
                    style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >Modify Listing</button>
                  <a 
                    href={`/products/${viewTarget._id}`} target="_blank" rel="noreferrer"
                    style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', color: 'white', textAlign: 'center', textDecoration: 'none', fontWeight: 700, boxShadow: '0 8px 24px var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >Go to Live Page</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ DELETE CONFIRMATION MODAL ════════ */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(6px)', zIndex: 2000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '420px',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                padding: '40px', textAlign: 'center'
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)', border: '2px solid rgba(239, 68, 68, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <WarningAmberIcon sx={{ fontSize: 28, color: '#ef4444' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Delete Product?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
                This will permanently remove <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</strong> from your store. This action cannot be undone.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 'var(--radius-lg)',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer'
                  }}
                >Keep It</button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white',
                    border: 'none', fontWeight: 700,
                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                    opacity: deleteLoading ? 0.7 : 1,
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ TOAST NOTIFICATION ════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            style={{
              position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
              padding: '14px 28px', borderRadius: 'var(--radius-full)',
              background: 'rgba(18, 18, 28, 0.95)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)', color: 'var(--text-primary)',
              fontSize: '14px', fontWeight: 600, zIndex: 3000,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
