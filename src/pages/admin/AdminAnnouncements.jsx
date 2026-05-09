import { useState } from 'react';
import { motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/SendRounded';
import CampaignIcon from '@mui/icons-material/CampaignRounded';

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [sent, setSent] = useState(false);

  const announcements = [
    { title: 'Flash Sale Weekend', message: 'All products 20% off this weekend!', target: 'users', date: '2026-04-15' },
    { title: 'New Delivery Guidelines', message: 'Updated packing and delivery protocols.', target: 'delivery', date: '2026-04-12' },
    { title: 'Seller Fee Update', message: 'Commission rates updated effective May 1st.', target: 'sellers', date: '2026-04-10' },
  ];

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setTitle(''); setMessage(''); }, 2000);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit'
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Announcements</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Broadcast messages to users, sellers, or partners</p>
      </div>

      {/* Compose */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px'
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CampaignIcon sx={{ color: '#FF6B6B' }} /> New Announcement
        </h2>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" required style={inputStyle} />
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message..." required rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={target} onChange={e => setTarget(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="all">All Users</option>
              <option value="users">Customers Only</option>
              <option value="sellers">Sellers Only</option>
              <option value="delivery">Delivery Partners</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px',
                background: sent ? '#10b981' : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                color: '#fff', fontWeight: 700, fontSize: '14px',
                border: 'none', cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              <SendIcon sx={{ fontSize: '18px' }} />
              {sent ? 'Sent!' : 'Send Announcement'}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* History */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Previous Announcements</h2>
        {announcements.map((a, i) => (
          <div key={i} style={{
            padding: '16px 0', borderBottom: i < announcements.length - 1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{a.title}</span>
              <span style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', textTransform: 'uppercase'
              }}>{a.target}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{a.message}</p>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
