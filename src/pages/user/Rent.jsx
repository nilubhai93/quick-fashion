import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import { Link } from 'react-router-dom';
import DryCleaningOutlinedIcon from '@mui/icons-material/DryCleaningRounded';
import EventIcon from '@mui/icons-material/EventRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondRounded';
import FilterListIcon from '@mui/icons-material/FilterListRounded';

export default function Rent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { 
          forRent: 'true',
          inStock: 'true', // "if rented then can not see product" -> only show available stock
          limit: 50
        };
        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }
        
        const res = await productAPI.getAll(params);
        setProducts(res.data.products || []);
        
        // Extract unique categories from rental products
        if (activeCategory === 'all') {
          const cats = [...new Set((res.data.products || []).map(p => p.category))];
          setCategories(cats);
        }
      } catch (e) {
        console.error('Failed to load rental products:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeCategory]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf7f2', // Matching home theme
      color: '#1a1a1a',
      paddingBottom: '80px',
      paddingTop: '10px'
    }}>
      {/* Header / Hero */}
      <div style={{ 
        background: 'linear-gradient(135deg, #14327a 0%, #1a3a8a 100%)', 
        padding: '32px 24px 24px', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        {/* Abstract background shapes */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px', background: 'rgba(201,169,110,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', marginBottom: '16px', fontSize: '13px', fontWeight: 500 }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to Shop
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <DiamondOutlinedIcon sx={{ color: '#c9a96e', fontSize: 20 }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#c9a96e', textTransform: 'uppercase', letterSpacing: '1px' }}>FlashFit Premium Rental</span>
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, fontFamily: '"Playfair Display", serif', marginBottom: '8px', lineHeight: 1.1 }}>
            Designer Outfits, <span style={{ color: '#c9a96e' }}>Available to Rent</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', maxWidth: '500px', lineHeight: 1.5 }}>
            Luxury fashion delivered in 30 minutes. Wear for the occasion, return the next day.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'white', border: '1px solid #e8e4df', borderRadius: '10px', whiteSpace: 'nowrap' }}>
            <FilterListIcon sx={{ fontSize: 16, color: '#14327a' }} />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Filter</span>
          </div>
          <button 
            onClick={() => setActiveCategory('all')}
            style={{ 
              padding: '8px 16px', borderRadius: '10px', border: '1px solid', 
              borderColor: activeCategory === 'all' ? '#14327a' : '#e8e4df',
              background: activeCategory === 'all' ? '#14327a' : 'white',
              color: activeCategory === 'all' ? 'white' : '#1a1a1a',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
            }}
          >All Rentals</button>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{ 
                padding: '10px 20px', borderRadius: '12px', border: '1px solid', 
                borderColor: activeCategory === cat ? '#14327a' : '#e8e4df',
                background: activeCategory === cat ? '#14327a' : 'white',
                color: activeCategory === cat ? 'white' : '#1a1a1a',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {products.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'white', borderRadius: '24px', border: '1px solid #e8e4df' }}>
            <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <DryCleaningOutlinedIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No rental products found</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Check back soon or explore our main collection.</p>
            <Link to="/products" style={{ display: 'inline-block', padding: '12px 24px', background: '#14327a', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>Explore All Products</Link>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div style={{ maxWidth: '1280px', margin: '32px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: <DryCleaningOutlinedIcon />, title: 'Pro Cleaning', desc: 'Every outfit is sanitized and dry-cleaned.' },
            { icon: <LocalShippingOutlinedIcon />, title: 'Quick Swap', desc: 'Size doesn\'t fit? We swap in 20 mins.' },
            { icon: <AutoAwesomeIcon />, title: 'Zero Damage Fee', desc: 'Minor stains and wear are on us.' },
            { icon: <EventIcon />, title: 'Easy Returns', desc: 'We pick it up when you\'re done.' }
          ].map((benefit, i) => (
            <div key={i} style={{ padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #e8e4df', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(20, 50, 122, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14327a', margin: '0 auto 16px' }}>
                {benefit.icon}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{benefit.title}</h4>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
