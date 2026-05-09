import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../api/index';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import LocalMallIcon from '@mui/icons-material/LocalMallRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function SellerWallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletStats = async () => {
      try {
        const res = await api.get('/seller/dashboard/wallet-stats');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load wallet stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ paddingTop: '0' }}>
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '0' }}>My Wallet</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '1px', fontWeight: 500 }}>Track your performance and revenue.</p>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <motion.div variants={itemVariants} className="glass" style={{ padding: '14px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', opacity: 0.08 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 60, color: 'var(--accent)' }} />
          </div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total Revenue</p>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)', marginBottom: '2px' }}>₹{data?.totalRevenue?.toLocaleString() || 0}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '11px', fontWeight: 700 }}>
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            <span>Net Earnings</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass" style={{ padding: '14px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-5px', right: '-5px', opacity: 0.08 }}>
            <LocalMallIcon sx={{ fontSize: 60, color: 'var(--accent)' }} />
          </div>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Units Sold</p>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '2px' }}>{data?.totalUnitsSold || 0}</h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Across all masterpieces</p>
        </motion.div>
      </div>

      {/* Product-wise Breakdown */}
      <motion.div variants={itemVariants} className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <div style={{ padding: '6px', background: 'var(--accent-bg)', borderRadius: '8px' }}>
            <TrendingUpIcon sx={{ color: 'var(--accent)', fontSize: 18 }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Sales Breakdown</h3>
        </div>

        {data?.productSales?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Product</th>
                  <th style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Price</th>
                  <th style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Sold</th>
                  <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.productSales.map((product) => (
                  <tr key={product._id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={product.image} alt="" style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>{product.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '13px' }}>₹{product.price.toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ padding: '3px 10px', background: 'var(--bg-secondary)', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {product.unitsSold}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: 'var(--accent)', fontSize: '13px' }}>₹{product.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '20px', opacity: 0.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: 48 }} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No Sales Data Yet</h4>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Start selling to see your revenue breakdown here!</p>
          </div>
        )}
      </motion.div>

      <style>{`
        .table-row-hover:hover {
          background: rgba(30, 77, 183, 0.02);
        }
        .glass {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
        }
      `}</style>
    </motion.div>
  );
}
