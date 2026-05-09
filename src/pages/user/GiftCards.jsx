import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const giftCardData = [
  {
    id: 1,
    title: 'Birthday Bash',
    emoji: '🎂',
    icon: <CakeRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#f472b6',
    gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    amounts: [500, 1000, 2000, 5000],
    description: 'Make their birthday unforgettable with the gift of fashion!',
    tag: 'Most Popular',
  },
  {
    id: 2,
    title: 'Wedding Wishes',
    emoji: '💒',
    icon: <FavoriteRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#c084fc',
    gradient: 'linear-gradient(135deg, #c084fc, #a855f7)',
    amounts: [2000, 5000, 10000, 25000],
    description: 'The perfect gift for the perfect couple. Let them choose their style!',
    tag: 'Premium',
  },
  {
    id: 3,
    title: 'Festival Joy',
    emoji: '🎊',
    icon: <CelebrationRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    amounts: [500, 1000, 2500],
    description: 'Spread the festive cheer — Diwali, Eid, Christmas, any occasion!',
    tag: 'Seasonal',
  },
  {
    id: 4,
    title: 'Thank You',
    emoji: '🙏',
    icon: <RedeemRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    amounts: [300, 500, 1000, 2000],
    description: 'Say thanks with style. A thoughtful token of appreciation.',
    tag: 'Trending',
  },
  {
    id: 5,
    title: 'Congratulations',
    emoji: '🏆',
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    amounts: [1000, 2000, 5000],
    description: 'Celebrate their big win — promotion, new job, or graduation!',
    tag: 'Special',
  },
  {
    id: 6,
    title: 'Just Because',
    emoji: '💝',
    icon: <CardGiftcardRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    amounts: [300, 500, 1000, 2000, 5000],
    description: 'No occasion needed — surprise someone you love with fashion!',
    tag: 'Classic',
  },
  {
    id: 7,
    title: 'New Job',
    emoji: '💼',
    icon: <WorkRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    amounts: [1000, 2500, 5000],
    description: 'Help them dress for success in their new role!',
    tag: 'Professional',
  },
  {
    id: 8,
    title: 'Graduation',
    emoji: '🎓',
    icon: <SchoolRoundedIcon sx={{ fontSize: 28 }} />,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    amounts: [500, 1000, 2000, 5000],
    description: 'They earned it! Celebrate their achievement with premium style.',
    tag: 'Milestone',
  },
];

export default function GiftCards() {
  const { user } = useAuth();
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);

  const userName = user?.name?.split(' ')[0] || 'You';

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
            <CardGiftcardRoundedIcon sx={{ fontSize: 18, color: '#4a7fd4' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6b9ae8', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Gift Cards
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800,
            fontFamily: 'var(--font-display)', lineHeight: 1.1, marginBottom: '12px',
          }}>
            Give the Gift of{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3a6bc5, #c9a96e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Fashion</span>
          </h1>

          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)',
            maxWidth: '620px', margin: '0 auto 10px', lineHeight: 1.6,
          }}>
            Hey {userName}! Choose the perfect FlashFit gift card for every occasion.
          </p>
        </motion.div>
      </div>

      {/* Gift Cards Grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {giftCardData.map((card, i) => (
            <motion.div key={card.id}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -6, boxShadow: `0 16px 48px ${card.color}20` }}
              style={{
                borderRadius: '20px', overflow: 'hidden',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative',
              }}
              onClick={() => { setSelectedCard(card.id === selectedCard ? null : card.id); setSelectedAmount(null); }}
            >
              {/* Card Header */}
              <div style={{
                background: card.gradient, padding: '28px 24px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '-20px', right: '-20px',
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                }} />
                <div style={{
                  position: 'absolute', bottom: '-10px', left: '40%',
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                  <div>
                    <div style={{ color: 'white', marginBottom: '8px', opacity: 0.9 }}>{card.icon}</div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{card.title}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{card.emoji} FlashFit Gift Card</p>
                  </div>
                  <span style={{
                    padding: '4px 12px', borderRadius: '50px',
                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                    color: 'white', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                  }}>{card.tag}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {card.description}
                </p>

                {/* Amount Options */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {card.amounts.map(amt => (
                    <button key={amt}
                      onClick={(e) => { e.stopPropagation(); setSelectedCard(card.id); setSelectedAmount(amt); }}
                      style={{
                        padding: '8px 16px', borderRadius: '50px',
                        background: selectedCard === card.id && selectedAmount === amt
                          ? card.gradient : 'var(--bg-elevated)',
                        color: selectedCard === card.id && selectedAmount === amt
                          ? 'white' : 'var(--text-primary)',
                        border: `1px solid ${selectedCard === card.id && selectedAmount === amt ? 'transparent' : 'var(--border)'}`,
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Buy Button */}
                {selectedCard === card.id && selectedAmount && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px',
                      background: card.gradient, color: 'white',
                      fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
                      boxShadow: `0 4px 16px ${card.color}30`,
                    }}
                  >
                    Buy ₹{selectedAmount.toLocaleString()} Gift Card →
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        padding: '60px 24px', borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, transparent, rgba(58,107,197,0.03))',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '40px' }}>
            How Gift Cards Work
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { step: '1', title: 'Choose a Card', desc: 'Pick a theme and amount', emoji: '🎁' },
              { step: '2', title: 'Personalize', desc: 'Add a message for them', emoji: '✍️' },
              { step: '3', title: 'Send Instantly', desc: 'Delivered via email or SMS', emoji: '📨' },
              { step: '4', title: 'They Shop!', desc: 'Redeemable on any product', emoji: '🛍️' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  padding: '28px 20px', borderRadius: '16px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{s.emoji}</div>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, #3a6bc5, #c9a96e)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800,
                }}>{s.step}</div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>{s.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
