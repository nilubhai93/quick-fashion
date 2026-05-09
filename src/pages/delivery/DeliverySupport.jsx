import React from 'react';
import { motion } from 'framer-motion';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalkRounded';
import EmailIcon from '@mui/icons-material/EmailRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function DeliverySupport() {
  const contacts = [
    { name: 'Driver Hotline', detail: '1800-FLASH-FIT', icon: <PhoneInTalkIcon />, color: 'var(--accent)' },
    { name: 'WhatsApp Support', detail: '+91 98765 43210', icon: <WhatsAppIcon />, color: '#25D366' },
    { name: 'Email Support', detail: 'partners@flashfit.com', icon: <EmailIcon />, color: 'var(--info)' },
  ];

  return (
    <div style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Partner Support</h1>
        <p style={{ color: 'var(--text-secondary)' }}>We're here to help you 24/7 with any delivery or payment issues.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {contacts.map((contact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '24px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px'
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: `${contact.color}15`, color: contact.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {contact.icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{contact.name}</h3>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{contact.detail}</p>
          </motion.div>
        ))}
      </div>

      <div style={{ 
        padding: '32px', borderRadius: 'var(--radius-xl)', background: 'rgba(168,85,247,0.05)', 
        border: '1px solid rgba(168,85,247,0.1)', display: 'flex', gap: '24px', alignItems: 'center'
      }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '16px', background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
        }}>
          <SupportAgentIcon sx={{ fontSize: '32px' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Live Chat Support</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            Need immediate help with a live order? Start a chat with our dispatch team.
          </p>
          <button className="btn btn-primary btn-sm" style={{ padding: '10px 24px' }}>Start Chat Now</button>
        </div>
      </div>
    </div>
  );
}
