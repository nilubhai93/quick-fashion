import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productAPI } from '../../api';
import ProductCard from '../../components/ProductCard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRightRounded';
import { useAuth } from '../../context/AuthContext';

const adSlides = [
  {
    id: 1,
    image: '/images/hero_banner_1.png',
    title: 'Summer Sale',
    headline: 'Up to 60% Off',
    subtitle: 'On trending styles & top brands',
    cta: 'Shop Now',
    ctaLink: '/products',
    gradient: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)',
    accent: '#c9a96e',
    badge: 'Limited Time',
  },
  {
    id: 2,
    image: '/images/hero_banner_2.png',
    title: 'New Arrivals',
    headline: 'Premium Collection',
    subtitle: 'Luxury fashion delivered in 30 minutes',
    cta: 'Explore',
    ctaLink: '/products?sort=-createdAt',
    gradient: 'linear-gradient(to right, rgba(26,26,26,0.9) 0%, rgba(26,26,26,0.5) 45%, transparent 100%)',
    accent: '#dfc492',
    badge: 'Just Dropped',
  },
  {
    id: 3,
    image: '/images/offer_banner.png',
    title: 'Flash Deal',
    headline: 'Buy 2 Get 1 Free',
    subtitle: 'On all accessories — use code B2G1',
    cta: 'Grab Deal',
    ctaLink: '/products?category=accessory',
    gradient: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
    accent: '#4ade80',
    badge: 'Today Only',
  },
  {
    id: 4,
    image: '/images/trending_look_1.png',
    title: 'Trending Now',
    headline: 'Flat ₹500 Off',
    subtitle: 'First order? Use code FIRST500',
    cta: 'Shop Trends',
    ctaLink: '/products?sort=-rating',
    gradient: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 100%)',
    accent: '#f472b6',
    badge: 'Exclusive',
  },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ad carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stylistVideoIndex, setStylistVideoIndex] = useState(0);
  const [policyIndex, setPolicyIndex] = useState(0);
  const [currentAiSentence, setCurrentAiSentence] = useState(0);
  const timerRef = useRef(null);
  const [aiData] = useState([
    {
      query: "I have a wedding in 2 hours, what should I wear?",
      chat: [
        { role: 'user', text: "I have a wedding in 2 hours, what should I wear? 🤵" },
        { role: 'ai', text: "Finding you something royal... checking local inventory..." }
      ]
    },
    {
      query: "Help me find a perfect outfit for my first date.",
      chat: [
        { role: 'user', text: "Help me find a perfect outfit for my first date. ❤️" },
        { role: 'ai', text: "I have some romantic and stylish options for you. Let me check the closest warehouse..." }
      ]
    },
    {
      query: "What's the best smart-casual look for an office party?",
      chat: [
        { role: 'user', text: "What's the best smart-casual look for an office party? 👔" },
        { role: 'ai', text: "Smart-casual is my specialty! Pulling up premium blazers and chinos..." }
      ]
    },
    {
      query: "I need a comfortable but stylish outfit for a long flight.",
      chat: [
        { role: 'user', text: "I need a comfortable but stylish outfit for a long flight. ✈️" },
        { role: 'ai', text: "Comfort is key. Looking for breathable fabrics and trendy athleisure..." }
      ]
    },
    {
      query: "Suggest some trendy street-wear for this weekend.",
      chat: [
        { role: 'user', text: "Suggest some trendy street-wear for this weekend. 🔥" },
        { role: 'ai', text: "Street-wear vibes activated. Fetching oversized tees and fresh sneakers..." }
      ]
    }
  ]);

  useEffect(() => {
    const aiTimer = setInterval(() => {
      setCurrentAiSentence((prev) => (prev + 1) % aiData.length);
    }, 4000);
    return () => clearInterval(aiTimer);
  }, [aiData.length]);

  useEffect(() => {
    const policyTimer = setInterval(() => {
      setPolicyIndex((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(policyTimer);
  }, []);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % adSlides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + adSlides.length) % adSlides.length);
  }, [currentSlide, goToSlide]);

  // Auto-play
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 5000);
    return () => clearInterval(timerRef.current);
  }, [nextSlide]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/register');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, dealRes, catRes, latestRes] = await Promise.all([
          productAPI.getFeatured(),
          productAPI.getDeals(),
          productAPI.getCategories(),
          productAPI.getAll({ limit: 10, sort: '-createdAt' })
        ]);
        setFeatured(featRes.data.products || []);
        setDeals(dealRes.data.products || []);
        setCategories(catRes.data.categories || []);
        setLatestProducts(latestRes.data.products || []);
        setTotalProducts(latestRes.data.pagination?.total || 0);
      } catch (e) {
        console.error('Failed to load home data:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categoryIcons = {
    dress: '👗', shirt: '👔', jeans: '👖', tshirt: '👕',
    jacket: '🧥', shoes: '👟', bag: '👜', jewelry: '💎',
    accessory: '⌚', skirt: '🩱', shorts: '🩳', sweater: '🧶',
    outerwear: '🧥'
  };

  const features = [
    { icon: <LocalShippingOutlinedIcon />, title: '10-30 Min Delivery', desc: 'Lightning fast to your doorstep' },
    { icon: <AutoAwesomeIcon />, title: 'AI Personal Stylist', desc: 'Smart outfit recommendations' },
    { icon: <AccessTimeIcon />, title: 'Real-time Tracking', desc: 'Know exactly when it arrives' },
    { icon: <VerifiedIcon />, title: '100% Authentic', desc: 'Guaranteed genuine brands' },
  ];

  return (
    <div style={{
      '--bg-primary': '#faf7f2',
      '--bg-secondary': '#f5f0eb',
      '--bg-card': 'rgba(255, 255, 255, 0.75)',
      '--bg-elevated': '#ffffff',
      '--border': '#e8e4df',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#8a8580',
      '--text-muted': '#a8b5a0',
      '--accent': '#1e4db7',
      '--accent-light': '#3a6bc5',
      '--accent-bg': 'rgba(30, 77, 183, 0.1)',
      '--gradient-primary': 'linear-gradient(135deg, #14327a 0%, #c9a96e 50%, #14327a 100%)',
      '--font-sans': '"Inter", sans-serif',
      '--font-display': '"Playfair Display", serif',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      minHeight: '100vh',
      paddingBottom: '40px'
    }}>
      {/* Advertisement Carousel */}
      <section style={{
        position: 'relative',
        height: 'clamp(380px, 55vh, 520px)',
        overflow: 'hidden',
        width: '100%',
      }}>
        {/* Slides */}
        {adSlides.map((slide, idx) => (
          <div key={slide.id} style={{
            position: 'absolute', inset: 0,
            opacity: idx === currentSlide ? 1 : 0,
            transform: idx === currentSlide ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            pointerEvents: idx === currentSlide ? 'auto' : 'none',
          }}>
            {/* Background blur layer to fill edges without stretching */}
            <img src={slide.image} alt="" style={{
              position: 'absolute', inset: -20, width: 'calc(100% + 40px)', height: 'calc(100% + 40px)',
              objectFit: 'cover', filter: 'blur(20px) brightness(0.6)',
            }} />
            {/* Main image — full picture, no stretching */}
            <img src={slide.image} alt={slide.title} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', zIndex: 1,
            }} />
            {/* Focus glow light */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
              background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)',
            }} />
            {/* Gradient overlay for text readability */}
            <div style={{ position: 'absolute', inset: 0, background: slide.gradient, zIndex: 3 }} />

            {/* Content */}
            <div style={{
              position: 'relative', zIndex: 2, height: '100%',
              display: 'flex', alignItems: 'center',
              padding: '0 80px',
              maxWidth: '1440px', margin: '0 auto',
            }}>
              <div style={{
                maxWidth: '520px',
                opacity: idx === currentSlide && !isTransitioning ? 1 : 0,
                transform: idx === currentSlide && !isTransitioning ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s',
              }}>
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '5px 14px', borderRadius: '100px',
                  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  marginBottom: '16px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: slide.accent }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                    {slide.badge}
                  </span>
                </div>

                {/* Title */}
                <p style={{
                  fontSize: '14px', fontWeight: 600, color: slide.accent, textTransform: 'uppercase',
                  letterSpacing: '2px', marginBottom: '6px', fontFamily: 'var(--font-sans)',
                }}>{slide.title}</p>

                {/* Headline */}
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: '12px',
                }}>{slide.headline}</h2>

                {/* Subtitle */}
                <p style={{
                  fontSize: 'clamp(14px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.8)',
                  fontWeight: 300, marginBottom: '28px', fontFamily: 'var(--font-sans)',
                }}>{slide.subtitle}</p>

                {/* CTA */}
                <Link to={slide.ctaLink} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: slide.accent, color: '#1a1a1a',
                  padding: '12px 28px', borderRadius: '100px',
                  fontWeight: 700, fontSize: '13px', textTransform: 'uppercase',
                  letterSpacing: '1px', textDecoration: 'none',
                  boxShadow: `0 4px 20px ${slide.accent}44`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {slide.cta} <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Left Arrow */}
        <button
          onClick={(e) => { prevSlide(); e.currentTarget.style.animation = 'none'; void e.currentTarget.offsetHeight; e.currentTarget.style.animation = 'arrowPulse 0.4s ease'; }}
          aria-label="Previous slide"
          style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: '48px', height: '80px', borderRadius: '4px',
            background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'background 0.3s, transform 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
        >
          <ChevronLeftIcon sx={{ fontSize: 36 }} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={(e) => { nextSlide(); e.currentTarget.style.animation = 'none'; void e.currentTarget.offsetHeight; e.currentTarget.style.animation = 'arrowPulse 0.4s ease'; }}
          aria-label="Next slide"
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: '48px', height: '80px', borderRadius: '4px',
            background: 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'background 0.3s, transform 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
        >
          <ChevronRightIcon sx={{ fontSize: 36 }} />
        </button>


      </section>

      {/* Promo Cards Section */}
      <section style={{ padding: '40px 0 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Card 1: Our Stylist (Video Carousel) */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '24px',
            position: 'relative', overflow: 'hidden', minHeight: '380px',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            {/* Video Carousel Background */}
            {[
              { src: '/videos/men_model.mp4', label: "Men's Styling" },
              { src: '/videos/women_model.mp4', label: "Women's Styling" },
              { src: '/videos/kids_model.mp4', label: "Kids' Styling" }
            ].map((media, vIdx) => (
              <video
                key={vIdx}
                src={media.src}
                title={media.label}
                autoPlay muted loop playsInline
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                  opacity: vIdx === stylistVideoIndex ? 1 : 0,
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: vIdx === stylistVideoIndex ? 1 : 0,
                  backgroundColor: '#1a1a1a'
                }}
              />
            ))}

            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
              zIndex: 2
            }} />

            {/* Video Controls */}
            <div style={{ position: 'absolute', right: '12px', bottom: '80px', display: 'flex', gap: '8px', zIndex: 10 }}>
              <button
                onClick={(e) => { e.preventDefault(); setStylistVideoIndex(prev => (prev === 0 ? 2 : prev - 1)); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                  border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 20 }} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setStylistVideoIndex(prev => (prev + 1) % 3); }}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                  border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div style={{ position: 'relative', zIndex: 10 }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Rental Collection</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '16px' }}>Premium designer outfits for rent.</p>
              <Link to="/rent" style={{ color: '#c9a96e', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Browse Now →</Link>
            </div>
          </div>

          {/* Card 2: Store Policies (Carousel) */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: 0,
            position: 'relative', overflow: 'hidden', minHeight: '380px',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            {[
              {
                src: '/images/policy_delivery.png',
                title: '30-Min Delivery',
                desc: 'From our hub to your door, fast.',
                link: '/orders',
                linkText: 'Track Now →',
                accent: 'var(--accent-light)'
              },
              {
                src: '/images/policy_returns.png',
                title: 'Easy Returns',
                desc: '7-day hassle-free return policy.',
                link: '/returns',
                linkText: 'Learn More →',
                accent: 'var(--info)'
              },
              {
                src: '/images/policy_authentic.png',
                title: '100% Authentic',
                desc: 'Guaranteed premium quality products.',
                link: '/about',
                linkText: 'Our Guarantee →',
                accent: 'var(--success)'
              }
            ].map((policy, idx) => (
              <div key={idx} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                opacity: idx === policyIndex ? 1 : 0,
                transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: idx === policyIndex ? 1 : 0,
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px'
              }}>
                <img src={policy.src} alt={policy.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)', zIndex: -1 }} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{policy.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '16px' }}>{policy.desc}</p>
                  <Link to={policy.link} style={{ color: policy.accent, fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>{policy.linkText}</Link>
                </div>
              </div>
            ))}

            {/* Pagination Dots */}
            <div style={{ position: 'absolute', right: '24px', bottom: '24px', display: 'flex', gap: '6px', zIndex: 10 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: i === policyIndex ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === policyIndex ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
          </div>

          {/* Card 3: 50% Off (Amazon Style Grid) */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>Up to 50% off | Deals</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1
            }}>
              <Link to="/products?category=shoes" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Shoes" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Premium Footwear</p>
              </Link>
              <Link to="/products?category=bags" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/offer_banner.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Bags" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Luxury Handbags</p>
              </Link>
              <Link to="/products?category=dresses" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Dresses" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Designer Dresses</p>
              </Link>
              <Link to="/products?category=accessories" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Watch" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Accessories</p>
              </Link>
            </div>
            <Link to="/offers" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all offers</Link>
          </div>

          {/* Card 4: Special Offers Grid */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>Buy 2 Get 1 Offers | upon some products</h3>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1
            }}>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 1" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Premium Footwear</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 2" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Luxury Handbags</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 3" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Designer Dresses</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 4" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Accessories</p>
              </Link>
            </div>
            <Link to="/offers" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all offers</Link>
          </div>
        </div>
      </section>

      {/* Personalized Offers Section */}
      <section style={{ padding: '20px 0 60px', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          {/* Card 5: Already Visited */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>view already visit products</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Visit 1" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Outerwear</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_sneakers.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Visit 2" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Sneakers</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Visit 3" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Watches</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_sunglasses.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Visit 4" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Eyewear</p>
              </Link>
            </div>
            <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See your history</Link>
          </div>

          {/* Card 6: Pick up where left off */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>pick up where you left off</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Left 1" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Dresses</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Left 2" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Handbags</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Left 3" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>T-Shirts</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Left 4" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Trends</p>
              </Link>
            </div>
            <Link to="/cart" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Continue shopping</Link>
          </div>

          {/* Card 7: Under 300 */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>under 300 | bestsells of men's dresses.</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Under 1" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Men's Tees</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_sneakers.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Under 2" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Daily Shoes</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Under 3" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Casual Shirts</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_sunglasses.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Under 4" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Budget Access.</p>
              </Link>
            </div>
            <Link to="/offers" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all bestsellers</Link>
          </div>

          {/* Card 8: Best from Best */}
          <div className="promo-card" style={{
            background: 'var(--bg-elevated)', borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column', minHeight: '380px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>choose your best from best.</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Best 1" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Premium Looks</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Best 2" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Evening Gowns</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Best 3" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Designer Coats</p>
              </Link>
              <Link to="/products" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                  <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Best 4" />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Elite Watches</p>
              </Link>
            </div>
            <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Explore top collection</Link>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section style={{ padding: '40px 0 20px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Trending Now</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '20px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tech-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="tech-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 0',
                scrollSnapType: 'x mandatory'
              }}
            >
              {[
                { id: 1, img: '/images/product_watch.png' },
                { id: 2, img: '/images/product_sunglasses.png' },
                { id: 3, img: '/images/product_sneakers.png' },
                { id: 4, img: '/images/trending_look_1.png' },
                { id: 5, img: '/images/product_watch.png' },
                { id: 6, img: '/images/product_jacket.png' },
                { id: 7, img: '/images/product_handbag.png' }
              ].map((item) => (
                <div key={item.id} style={{ flex: '0 0 160px', scrollSnapAlign: 'start', cursor: 'pointer' }}>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.img} alt="Trending Item" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tech-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>New Arrivals</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '20px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('arrival-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="arrival-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 0',
                scrollSnapType: 'x mandatory'
              }}
            >
              {[
                { id: 1, img: '/images/product_jacket.png' },
                { id: 2, img: '/images/product_handbag.png' },
                { id: 3, img: '/images/hero_banner_1.png' },
                { id: 4, img: '/images/trending_look_2.png' },
                { id: 5, img: '/images/product_sneakers.png' },
                { id: 6, img: '/images/product_watch.png' },
                { id: 7, img: '/images/product_sunglasses.png' }
              ].map((item) => (
                <div key={item.id} style={{ flex: '0 0 160px', scrollSnapAlign: 'start', cursor: 'pointer' }}>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.img} alt="New Arrival" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('arrival-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* New Promotional Grid Row */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Best Sellers for Kids */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Best Sellers for | Kids</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?category=kids" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Kids 1" />
                  </div>
                </Link>
                <Link to="/products?category=kids" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_sneakers.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Kids 2" />
                  </div>
                </Link>
                <Link to="/products?category=kids" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Kids 3" />
                  </div>
                </Link>
                <Link to="/products?category=kids" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Kids 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?category=kids" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See all kids collection</Link>
            </div>

            {/* Best Sellers for Women */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Best Sellers for | Women</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?category=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Women 1" />
                  </div>
                </Link>
                <Link to="/products?category=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Women 2" />
                  </div>
                </Link>
                <Link to="/products?category=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Women 3" />
                  </div>
                </Link>
                <Link to="/products?category=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Women 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?category=women" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop women's bestsellers</Link>
            </div>

            {/* Up to 60% off | Kurti, Pajama, Scrab */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Up to 60% off | Kurti, Pajama, Scrab</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?gender=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 1" />
                  </div>
                </Link>
                <Link to="/products?gender=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 2" />
                  </div>
                </Link>
                <Link to="/products?gender=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/offer_banner.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 3" />
                  </div>
                </Link>
                <Link to="/products?gender=women" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Offer 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?gender=women" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>See more deals</Link>
            </div>

            {/* Top Deals on | Men's Underwear */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Top Deals on | Men's Underwear</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?category=men" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Men 1" />
                  </div>
                </Link>
                <Link to="/products?category=men" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Men 2" />
                  </div>
                </Link>
                <Link to="/products?category=men" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Men 3" />
                  </div>
                </Link>
                <Link to="/products?category=men" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Men 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?category=men" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop underwear collection</Link>
            </div>
          </div>
        </div>
      </section>
      {/* Quick Picks Section */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Quick Picks</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '20px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('quick-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="quick-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 0',
                scrollSnapType: 'x mandatory'
              }}
            >
              {[
                { id: 1, img: '/images/product_sneakers.png' },
                { id: 2, img: '/images/product_watch.png' },
                { id: 3, img: '/images/product_sunglasses.png' },
                { id: 4, img: '/images/product_handbag.png' },
                { id: 5, img: '/images/product_jacket.png' },
                { id: 6, img: '/images/product_tshirt.png' },
                { id: 7, img: '/images/trending_look_1.png' }
              ].map((item) => (
                <div key={item.id} style={{ flex: '0 0 160px', scrollSnapAlign: 'start', cursor: 'pointer' }}>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.img} alt="Quick Pick" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('quick-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Starting price at 199 | Men's T-shirts Section */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Starting price at 199 | Men's T-shirts</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '20px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tshirt-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="tshirt-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 0',
                scrollSnapType: 'x mandatory'
              }}
            >
              {[
                { id: 1, img: '/images/product_tshirt.png' },
                { id: 2, img: '/images/trending_look_1.png' },
                { id: 3, img: '/images/product_jacket.png' },
                { id: 4, img: '/images/product_tshirt.png' },
                { id: 5, img: '/images/hero_banner_2.png' },
                { id: 6, img: '/images/product_tshirt.png' },
                { id: 7, img: '/images/trending_look_2.png' }
              ].map((item) => (
                <div key={item.id} style={{ flex: '0 0 160px', scrollSnapAlign: 'start', cursor: 'pointer' }}>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.img} alt="T-Shirt" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('tshirt-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Lifestyle Promotional Grid Row */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Party Night */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Party Night</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?occasion=party" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Party 1" />
                  </div>
                </Link>
                <Link to="/products?occasion=party" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Party 2" />
                  </div>
                </Link>
                <Link to="/products?occasion=party" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Party 3" />
                  </div>
                </Link>
                <Link to="/products?occasion=party" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Party 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?occasion=party" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop party looks</Link>
            </div>

            {/* Office Wear */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Office Wear</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?occasion=office" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Office 1" />
                  </div>
                </Link>
                <Link to="/products?occasion=office" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Office 2" />
                  </div>
                </Link>
                <Link to="/products?occasion=office" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Office 3" />
                  </div>
                </Link>
                <Link to="/products?occasion=office" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_sunglasses.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Office 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?occasion=office" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>View formal collection</Link>
            </div>

            {/* Date Night */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Date Night</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?occasion=date-night" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Date 1" />
                  </div>
                </Link>
                <Link to="/products?occasion=date-night" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Date 2" />
                  </div>
                </Link>
                <Link to="/products?occasion=date-night" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Date 3" />
                  </div>
                </Link>
                <Link to="/products?occasion=date-night" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/trending_look_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Date 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?occasion=date-night" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop romantic picks</Link>
            </div>

            {/* Festival */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Festival</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products?occasion=festival" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fest 1" />
                  </div>
                </Link>
                <Link to="/products?occasion=festival" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fest 2" />
                  </div>
                </Link>
                <Link to="/products?occasion=festival" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/offer_banner.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fest 3" />
                  </div>
                </Link>
                <Link to="/products?occasion=festival" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Fest 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products?occasion=festival" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop ethnic wear</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Up to 80% off | Kids dresses Section */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Up to 80% off | Kids dresses</h2>

          <div style={{
            position: 'relative', display: 'flex', alignItems: 'center',
            backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd', padding: '20px'
          }}>
            {/* Left Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', left: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('kids-scroll').scrollBy({ left: -300, behavior: 'smooth' }); }}
            >
              <ChevronLeftIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>

            <div
              id="kids-scroll"
              style={{
                display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', padding: '10px 0',
                scrollSnapType: 'x mandatory'
              }}
            >
              {[
                { id: 1, img: '/images/product_tshirt.png' },
                { id: 2, img: '/images/product_sneakers.png' },
                { id: 3, img: '/images/hero_banner_1.png' },
                { id: 4, img: '/images/product_watch.png' },
                { id: 5, img: '/images/product_jacket.png' },
                { id: 6, img: '/images/product_handbag.png' },
                { id: 7, img: '/images/trending_look_1.png' }
              ].map((item) => (
                <div key={item.id} style={{ flex: '0 0 160px', scrollSnapAlign: 'start', cursor: 'pointer' }}>
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={item.img} alt="Kids Item" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              className="carousel-arrow"
              style={{
                position: 'absolute', right: '10px', zIndex: 10, width: '40px', height: '40px',
                borderRadius: '50%', background: '#fff', border: '1px solid #ddd', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              onClick={() => { document.getElementById('kids-scroll').scrollBy({ left: 300, behavior: 'smooth' }); }}
            >
              <ChevronRightIcon sx={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Brand Promotional Grid Row */}
      <section style={{ padding: '20px 0 40px' }}>
        <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Zara */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Zara</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_dress.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Zara 1" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_handbag.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Zara 2" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/trending_look_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Zara 3" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Zara 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Explore Zara collection</Link>
            </div>

            {/* H&M */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>H&M</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="HM 1" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="HM 2" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="HM 3" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/trending_look_2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="HM 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop H&M favorites</Link>
            </div>

            {/* Levi's */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Levi's</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Levis 1" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/hero_banner_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Levis 2" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Levis 3" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_sneakers.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Levis 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Shop denim & more</Link>
            </div>

            {/* Nike */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#0F1111', fontFamily: 'var(--font-sans)' }}>Nike</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flexGrow: 1 }}>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_sneakers.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Nike 1" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_jacket.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Nike 2" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_tshirt.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Nike 3" />
                  </div>
                </Link>
                <Link to="/products" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f8f8f8', borderRadius: '4px', overflow: 'hidden', height: '110px' }}>
                    <img src="/images/product_watch.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Nike 4" />
                  </div>
                </Link>
              </div>
              <Link to="/products" style={{ color: '#007185', fontWeight: 500, fontSize: '13px', marginTop: '16px', textDecoration: 'none' }}>Explore Nike sport</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-banner-section" style={{
        background: 'linear-gradient(180deg, transparent, rgba(168, 85, 247, 0.05), transparent)'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ai-banner-card"
            style={{
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.08))',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                background: 'var(--accent-bg)', marginBottom: '20px',
                fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 700, color: 'var(--accent-light)',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} /> AI-Powered
              </div>

              <motion.h2
                key={currentAiSentence}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="ai-banner-title"
                style={{
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.2
                }}
              >
                "{aiData[currentAiSentence].query}"
              </motion.h2>
              <p className="ai-banner-desc" style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}>
                Our AI understands context — occasion, weather, urgency, budget, and your personal style.
                It finds the perfect outfit and ensures it arrives before your event.
              </p>

              <div className="ai-features-list" style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { title: 'Occasion-First Search', desc: 'Describe your event, get perfect outfits', icon: '🎯' },
                  { title: 'Smart Fit Technology', desc: 'Tell us your brand sizes, we match perfectly', icon: '📏' },
                  { title: 'Flash-Bundle Deals', desc: 'AI-curated bundles with 15% discount', icon: '⚡' }
                ].map(f => (
                  <div key={f.title} className="ai-feature-item" style={{
                    display: 'flex', alignItems: 'center',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)'
                  }}>
                    <span className="ai-feature-emoji">{f.icon}</span>
                    <div>
                      <div className="ai-feature-title" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</div>
                      <div className="ai-feature-desc" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-chat-preview" style={{
              display: 'flex', flexDirection: 'column',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)'
            }}>
              {aiData[currentAiSentence].chat.map((msg, i) => (
                <motion.div
                  key={`${currentAiSentence}-${i}`}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                  className="chat-bubble"
                  style={{
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%', fontSize: '13px', lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >{msg.text}</motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className="deals-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title" style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  🔥 Flash Deals
                </h2>
                <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>Limited time offers you don't want to miss</p>
              </div>
            </div>
            <div className="product-grid">
              {deals.slice(0, 4).map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Occasion-First Quick Search */}
      <section className="occasions-section">
        <div className="container">
          <div style={{ textAlign: 'center' }} className="section-header section-header-centered">
            <div>
              <h2 className="section-title" style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                🎯 Shop by <span className="gradient-text">Occasion</span>
              </h2>
              <p className="section-subtitle" style={{ color: 'var(--text-muted)' }}>Tell us where you're going — we'll handle the rest</p>
            </div>
          </div>
          <div className="occasions-grid">
            {[
              { emoji: '💍', label: 'Wedding Guest', query: 'wedding' },
              { emoji: '🎉', label: 'Party Night', query: 'party' },
              { emoji: '💼', label: 'Office Wear', query: 'office' },
              { emoji: '🌹', label: 'Date Night', query: 'date-night' },
              { emoji: '☀️', label: 'Beach Day', query: 'beach' },
              { emoji: '🏋️', label: 'Gym / Sports', query: 'gym' },
              { emoji: '🎓', label: 'Graduation', query: 'graduation' },
              { emoji: '🎸', label: 'Festival', query: 'festival' },
            ].map((occ, i) => (
              <motion.div key={occ.query}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/products?occasion=${occ.query}`} className="occasion-card" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-base)'
                }}>
                  <span className="occasion-emoji">{occ.emoji}</span>
                  <span className="occasion-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {occ.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ── Responsive Styles ── */}
      <style>{`
        /* Arrow click animation */
        @keyframes arrowPulse {
          0% { transform: translateY(-50%) scale(1); }
          30% { transform: translateY(-50%) scale(0.85); }
          60% { transform: translateY(-50%) scale(1.12); }
          100% { transform: translateY(-50%) scale(1); }
        }

        /* ══════ DESKTOP DEFAULTS ══════ */
        .hero-section { min-height: 100vh; }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        .hero-badge {
          padding: 6px 16px;
          margin-bottom: 24px;
          font-size: 13px;
        }
        .hero-title {
          font-size: clamp(36px, 5vw, 64px);
          margin-bottom: 24px;
        }
        .hero-description {
          font-size: 18px;
          margin-bottom: 36px;
          max-width: 500px;
        }
        .hero-cta-group { gap: 16px; }
        .hero-cta-btn { padding: 16px 32px; font-size: 15px; }
        .hero-stats { gap: 40px; margin-top: 48px; }
        .stat-value { font-size: 28px; }
        .stat-label { font-size: 13px; }

        /* Promo Cards */
        .promo-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .promo-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .feature-item {
          padding: 28px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-right: 1px solid var(--border);
        }
        .feature-item:last-child { border-right: none; }
        .feature-icon { width: 48px; height: 48px; }
        .feature-title { font-size: 14px; }
        .feature-desc { font-size: 12px; }

        /* Sections */
        .categories-section { padding: 80px 0px; }
        .featured-section { padding: 0 0 80px; }
        .ai-banner-section { padding: 80px 0; }
        .deals-section { padding: 0 0 80px; }
        .occasions-section { padding: 0 0 80px; }
        .rent-teaser-section { padding: 80px 0; }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .section-header-centered {
          justify-content: center;
        }
        .section-title { font-size: clamp(24px, 4vw, 32px); margin-bottom: 8px; }
        .section-subtitle { font-size: clamp(13px, 2vw, 15px); }

        /* Categories */
        .categories-scroll-wrapper {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding-bottom: 16px;
          margin: 0 -24px;
          padding-left: 24px;
          padding-right: 24px;
          padding-top:16px;
        
        }
        .categories-scroll-wrapper::-webkit-scrollbar { display: none; }
        .categories-scroll-wrapper {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;    /* Firefox */
        }
        .category-card {
          gap: 10px;
          padding: 20px 24px;
          min-width: 120px;
          width: 130px;
        }
        .category-card:hover {
          border-color: var(--accent) !important;
          background: var(--bg-elevated) !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
        }
        .category-emoji { font-size: 32px; line-height: 1; }
        .category-name { font-size: 13px; }
        .category-count { font-size: 11px; }

        /* Occasions */
        .occasions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .occasion-card { gap: 12px; padding: 28px 16px; }
        .occasion-card:hover {
          border-color: var(--accent) !important;
          background: var(--bg-elevated) !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(168, 85, 247, 0.15);
        }
        .occasion-emoji { font-size: 36px; }
        .occasion-label { font-size: 13px; }

        /* AI Banner */
        .ai-banner-card {
          padding: 60px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }
        .ai-banner-title { font-size: 36px; margin-bottom: 16px; }
        .ai-banner-desc { font-size: 16px; margin-bottom: 32px; }
        .ai-features-list { gap: 16px; }
        .ai-feature-item { gap: 16px; padding: 16px; }
        .ai-feature-emoji { font-size: 24px; }
        .ai-feature-title { font-size: 14px; }
        .ai-feature-desc { font-size: 12px; }
        .ai-chat-preview { gap: 12px; padding: 24px; }
        .chat-bubble { padding: 14px 18px; font-size: 13px; }

        /* Rent */
        .rent-card { padding: 60px 48px; }
        .rent-title {
          font-size: clamp(28px, 4vw, 42px);
          margin-bottom: 16px;
        }
        .rent-desc { font-size: 17px; margin-bottom: 12px; }
        .rent-price-hint { font-size: 14px; margin-bottom: 36px; }
        .rent-cta-group { gap: 12px; }
        .rent-cta-btn { padding: 16px 36px; font-size: 15px; }
        .rent-stats { gap: 32px; margin-top: 40px; }

        /* ══════ LARGE TABLET (≤ 1024px) ══════ */
        @media (max-width: 1024px) {
          .hero-grid { gap: 40px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-item:nth-child(2) { border-right: none; }
          .ai-banner-card { padding: 40px; gap: 32px; }
          .rent-card { padding: 48px 36px; }
          .occasions-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
          
        }

        /* ══════ TABLET (≤ 768px) ══════ */
        @media (max-width: 768px) {
          .hero-section { min-height: 49vh; }
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px;
          }
          .hero-badge { padding: 5px 12px; font-size: 12px; margin-bottom: 18px; }
          .hero-title { margin-bottom: 18px; }
          .hero-description { font-size: 15px; margin-bottom: 28px; max-width: 100%; }
          .hero-cta-group { gap: 12px; }
          .hero-cta-btn { padding: 12px 24px; font-size: 14px; }
          .hero-stats { gap: 28px; margin-top: 36px; }
          .stat-value { font-size: 24px; }
          .stat-label { font-size: 12px; }

          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .feature-item {
            padding: 20px 16px;
            gap: 12px;
          }
          .feature-item:nth-child(2) { border-right: none; }
          .feature-icon { width: 40px; height: 40px; }
          .feature-title { font-size: 13px; }
          .feature-desc { font-size: 11px; }

          .categories-section { padding: 48px 0; }
          .featured-section { padding: 0 0 48px; }
          .ai-banner-section { padding: 48px 0; }
          .deals-section { padding: 0 0 48px; }
          .occasions-section { padding: 0 0 48px; }
          .rent-teaser-section { padding: 48px 0; }

          .section-header { margin-bottom: 28px; }
          .section-title { margin-bottom: 6px; }

          .categories-scroll-wrapper {
            gap: 10px;
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
          }
          .category-card {
            padding: 18px 20px;
            min-width: 110px;
            width: 120px;
          }

          .occasions-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
          .occasion-card { padding: 20px 12px; gap: 10px; }
          .occasion-emoji { font-size: 30px; }
          .occasion-label { font-size: 12px; }

          .ai-banner-card {
            grid-template-columns: 1fr !important;
            padding: 32px !important;
            gap: 28px;
          }
          .ai-banner-title { font-size: 26px; }
          .ai-banner-desc { font-size: 14px; margin-bottom: 24px; }
          .ai-feature-item { padding: 12px; gap: 12px; }
          .ai-feature-emoji { font-size: 20px; }
          .ai-feature-title { font-size: 13px; }
          .ai-feature-desc { font-size: 11px; }
          .ai-chat-preview { padding: 16px; gap: 10px; }
          .chat-bubble { padding: 10px 14px; font-size: 12px; }

          .rent-card { padding: 36px 24px; }
          .rent-desc { font-size: 15px; }
          .rent-price-hint { font-size: 13px; margin-bottom: 28px; }
          .rent-cta-group { gap: 10px; }
          .rent-cta-btn { padding: 12px 24px; font-size: 14px; }
          .rent-stats { gap: 24px; margin-top: 32px; }
        }

        /* ══════ SMALL PHONE (≤ 480px) ══════ */
        @media (max-width: 480px) {
          .hero-section { min-height: 80vh;}
          .hero-badge { padding: 4px 10px; font-size: 11px; margin-bottom: 14px; }
          .hero-title { margin-bottom: 14px; }
          .hero-description { font-size: 14px; margin-bottom: 22px; line-height: 1.6; }
          .hero-cta-group { gap: 10px; }
          .hero-cta-btn { padding: 10px 20px; font-size: 13px; }
          .hero-stats { gap: 20px; margin-top: 28px; }
          .stat-value { font-size: 20px; }
          .stat-label { font-size: 11px; }

          .features-grid { grid-template-columns: 1fr !important; }
          .feature-item {
            padding: 16px 14px;
            gap: 12px;
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .feature-item:last-child { border-bottom: none; }
          .feature-icon { width: 36px; height: 36px; }
          .feature-title { font-size: 12px; }
          .feature-desc { font-size: 11px; }

          .categories-section { padding: 36px 0; }
          .featured-section { padding: 0 0 36px; }
          .ai-banner-section { padding: 36px 0; }
          .deals-section { padding: 0 0 36px; }
          .occasions-section { padding: 0 0 36px; }
          .rent-teaser-section { padding: 36px 0; }

          .section-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
            margin-bottom: 20px;
          }
          .section-header-centered {
            align-items: center !important;
          }

          .categories-scroll-wrapper {
            gap: 8px;
            margin: 0 -12px;
            padding-left: 12px;
            padding-right: 12px;
            padding-bottom: 12px;
          }
          .category-card {
            padding: 14px 14px;
            min-width: 95px;
            width: 105px;
          }
          .category-emoji { font-size: 26px; }
          .category-name { font-size: 11px; }
          .category-count { font-size: 10px; }

          .occasions-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .occasion-card { padding: 18px 10px; gap: 8px; }
          .occasion-emoji { font-size: 26px; }
          .occasion-label { font-size: 11px; }

          .ai-banner-card { padding: 24px 16px !important; gap: 20px; }
          .ai-banner-title { font-size: 22px; margin-bottom: 12px; }
          .ai-banner-desc { font-size: 13px; margin-bottom: 18px; }
          .ai-features-list { gap: 10px; }
          .ai-feature-item { padding: 10px; gap: 10px; }
          .ai-feature-emoji { font-size: 18px; }
          .ai-feature-title { font-size: 12px; }
          .ai-feature-desc { font-size: 10px; }
          .ai-chat-preview { padding: 12px; gap: 8px; }
          .chat-bubble { padding: 8px 12px; font-size: 11px; }

          .rent-card { padding: 28px 16px; }
          .rent-title { margin-bottom: 12px; }
          .rent-desc { font-size: 14px; margin-bottom: 8px; }
          .rent-price-hint { font-size: 12px; margin-bottom: 24px; }
          .rent-cta-group { gap: 8px; }
          .rent-cta-btn { padding: 10px 20px; font-size: 13px; }
          .rent-stats { gap: 16px; margin-top: 28px; }
          .stat-value { font-size: 18px; }
          .stat-label { font-size: 10px; }
        }

        /* ══════ EXTRA SMALL (≤ 360px) ══════ */
        @media (max-width: 360px) {
    
          .hero-description { font-size: 15px; }
          .hero-cta-group { flex-direction: column; gap: 8px; }
          .hero-cta-btn { width: 100%; justify-content: center; }
          .hero-stats { gap: 16px; }
          .stat-value { font-size: 18px; }
          

          .category-card {
            padding: 12px 10x;
            min-width: 85px;
            width: 95px;
          }
          .category-emoji { font-size: 22px; }
          .category-name { font-size: 10px; }

          .occasions-grid { gap: 6px; }
          .occasion-card { padding: 14px 8px; }
          .occasion-emoji { font-size: 22px; }
          .occasion-label { font-size: 10px; }

          .rent-cta-group { flex-direction: column; }
          .rent-cta-btn { width: 100%; justify-content: center; }
          .rent-stats { flex-wrap: wrap; }
        }

        /* ══════ LARGE SCREEN ENHANCEMENT ══════ */
        @media (min-width: 1200px) {
          .categories-scroll-wrapper {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
