import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyRounded';

const chartData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 72 },
  { month: 'Mar', value: 58 },
  { month: 'Apr', value: 85 },
  { month: 'May', value: 92 },
  { month: 'Jun', value: 78 },
  { month: 'Jul', value: 95 },
];

const maxVal = Math.max(...chartData.map(d => d.value));

export default function AdminAnalytics() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Platform performance insights</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Monthly Revenue', value: '₹4.2L', icon: <AttachMoneyIcon />, color: '#10b981' },
          { label: 'New Users', value: '342', icon: <PeopleIcon />, color: '#3b82f6' },
          { label: 'Orders Today', value: '89', icon: <ShoppingCartIcon />, color: '#a855f7' },
          { label: 'Conversion Rate', value: '3.2%', icon: <TrendingUpIcon />, color: '#FF6B6B' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: kpi.color }}>
              {kpi.icon}
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
          Monthly Revenue Trend
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 16px' }}>
          {chartData.map((d, i) => (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / maxVal) * 160}px` }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                style={{
                  width: '100%', maxWidth: '48px',
                  background: 'linear-gradient(180deg, #FF6B6B 0%, #FF8E53 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  minHeight: '8px',
                  position: 'relative'
                }}
              >
                <span style={{
                  position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)'
                }}>
                  {d.value}%
                </span>
              </motion.div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px', marginTop: '20px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Top Categories
        </h2>
        {[
          { name: 'T-Shirts', percentage: 34, color: '#FF6B6B' },
          { name: 'Dresses', percentage: 28, color: '#a855f7' },
          { name: 'Jeans', percentage: 22, color: '#3b82f6' },
          { name: 'Accessories', percentage: 16, color: '#f59e0b' },
        ].map((cat) => (
          <div key={cat.name} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: cat.color }}>{cat.percentage}%</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '4px', background: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
