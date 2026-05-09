import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sellerSettingsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import BeachAccessIcon from '@mui/icons-material/BeachAccessRounded';

export default function SellerSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('orders');

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const res = await sellerSettingsAPI.get();
      setSettings(res.data.settings);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await sellerSettingsAPI.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  const sections = [
    { id: 'orders', label: 'Order Settings', icon: <LocalShippingIcon sx={{ fontSize: 18 }} /> },
    { id: 'notifications', label: 'Notifications', icon: <NotificationsOutlinedIcon sx={{ fontSize: 18 }} /> },
    { id: 'advanced', label: 'Advanced', icon: <SettingsOutlinedIcon sx={{ fontSize: 18 }} /> }
  ];

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
  };

  const cardStyle = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '20px'
  };

  const toggleStyle = (isOn) => ({
    width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
    background: isOn ? 'var(--accent)' : 'var(--bg-elevated)',
    border: `1px solid ${isOn ? 'var(--accent)' : 'var(--border)'}`,
    position: 'relative', transition: 'all 0.3s ease', flexShrink: 0
  });

  const toggleKnobStyle = (isOn) => ({
    width: '20px', height: '20px', borderRadius: '50%',
    background: isOn ? '#fff' : 'var(--text-muted)',
    position: 'absolute', top: '2px',
    left: isOn ? '24px' : '2px',
    transition: 'all 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  });

  const Toggle = ({ field }) => (
    <button
      style={toggleStyle(settings[field])}
      onClick={() => updateField(field, !settings[field])}
    >
      <div style={toggleKnobStyle(settings[field])} />
    </button>
  );

  const SettingRow = ({ label, description, field }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 0', borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ flex: 1, marginRight: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{label}</div>
        {description && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{description}</div>}
      </div>
      <Toggle field={field} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Store Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Manage store profile, orders, and notifications.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '8px 20px', borderRadius: 'var(--radius-md)',
            background: saved ? '#10b981' : 'var(--accent)', color: '#fff',
            border: 'none', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.3s', opacity: saving ? 0.7 : 1
          }}
        >
          {saved ? (
            <><CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> Saved!</>
          ) : saving ? (
            <><CircularProgress size={16} sx={{ color: '#fff' }} /> Saving...</>
          ) : (
            <><SaveOutlinedIcon sx={{ fontSize: 16 }} /> Save Changes</>
          )}
        </button>
      </div>

      {/* Section Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '4px', flexWrap: 'wrap', width: 'fit-content'
      }}>
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: activeSection === sec.id ? 'var(--accent)' : 'transparent',
              color: activeSection === sec.id ? '#fff' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>


      {/* Order Settings Section */}
      {activeSection === 'orders' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LocalShippingIcon sx={{ fontSize: 22, color: '#3b82f6' }} /> Order Management
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Configure how orders are processed and your return policies.</p>

            <SettingRow
              label="Auto-Confirm Orders"
              description="Automatically confirm new orders without manual review."
              field="autoConfirmOrders"
            />

            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <label style={labelStyle}>Processing Time (days)</label>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                How many business days to prepare an order for shipment.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {[1, 2, 3, 5, 7].map(d => (
                  <button
                    key={d}
                    onClick={() => updateField('processingTime', d)}
                    style={{
                      padding: '8px 20px', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${settings.processingTime === d ? 'var(--accent)' : 'var(--border)'}`,
                      background: settings.processingTime === d ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-elevated)',
                      color: settings.processingTime === d ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {d} {d === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <label style={labelStyle}>Return Policy</label>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                The return window you offer to customers.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  { value: '7-day', label: '7 Days' },
                  { value: '15-day', label: '15 Days' },
                  { value: '30-day', label: '30 Days' },
                  { value: 'no-returns', label: 'No Returns' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateField('returnPolicy', opt.value)}
                    style={{
                      padding: '8px 20px', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${settings.returnPolicy === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: settings.returnPolicy === opt.value ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-elevated)',
                      color: settings.returnPolicy === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 0' }}>
              <label style={labelStyle}>Low Stock Alert Threshold</label>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Get notified when product stock drops below this number.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.lowStockThreshold}
                  onChange={e => updateField('lowStockThreshold', parseInt(e.target.value) || 1)}
                  style={{ ...inputStyle, width: '120px', textAlign: 'center' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>units</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <NotificationsOutlinedIcon sx={{ fontSize: 22, color: '#f59e0b' }} /> Notification Preferences
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Choose which notifications you want to receive.</p>

            <SettingRow
              label="New Order Alerts"
              description="Get notified immediately when a customer places an order."
              field="notifyOrders"
            />
            <SettingRow
              label="Low Stock Warnings"
              description="Receive alerts when product inventory is running low."
              field="notifyLowStock"
            />
            <SettingRow
              label="Customer Reviews"
              description="Get notified when customers leave reviews on your products."
              field="notifyReviews"
            />
          </div>
        </motion.div>
      )}

      {/* Advanced Section */}
      {activeSection === 'advanced' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ ...cardStyle, border: settings.vacationMode ? '1px solid #f59e0b' : '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BeachAccessIcon sx={{ fontSize: 22, color: '#f59e0b' }} /> Vacation Mode
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
              Temporarily pause your store. Products will be hidden from customers and no new orders will be accepted.
            </p>
            <SettingRow
              label="Enable Vacation Mode"
              description={settings.vacationMode ? "⚠️ Your store is currently paused. Customers cannot see your products." : "Your store is active and visible to customers."}
              field="vacationMode"
            />
          </div>

          {/* Danger Zone */}
          <div style={{
            ...cardStyle,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.03)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
              Danger Zone
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              These actions are irreversible. Proceed with caution.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => alert('This feature will be available soon.')}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Export All Data
              </button>
              <button
                onClick={() => alert('Please contact support to deactivate your seller account.')}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-md)',
                  border: '1px solid #ef4444', background: 'transparent',
                  color: '#ef4444', fontWeight: 600, fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Deactivate Seller Account
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
