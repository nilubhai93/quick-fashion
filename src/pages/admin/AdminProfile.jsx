import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailRounded';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneRounded';

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (updateProfile) {
        await updateProfile({ name: formData.name, phone: formData.phone });
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Admin Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>
          Manage your personal information and platform security settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            flex: '1 1 350px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', fontWeight: 800, color: '#fff',
            marginBottom: '20px', boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)'
          }}>
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          
          {isEditing ? (
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              style={{ fontSize: '20px', fontWeight: 700, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', outline: 'none', textAlign: 'center', marginBottom: '4px' }} 
            />
          ) : (
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.name || 'Administrator'}
              <VerifiedUserIcon sx={{ color: '#10b981', fontSize: '22px' }} />
            </h2>
          )}
          <p style={{ color: '#FF6B6B', fontWeight: 600, fontSize: '15px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Super Admin
          </p>

          <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '24px 0' }} />

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmailOutlinedIcon sx={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.email || 'admin@flashfit.com'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PhoneOutlinedIcon sx={{ color: 'var(--text-secondary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Contact Number</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                    style={{ width: '100%', fontSize: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', color: 'var(--text-primary)', outline: 'none', marginTop: '4px' }}
                  />
                ) : (
                  <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.phone || '+1 (555) 000-0000'}</div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SecurityOutlinedIcon sx={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Account Level</div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>Full Access (Level 5)</div>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '32px' }}>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setFormData({ name: user?.name || '', phone: user?.phone || '' }); }} style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                Cancel
              </button>
            )}
            <button onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={loading} style={{
              flex: isEditing ? 1 : 2, padding: '14px', borderRadius: '12px',
              background: isEditing ? '#FF6B6B' : 'rgba(255, 107, 107, 0.1)', 
              color: isEditing ? '#ffffff' : '#FF6B6B', 
              border: isEditing ? 'none' : '1px solid rgba(255, 107, 107, 0.2)',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              opacity: loading ? 0.7 : 1
            }} onMouseEnter={e => { if(!isEditing) e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)' }} onMouseLeave={e => { if(!isEditing) e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)' }}>
              {loading ? 'Saving...' : isEditing ? 'Save Details' : 'Edit Profile Details'}
            </button>
          </div>
        </motion.div>

        {/* Security / System Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            flex: '2 1 400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Security Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Password</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last changed 3 months ago</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Update</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '13px', color: '#10b981' }}>Enabled via Authenticator App</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Manage</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Login Sessions</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>2 active sessions currently</div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Revoke All</button>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Platform Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Account Created</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Jan 12, 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Login</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Today, 10:45 AM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Actions Performed</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>1,248</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
