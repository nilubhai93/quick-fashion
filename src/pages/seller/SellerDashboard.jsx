import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../api/index';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Rounded';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyRounded';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturnRounded';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/seller/dashboard/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><CircularProgress sx={{ color: 'var(--accent)' }}/></div>;
  }

  const statCards = [
    { 
      title: 'Realized Revenue', 
      value: `₹${stats?.totalRevenue || 0}`, 
      icon: <AttachMoneyOutlinedIcon sx={{ fontSize: '28px', color: '#10b981' }} />, 
      bg: 'rgba(16, 185, 129, 0.1)',
      subtitle: 'From delivered orders'
    },
    { 
      title: 'Pending Approve', 
      value: stats?.toApproveCount || 0, 
      icon: <CheckCircleIcon sx={{ fontSize: '28px', color: '#f59e0b' }} />, 
      bg: 'rgba(245, 158, 11, 0.1)',
      subtitle: 'Needs confirmation'
    },
    { 
      title: 'Active Orders', 
      value: stats?.pendingOrders || 0, 
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: '28px', color: '#3b82f6' }} />, 
      bg: 'rgba(59, 130, 246, 0.1)',
      subtitle: 'Total ongoing'
    },
    { 
      title: 'Completed (Month)', 
      value: stats?.monthlyOrders || 0, 
      icon: <TrendingUpIcon sx={{ fontSize: '28px', color: '#8b5cf6' }} />, 
      bg: 'rgba(139, 92, 246, 0.1)',
      subtitle: 'Delivered this month'
    },
    { 
      title: 'Active Inventory', 
      value: stats?.activeProducts || 0, 
      icon: <Inventory2OutlinedIcon sx={{ fontSize: '28px', color: '#a855f7' }} />, 
      bg: 'rgba(168, 85, 247, 0.1)',
      subtitle: `Total: ${stats?.totalProducts || 0}`
    },
    { 
      title: 'Returns', 
      value: stats?.totalReturns || 0, 
      icon: <AssignmentReturnIcon sx={{ fontSize: '28px', color: '#ef4444' }} />, 
      bg: 'rgba(239, 68, 68, 0.1)',
      subtitle: `Loss: ₹${stats?.returnRevenueLost || 0}`
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Seller Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '1px', fontWeight: 500 }}>Live performance tracking & metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', 
            padding: '14px', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.title}</p>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '1px' }}>{stat.value}</h3>
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '1px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Bar Chart: Revenue */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUpIcon sx={{ color: 'var(--accent)' }} /> 7-Day Revenue Trend
          </h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            {stats?.salesData?.map((day, i) => {
              const maxRev = Math.max(...stats.salesData.map(d => d.revenue), 100);
              const height = (day.revenue / maxRev) * 160;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>₹{Math.round(day.revenue)}</div>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${height}px` }}
                    style={{ width: '100%', background: 'var(--gradient-primary)', borderRadius: '4px 4px 0 0', minHeight: '2px' }} />
                  <div style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', transform: 'rotate(-45deg)', marginTop: '4px' }}>
                    {day.date.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart: Order Status */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Order Status Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', height: '200px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '160px', height: '160px', transform: 'rotate(-90deg)' }}>
              {(() => {
                let cumulativePercent = 0;
                const total = stats?.statusData?.reduce((acc, s) => acc + s.value, 0) || 1;
                const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7'];
                
                return stats?.statusData?.map((s, i) => {
                  const percent = s.value / total;
                  const startX = Math.cos(2 * Math.PI * cumulativePercent);
                  const startY = Math.sin(2 * Math.PI * cumulativePercent);
                  cumulativePercent += percent;
                  const endX = Math.cos(2 * Math.PI * cumulativePercent);
                  const endY = Math.sin(2 * Math.PI * cumulativePercent);
                  const largeArcFlag = percent > 0.5 ? 1 : 0;
                  const pathData = `M 50 50 L ${50 + 40 * startX} ${50 + 40 * startY} A 40 40 0 ${largeArcFlag} 1 ${50 + 40 * endX} ${50 + 40 * endY} Z`;
                  
                  return <path key={i} d={pathData} fill={colors[i % colors.length]} stroke="var(--bg-card)" strokeWidth="1" />;
                });
              })()}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {stats?.statusData?.map((s, i) => {
                const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7'];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors[i % colors.length] }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{s.name} ({s.value})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Recently Added</h2>
        
        {stats?.recentProducts?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recentProducts.map(product => (
              <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <img src={product.images[0]} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{product.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{product.brand} &bull; {product.category}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{product.price.toLocaleString()}</p>
                  <span style={{ 
                    display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                    background: product.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: product.isActive ? '#10b981' : '#ef4444', marginTop: '2px'
                  }}>
                    {product.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            You haven't added any products yet. Go to "Add Product" to get started!
          </div>
        )}
      </div>

    </motion.div>
  );
}
