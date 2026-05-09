import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import LaunchIcon from '@mui/icons-material/LaunchRounded';
import api from '../../api/index';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const rejectionReasons = [
    'Wrong or Invalid Document',
    'Unclear/Blurry Document Image',
    'Service not available in your Pincode',
    'Business details do not match ID proof',
    'Suspicious or Fraudulent activity',
    'Incomplete application information',
    'Custom'
  ];

  const fetchApplications = async () => {
    try {
      const res = await api.get('/admin/sellers');
      setApplications(res.data.applications);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load applications. Make sure you are an admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      const finalReason = reason === 'Custom' ? customReason : reason;
      await api.put(`/admin/sellers/${id}`, { status, rejectionReason: finalReason });
      setRejectingApp(null);
      setRejectionReason('');
      setCustomReason('');
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getFileUrl = (path) => {
    // Convert backslashes to forward slashes for URLs, just in case
    const safePath = path.replace(/\\/g, '/');
    return `http://localhost:5000/${safePath}`;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px 60px', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '8px', fontWeight: 500 }}>Manage user seller applications and store approvals</p>
      </div>

      {error ? (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontWeight: 500 }}>
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No seller applications currently found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {applications.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{app.storeName}</h2>
                    <span style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                      background: app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: app.status === 'approved' ? '#10b981' : app.status === 'rejected' ? '#ef4444' : '#f59e0b',
                      border: `1px solid ${app.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}>
                      {app.status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(13px, 2.5vw, 15px)', marginTop: '6px' }}>
                    Applied by: <strong style={{ color: 'var(--text-primary)' }}>{app.userId?.name}</strong> <span style={{ opacity: 0.7 }}>({app.userId?.email})</span>
                  </p>
                </div>

                <a
                  href={getFileUrl(app.documentPath)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-glass"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600,
                    color: 'var(--accent-light)', background: 'rgba(255, 255, 255, 0.05)', padding: '10px 20px',
                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <LaunchIcon sx={{ fontSize: 18 }} /> View Document
                </a>
              </div>

              <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '24px', background: 'rgba(255, 255, 255, 0.02)', padding: '24px', 
                borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' 
              }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Store Narrative</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{app.description}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Business Address</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{app.address}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Main Category</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize' }}>{app.categories}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Identity Proof</p>
                  <p style={{ fontSize: '14px', color: 'var(--accent-light)', fontWeight: 700 }}>{app.documentType || 'Not specified'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Business Contact</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{app.businessPhone || 'Not provided'}</p>
                </div>
              </div>

              {app.status === 'rejected' && app.rejectionReason && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>Rejection Reason: <span style={{ fontWeight: 400 }}>{app.rejectionReason}</span></p>
                </div>
              )}

              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <button
                    onClick={() => handleUpdateStatus(app._id, 'approved')}
                    className="btn btn-primary"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '12px 28px', borderRadius: 'var(--radius-lg)', 
                      fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> Approve Application
                  </button>
                  <button
                    onClick={() => setRejectingApp(app)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', 
                      padding: '12px 28px', borderRadius: 'var(--radius-lg)', 
                      fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <CloseIcon sx={{ fontSize: 20 }} /> Reject Application
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectingApp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 3000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{
                width: '100%', maxWidth: '400px', background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
                padding: '32px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Reject Application</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Please select a reason for rejecting <strong style={{ color: 'var(--text-primary)' }}>{rejectingApp.storeName}</strong>
              </p>

              <div style={{ display: 'grid', gap: '8px', marginBottom: '24px' }}>
                {rejectionReasons.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setRejectionReason(reason)}
                    style={{
                      padding: '12px 16px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                      background: rejectionReason === reason ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                      border: `1px solid ${rejectionReason === reason ? 'var(--accent)' : 'var(--border)'}`,
                      color: rejectionReason === reason ? 'var(--accent-light)' : 'var(--text-primary)',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {rejectionReason === 'Custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginBottom: '24px' }}
                >
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Custom Reason</label>
                  <textarea
                    autoFocus
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Type the specific reason for rejection..."
                    style={{
                      width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                      resize: 'vertical', minHeight: '80px', fontFamily: 'inherit'
                    }}
                  />
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setRejectingApp(null); setRejectionReason(''); setCustomReason(''); }}
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}
                >Cancel</button>
                <button
                  onClick={() => handleUpdateStatus(rejectingApp._id, 'rejected', rejectionReason)}
                  disabled={!rejectionReason || (rejectionReason === 'Custom' && !customReason.trim())}
                  style={{ 
                    flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)', 
                    background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, 
                    cursor: (!rejectionReason || (rejectionReason === 'Custom' && !customReason.trim())) ? 'not-allowed' : 'pointer', 
                    opacity: (!rejectionReason || (rejectionReason === 'Custom' && !customReason.trim())) ? 0.5 : 1
                  }}
                >Confirm Reject</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
