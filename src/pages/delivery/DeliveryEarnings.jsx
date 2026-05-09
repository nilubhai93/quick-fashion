import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownwardRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOnRounded';
import WarningIcon from '@mui/icons-material/WarningRounded';
import { deliveryAPI } from '../../api';
import CircularProgress from '@mui/material/CircularProgress';

export default function DeliveryEarnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeTab, setActiveTab] = useState('deliveries');

  const fetchEarnings = async () => {
    try {
      const res = await deliveryAPI.getEarnings();
      setData(res.data);
    } catch (e) {
      console.error('Failed to fetch earnings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handlePay = async () => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount');
    if (amount > data.cashCollected) return alert('Exceeds current balance');

    setPaying(true);
    try {
      await deliveryAPI.payCompany(amount);
      await fetchEarnings();
      setShowPayModal(false);
      setPayAmount('');
    } catch (e) {
      alert(e.response?.data?.error || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: 'var(--accent)' }} />
    </div>
  );

  const { cashCollected = 0, totalEarnings = 0, cashLimit = 2500, isBlocked = false, recentDeliveries = [] } = data || {};

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '0 20px 100px', maxWidth: '700px' }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '2px', letterSpacing: '-0.5px' }}>Earnings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Financial overview and cash management</p>
      </div>

      {isBlocked && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '12px', 
            borderRadius: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' 
          }}>
          <WarningIcon sx={{ color: '#ef4444', fontSize: '20px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px' }}>Limit Exceeded!</div>
            <div style={{ fontSize: '11px', color: '#f87171' }}>Remit cash to company to accept new orders.</div>
          </div>
        </motion.div>
      )}

      {/* Main Balances Card */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginBottom: '20px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Current COD Cash</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>₹{cashCollected.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Limit</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: isBlocked ? '#ef4444' : 'var(--text-secondary)' }}>₹{cashLimit.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', marginBottom: '16px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (cashCollected / cashLimit) * 100)}%` }}
            style={{ height: '100%', background: isBlocked ? '#ef4444' : 'var(--gradient-primary)' }}
          />
        </div>

        <button 
          onClick={() => setShowPayModal(true)}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'var(--gradient-primary)', border: 'none', color: '#fff', fontWeight: 700, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px'
          }}
        >
          <ArrowDownwardIcon sx={{ fontSize: '18px' }} /> Remit Cash
        </button>
      </div>

      {/* Lifetime Earnings */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px'
      }}>
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Lifetime Earnings</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#29ffc6' }}>₹{totalEarnings.toLocaleString()}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>₹10/km</div>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Deliveries</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>{recentDeliveries.length}+</div>
        </div>
      </div>

      {/* History Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('deliveries')}
          style={{ 
            flex: 1, padding: '8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
            background: activeTab === 'deliveries' ? 'var(--bg-elevated)' : 'transparent',
            border: activeTab === 'deliveries' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'deliveries' ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer', textTransform: 'uppercase'
          }}
        >
          Delivery History
        </button>
        <button 
          onClick={() => setActiveTab('remittance')}
          style={{ 
            flex: 1, padding: '8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800,
            background: activeTab === 'remittance' ? 'var(--bg-elevated)' : 'transparent',
            border: activeTab === 'remittance' ? '1px solid var(--border)' : '1px solid transparent',
            color: activeTab === 'remittance' ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: 'pointer', textTransform: 'uppercase'
          }}
        >
          Remittance Log
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeTab === 'deliveries' ? (
          recentDeliveries.map((delivery) => (
            <div key={delivery._id} style={{
              background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>#{delivery._id.slice(-6).toUpperCase()}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {delivery.deliveryDistanceKm?.toFixed(1) || '0'} km · {new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#29ffc6', fontWeight: 800, fontSize: '14px' }}>₹{delivery.deliveryEarnings?.toFixed(2)}</div>
                {delivery.paymentMethod === 'cod' && (
                  <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700, marginTop: '2px' }}>COD: ₹{delivery.totalAmount}</div>
                )}
              </div>
            </div>
          ))
        ) : (
          (data.remittanceHistory || []).slice().reverse().map((log, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(41,255,198,0.1)', color: '#29ffc6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpwardIcon sx={{ fontSize: '16px' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Cash Remitted</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(log.date).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '15px' }}>
                ₹{log.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
        {activeTab === 'deliveries' && recentDeliveries.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>No recent deliveries</p>}
        {activeTab === 'remittance' && (!data.remittanceHistory || data.remittanceHistory.length === 0) && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>No remittance records</p>}
      </div>

      {/* Pay Modal */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', 
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div 
              initial={{ y: 20, scale: 0.9 }} animate={{ y: 0, scale: 1 }}
              style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '360px', border: '1px solid var(--border)' }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Remit Cash</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Confirm amount to pay company.</p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>AMOUNT (₹)</label>
                <input 
                  autoFocus
                  type="number" 
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', 
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
                    color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700,
                    outline: 'none'
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Current: <strong>₹{cashCollected}</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setShowPayModal(false)} 
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '10px', 
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', 
                    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePay}
                  disabled={paying || !payAmount}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: '10px', 
                    background: 'var(--gradient-primary)', border: 'none', 
                    color: '#fff', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', opacity: (paying || !payAmount) ? 0.6 : 1
                  }}
                >
                  {paying ? '...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
