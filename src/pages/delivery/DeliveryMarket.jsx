import { motion } from 'framer-motion';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCartRounded';

export default function DeliveryMarket() {
  const products = [
    { id: 1, name: 'FlashFit Pro Thermal Bag', price: '$35.00', image: 'https://images.unsplash.com/photo-1590845947306-6962f3a6122d?width=400', desc: 'Keeps food hot or cold for up to 4 hours.' },
    { id: 2, name: 'Reflective Rain Jacket', price: '$45.00', image: 'https://images.unsplash.com/photo-1544644140-5e3d7cb0efb2?width=400', desc: 'High visibility, 100% waterproof.' },
    { id: 3, name: 'PowerBank 20000mAh', price: '$25.00', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?width=400', desc: 'Keep your phone charged all day.' },
    { id: 4, name: 'Phone Holder Mount', price: '$15.00', image: 'https://images.unsplash.com/photo-1588647900762-23c218204642?width=400', desc: 'Secure handlebar mount for navigation.' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '90px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: '32px', color: '#29ffc6' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)' }}>Rider Market</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Gear up for your deliveries</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
        {products.map(product => (
          <motion.div 
            key={product.id}
            whileHover={{ y: -4 }}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ height: '140px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{product.name}</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, flex: 1 }}>{product.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#29ffc6' }}>{product.price}</span>
                <button style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>
                  <AddShoppingCartIcon sx={{ fontSize: '16px' }} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
