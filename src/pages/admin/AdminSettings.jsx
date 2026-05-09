import { useState } from 'react';
import { motion } from 'framer-motion';
import SaveIcon from '@mui/icons-material/SaveRounded';

export default function AdminSettings() {
  const [siteName, setSiteName] = useState('FlashFit');
  const [commission, setCommission] = useState('10');
  const [deliveryFee, setDeliveryFee] = useState('49');
  const [minOrder, setMinOrder] = useState('299');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: '6px', display: 'block'
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Platform configuration and preferences</p>
      </div>

      <form onSubmit={handleSave}>
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>General</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Site Name</label>
              <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Seller Commission (%)</label>
              <input type="number" value={commission} onChange={e => setCommission(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Delivery Fee (₹)</label>
              <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Minimum Order Amount (₹)</label>
              <input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </motion.div>

        {/* Maintenance Mode */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '24px', marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Advanced</h2>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Maintenance Mode</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Temporarily disable the platform for users</div>
            </div>
            <div
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              style={{
                width: '48px', height: '26px', borderRadius: '13px',
                background: maintenanceMode ? '#FF6B6B' : 'var(--border)',
                position: 'relative', cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <motion.div
                animate={{ x: maintenanceMode ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: '#fff', position: 'absolute', top: '2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px', borderRadius: '12px',
            background: saved ? '#10b981' : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            color: '#fff', fontWeight: 700, fontSize: '15px',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255,107,107,0.3)'
          }}
        >
          <SaveIcon sx={{ fontSize: '20px' }} />
          {saved ? 'Saved!' : 'Save Changes'}
        </motion.button>
      </form>
    </div>
  );
}
