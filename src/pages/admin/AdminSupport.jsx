import { motion } from 'framer-motion';
import SupportAgentIcon from '@mui/icons-material/SupportAgentRounded';
import EmailIcon from '@mui/icons-material/EmailRounded';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineRounded';

export default function AdminSupport() {
  const tickets = [
    { id: 'T-001', user: 'Priya Sharma', subject: 'Order not delivered', status: 'open', date: '2026-04-16' },
    { id: 'T-002', user: 'Rajesh Kumar', subject: 'Wrong product received', status: 'in-progress', date: '2026-04-15' },
    { id: 'T-003', user: 'Anita Desai', subject: 'Refund not processed', status: 'open', date: '2026-04-15' },
    { id: 'T-004', user: 'Vikram Singh', subject: 'Account access issue', status: 'resolved', date: '2026-04-14' },
    { id: 'T-005', user: 'Meera Patel', subject: 'Delivery partner complaint', status: 'resolved', date: '2026-04-13' },
  ];

  const getStatusStyle = (status) => {
    const map = {
      open: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
      'in-progress': { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
      resolved: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    };
    return map[status] || map.open;
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Support Center</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage user support tickets and inquiries</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Open Tickets', value: '12', color: '#f59e0b' },
          { label: 'In Progress', value: '5', color: '#3b82f6' },
          { label: 'Resolved Today', value: '8', color: '#10b981' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '20px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '80px 1.5fr 2fr 1fr 1fr',
          padding: '14px 24px', background: 'var(--bg-elevated)',
          fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>ID</span>
          <span>User</span>
          <span>Subject</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {tickets.map((ticket, i) => {
          const s = getStatusStyle(ticket.status);
          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'grid', gridTemplateColumns: '80px 1.5fr 2fr 1fr 1fr',
                padding: '14px 24px', borderTop: '1px solid var(--border)',
                alignItems: 'center', fontSize: '14px', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontWeight: 600, color: '#FF6B6B', fontSize: '13px' }}>{ticket.id}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.user}</span>
              <span style={{ color: 'var(--text-muted)' }}>{ticket.subject}</span>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                background: s.bg, color: s.color, textTransform: 'uppercase', width: 'fit-content'
              }}>
                {ticket.status}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{ticket.date}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
