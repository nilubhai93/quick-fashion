import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import StraightenIcon from '@mui/icons-material/StraightenRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagRounded';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';

export default function Profile() {
  const { user, logout, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    topSize: user?.sizeProfile?.topSize || '',
    bottomSize: user?.sizeProfile?.bottomSize || '',
    shoeSize: user?.sizeProfile?.shoeSize || ''
  });
  const [bank, setBank] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: ''
  });
  const [bankEditing, setBankEditing] = useState(false);
  const [loadingBank, setLoadingBank] = useState(true);

  useState(() => {
    if (isAuthenticated) {
      import('../../api').then(({ authAPI }) => {
        authAPI.getBankDetails().then(res => {
          if (res.data?.details) setBank(res.data.details);
          setLoadingBank(false);
        }).catch(() => setLoadingBank(false));
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Please sign in</h2>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        name: form.name, phone: form.phone,
        sizeProfile: { topSize: form.topSize, bottomSize: form.bottomSize, shoeSize: form.shoeSize, preferredBrands: user?.sizeProfile?.preferredBrands || {} }
      });
      setEditing(false);
    } catch (e) { console.error(e); }
  };

  const handleSaveBank = async () => {
    try {
      const { authAPI } = await import('../../api');
      await authAPI.updateBankDetails(bank);
      setBankEditing(false);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: 'clamp(13px, 2.5vw, 16px)', outline: 'none'
  };

  return (
    <div className="container" style={{ padding: '10px 24px 60px', maxWidth: '700px', marginTop: '10px' }}>
      <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Profile</h1>

      {/* User Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: '20px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 900, color: 'white'
          }}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.email}</p>
          </div>
          <button onClick={() => setEditing(!editing)} style={{
            marginLeft: 'auto', padding: '6px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-bg)', color: 'var(--accent-light)',
            fontSize: '13px', fontWeight: 700, border: '1px solid rgba(168,85,247,0.2)'
          }}>{editing ? 'Cancel' : 'Edit'}</button>
        </div>

        {editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91-XXXXXXXXXX" style={inputStyle} />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} className="btn btn-primary btn-sm" style={{ gridColumn: 'span 2', marginTop: '4px' }}>Save Changes</motion.button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InfoItem icon={<PersonOutlineIcon sx={{ fontSize: '20px' }} />} label="Phone" value={user?.phone || 'Not set'} />
            <InfoItem icon={<LocalShippingOutlinedIcon sx={{ fontSize: '20px' }} />} label="Default Address" value={user?.addresses?.[0] ? `${user.addresses[0].city}, ${user.addresses[0].zip}` : 'Not set'} />
          </div>
        )}
      </motion.div>

      {/* Size Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: '20px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <StraightenIcon sx={{ color: 'var(--accent-light)', fontSize: '20px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Size Profile — <span className="gradient-text">Smart Fit</span></h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
          Tell us your sizes and preferred brands. Our AI will recommend the perfect fit every time.
        </p>

        {editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Top</label>
              <input value={form.topSize} onChange={e => setForm({...form, topSize: e.target.value})} placeholder="M" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bottom</label>
              <input value={form.bottomSize} onChange={e => setForm({...form, bottomSize: e.target.value})} placeholder="32" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Shoe</label>
              <input value={form.shoeSize} onChange={e => setForm({...form, shoeSize: e.target.value})} placeholder="9" style={inputStyle} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <SizeChip label="Top" value={user?.sizeProfile?.topSize || '—'} />
            <SizeChip label="Bottom" value={user?.sizeProfile?.bottomSize || '—'} />
            <SizeChip label="Shoe" value={user?.sizeProfile?.shoeSize || '—'} />
          </div>
        )}

        {user?.sizeProfile?.preferredBrands && Object.keys(user.sizeProfile.preferredBrands).length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Preferred Brand Sizes:</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.entries(user.sizeProfile.preferredBrands).map(([brand, size]) => (
                <span key={brand} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {brand}: {size}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Bank Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ padding: '20px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <AccountBalanceIcon sx={{ color: 'var(--accent-light)', fontSize: '20px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Bank Details — <span className="gradient-text">Refunds</span></h3>
          <button onClick={() => setBankEditing(!bankEditing)} style={{
            marginLeft: 'auto', padding: '4px 12px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontSize: '12px', fontWeight: 700, border: '1px solid var(--border)'
          }}>{bankEditing ? 'Cancel' : (bank.accountNumber ? 'Edit' : 'Add')}</button>
        </div>
        
        {bankEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Account Holder Name</label>
              <input value={bank.accountHolderName} onChange={e => setBank({...bank, accountHolderName: e.target.value})} placeholder="John Doe" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Account Number</label>
              <input value={bank.accountNumber} onChange={e => setBank({...bank, accountNumber: e.target.value})} placeholder="XXXX XXXX XXXX" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>IFSC Code</label>
              <input value={bank.ifscCode} onChange={e => setBank({...bank, ifscCode: e.target.value})} placeholder="SBIN000XXXX" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bank Name</label>
              <input value={bank.bankName} onChange={e => setBank({...bank, bankName: e.target.value})} placeholder="State Bank of India" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Branch</label>
              <input value={bank.branchName} onChange={e => setBank({...bank, branchName: e.target.value})} placeholder="Main Branch" style={inputStyle} />
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSaveBank} className="btn btn-primary btn-sm" style={{ gridColumn: 'span 2', marginTop: '4px' }}>Save Bank Details</motion.button>
          </div>
        ) : (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            {bank.accountNumber ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{bank.accountHolderName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '11px', fontWeight: 700 }}>
                    <VerifiedIcon sx={{ fontSize: 14 }} /> Verified for Refunds
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {bank.bankName} • {bank.accountNumber.replace(/.(?=.{4})/g, '•')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  IFSC: {bank.ifscCode} | {bank.branchName}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>No bank details added for refunds.</p>
                <button onClick={() => setBankEditing(true)} style={{
                  padding: '6px 16px', borderRadius: '20px', background: 'var(--gradient-primary)', color: 'white',
                  border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                }}>Add Bank Account</button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Link to="/orders" style={{
          padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)',
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all var(--transition-fast)'
        }}>
          <ShoppingBagOutlinedIcon sx={{ color: 'var(--accent-light)' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>My Orders</span>
        </Link>
        <button onClick={handleLogout} style={{
          padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', width: '100%', textAlign: 'left'
        }}>
          <LogoutIcon sx={{ color: 'var(--error)' }} />
          <span style={{ color: 'var(--error)', fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
      <span style={{ color: 'var(--accent-light)' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

function SizeChip({ label, value }) {
  return (
    <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', textAlign: 'center' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 800 }} className="gradient-text">{value}</div>
    </div>
  );
}
