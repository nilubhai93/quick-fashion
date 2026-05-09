import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { deliveryAPI } from '../../api';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TimelineIcon from '@mui/icons-material/TimelineRounded';
import DoneAllIcon from '@mui/icons-material/DoneAllRounded';
import TwoWheelerIcon from '@mui/icons-material/TwoWheelerRounded';

export default function DeliveryDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profRes, statsRes] = await Promise.all([
        deliveryAPI.getProfile(),
        deliveryAPI.getEarnings()
      ]);
      setProfile(profRes.data.user);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.5px' }}>Welcome back, {profile?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Here's your performance overview for today</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Today's Earnings */}
        <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--gradient-primary)', padding: '20px', borderRadius: 'var(--radius-xl)', color: 'white', boxShadow: '0 10px 20px var(--accent-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Today's Earnings</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900 }}>₹{stats?.todayEarnings || 0}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>from {stats?.todayOrders || 0} orders</div>
        </motion.div>

        {/* Today's Orders */}
        <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <DoneAllIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Orders Done</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)' }}>{stats?.todayOrders || 0}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>completed today</div>
        </motion.div>

        {/* Monthly Earnings */}
        <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <TimelineIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Monthly Income</div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)' }}>₹{stats?.monthlyEarnings || 0}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>this month's total</div>
        </motion.div>

        {/* Active Orders Status */}
        <motion.div whileHover={{ y: -4 }} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <TwoWheelerIcon sx={{ fontSize: '18px' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Current Status</div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: profile?.deliveryProfile?.isOnline ? 'var(--success)' : 'var(--error)' }}>
            {profile?.deliveryProfile?.isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
            {profile?.deliveryProfile?.currentOrderId ? '1 active assignment' : 'waiting for orders'}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
