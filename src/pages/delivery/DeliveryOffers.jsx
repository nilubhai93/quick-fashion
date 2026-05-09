import { motion } from 'framer-motion';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import ElectricBoltIcon from '@mui/icons-material/ElectricBoltRounded';

export default function DeliveryOffers() {
  const offers = [
    { id: 1, title: 'Downtown Peak Pay', amount: '+$2.50', desc: 'Extra per delivery in downtown area.', time: 'Active until 8:00 PM', type: 'peak' },
    { id: 2, title: 'Weekend Quest', amount: '$50 Bonus', desc: 'Complete 25 deliveries between Fri-Sun.', time: 'Expires in 2 days', type: 'quest' },
    { id: 3, title: 'Rain Boost', amount: '+1.5x Fare', desc: 'Surge pricing due to bad weather conditions.', time: 'Active now', type: 'surge' },
  ];

  const getIcon = (type) => {
    if (type === 'peak') return <ElectricBoltIcon sx={{ color: '#f59e0b', fontSize: '28px' }} />;
    if (type === 'surge') return <ElectricBoltIcon sx={{ color: '#3b82f6', fontSize: '28px' }} />;
    return <LocalOfferIcon sx={{ color: '#10b981', fontSize: '28px' }} />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '90px' }}>
      <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Offers & Quests
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Complete these offers to maximize your earnings.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {offers.map(offer => (
          <motion.div 
            key={offer.id}
            whileHover={{ y: -5 }}
            style={{
              background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(18,18,28,0) 100%)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background design */}
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
               <DirectionsBikeIcon sx={{ fontSize: '140px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIcon(offer.type)}
              </div>
              <div style={{ background: 'rgba(41,255,198,0.1)', color: '#29ffc6', padding: '6px 12px', borderRadius: '20px', fontWeight: 800, fontSize: '15px' }}>
                {offer.amount}
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{offer.title}</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{offer.desc}</p>
            
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{offer.time}</span>
              <button style={{ background: 'transparent', border: 'none', color: '#29ffc6', fontWeight: 700, cursor: 'pointer' }}>View Details</button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
