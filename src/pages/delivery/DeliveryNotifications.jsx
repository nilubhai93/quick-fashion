import { motion } from 'framer-motion';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActiveRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import LocalOfferIcon from '@mui/icons-material/LocalOfferRounded';

export default function DeliveryNotifications() {
  const notifications = [
    { id: 1, title: 'New Delivery Request', text: 'You have a new delivery request near your location.', time: '2m ago', type: 'order', isNew: true },
    { id: 2, title: 'Tip Received', text: 'Customer added $5.00 tip for your last delivery.', time: '1h ago', type: 'payment', isNew: true },
    { id: 3, title: 'Peak Pay Active', text: 'Earn extra $2 per delivery in Downtown area.', time: '3h ago', type: 'offer', isNew: false },
    { id: 4, title: 'Weekly Earnings Statement', text: 'Your earnings statement for last week is ready.', time: '1d ago', type: 'payment', isNew: false },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <NotificationsActiveIcon sx={{ color: '#3b82f6' }} />;
      case 'payment': return <PaymentIcon sx={{ color: '#10b981' }} />;
      case 'offer': return <LocalOfferIcon sx={{ color: '#f59e0b' }} />;
      default: return <NotificationsActiveIcon sx={{ color: '#8b5cf6' }} />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '90px' }}>
      <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
        Notifications
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notifications.map(notif => (
          <motion.div 
            key={notif.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '16px',
              background: notif.isNew ? 'rgba(41,255,198,0.05)' : 'var(--bg-card)',
              border: notif.isNew ? '1px solid rgba(41,255,198,0.2)' : '1px solid var(--border)',
              borderRadius: '16px',
              display: 'flex',
              gap: '16px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              {getIcon(notif.type)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: notif.isNew ? 700 : 600, color: 'var(--text-primary)' }}>
                  {notif.title}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{notif.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {notif.text}
              </p>
            </div>
            
            {notif.isNew && (
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#29ffc6', flexShrink: 0, marginTop: '6px' }} />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
