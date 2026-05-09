import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ScheduleIcon from '@mui/icons-material/ScheduleRounded';
import api from '../../api/index';
import { useAuth } from '../../context/AuthContext';

export default function BecomeSeller() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    address: '',
    categories: '',
    businessPhone: '',
    documentType: ''
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [existingApp, setExistingApp] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/seller/status');
        if (res.data.application) {
          setExistingApp(res.data.application);
          setFormData({
            storeName: res.data.application.storeName || '',
            description: res.data.application.description || '',
            address: res.data.application.address || '',
            categories: res.data.application.categories || '',
            businessPhone: res.data.application.businessPhone || '',
            documentType: res.data.application.documentType || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch application status:', err);
      } finally {
        setIsLoadingStatus(false);
      }
    };
    if (user) checkStatus();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (file) data.append('document', file);

      await api.post('/seller/apply', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingStatus) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf7f2' }}>
        <CircularProgress sx={{ color: '#c9a96e' }} />
      </div>
    );
  }

  const appData = isSuccess ? formData : (existingApp || formData);
  const isApproved = existingApp?.status === 'approved';
  const isRejected = existingApp?.status === 'rejected';

  // --- SHARED THEME (MATCHING SHOP) ---
  const theme = {
    bg: '#faf7f2',
    bgCard: 'rgba(255, 255, 255, 0.9)',
    accent: '#c9a96e',
    accentLight: '#dfc492',
    textPrimary: '#1a1a1a',
    textSecondary: '#5a5550',
    textMuted: '#8a8580',
    border: '#e8e4df',
    fontDisplay: '"Playfair Display", serif',
    fontSans: '"Inter", sans-serif'
  };

  const responsiveStyles = (
    <style>{`
      .glass-card {
        display: grid;
        grid-template-columns: minmax(350px, 1fr) 1.5fr;
      }
      @media (max-width: 850px) {
        .glass-card {
          grid-template-columns: 1fr !important;
        }
        .branding-col {
          border-right: none !important;
          border-bottom: 1px solid ${theme.border} !important;
          padding: 40px 24px !important;
        }
        .form-col {
          padding: 40px 24px !important;
        }
      }
    `}</style>
  );

  // --- STATUS / SUCCESS VIEW ---
  if (isSuccess || existingApp) {
    return (
      <>
        {responsiveStyles}
        <div style={{ minHeight: '100vh', padding: 'clamp(20px, 5vw, 100px) 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: theme.fontSans }}>
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: theme.bgCard, borderRadius: '24px',
              border: `1px solid ${theme.border}`, maxWidth: '950px', width: '100%',
              boxShadow: '0 40px 100px rgba(201, 169, 110, 0.15)', overflow: 'hidden',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Left Column: Status Info */}
            <div className="branding-col" style={{ 
              padding: '60px 40px', background: 'rgba(201, 169, 110, 0.03)', 
              borderRight: `1px solid ${theme.border}`, display: 'flex', 
              flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              justifyContent: 'center'
            }}>
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: isApproved ? 'rgba(16, 185, 129, 0.05)' : isRejected ? 'rgba(239, 68, 68, 0.05)' : 'rgba(201, 169, 110, 0.05)',
                  border: `1px solid ${isApproved ? '#10b981' : isRejected ? '#ef4444' : theme.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
                }}
              >
                {isApproved ? <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#10b981' }} /> :
                  isRejected ? <CloseIcon sx={{ fontSize: 48, color: '#ef4444' }} /> :
                    <ScheduleIcon sx={{ fontSize: 48, color: theme.accent }} />}
              </motion.div>

              <h2 style={{ fontSize: '28px', fontWeight: 700, color: theme.textPrimary, marginBottom: '12px', fontFamily: theme.fontDisplay }}>
                {isSuccess ? 'Application Sent' : 'Status Overview'}
              </h2>

              <div style={{
                display: 'inline-block', padding: '8px 20px', borderRadius: '100px',
                background: isApproved ? 'rgba(16, 185, 129, 0.1)' : isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(201, 169, 110, 0.1)',
                color: isApproved ? '#10b981' : isRejected ? '#ef4444' : theme.accent,
                fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px',
                border: `1px solid ${isApproved ? 'rgba(16, 185, 129, 0.2)' : isRejected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(201, 169, 110, 0.2)'}`
              }}>
                {existingApp?.status || 'Processing'}
              </div>

              <p style={{ color: theme.textSecondary, fontSize: '15px', lineHeight: 1.6, maxWidth: '240px' }}>
                {isSuccess
                  ? "Your application is currently being reviewed by our curators."
                  : existingApp?.status === 'pending'
                    ? "We're verifying your business credentials. Please wait a moment."
                    : isApproved 
                      ? "Welcome to the collective! Your dashboard is now active."
                      : "Unfortunately, we couldn't approve your request at this stage."}
              </p>

              <button
                onClick={() => navigate(isApproved ? '/seller' : '/shop')}
                style={{ 
                  width: '100%', padding: '16px', marginTop: '40px', fontWeight: 800, letterSpacing: '1px',
                  background: theme.accent, color: '#1a1a1a', border: 'none', borderRadius: '100px',
                  cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: `0 8px 25px ${theme.accent}33`,
                  fontSize: '13px', textTransform: 'uppercase'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 30px ${theme.accent}44`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 25px ${theme.accent}33`; }}
              >
                {isApproved ? 'Enter Seller Portal' : 'Return to Shop'}
              </button>
            </div>

            {/* Right Column: Details */}
            <div className="form-col" style={{ padding: '60px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px' }}>
                  Submission Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <div>
                    <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Store Name</p>
                    <p style={{ color: theme.textPrimary, fontSize: '20px', fontWeight: 700, fontFamily: theme.fontDisplay }}>{appData.storeName}</p>
                  </div>
                  <div>
                    <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Verified Via</p>
                    <p style={{ color: theme.accent, fontSize: '20px', fontWeight: 700, fontFamily: theme.fontDisplay }}>{appData.documentType}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Operational Base</p>
                    <p style={{ color: theme.textPrimary, fontSize: '16px', fontWeight: 500, lineHeight: 1.5 }}>{appData.address}</p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '32px' }}>
                <p style={{ color: theme.textMuted, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Brand Story</p>
                <p style={{ color: theme.textSecondary, fontSize: '14px', lineHeight: 1.8, fontStyle: 'italic' }}>"{appData.description}"</p>
              </div>

              {isRejected && (
                <div style={{ 
                  marginTop: 'auto', padding: '24px', background: 'rgba(239, 68, 68, 0.03)', 
                  border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>Curator Feedback</p>
                  </div>
                  <p style={{ color: theme.textPrimary, fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>{existingApp?.rejectionReason || "Please ensure all documents are clear and valid."}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // --- FORM VIEW ---
  return (
    <>
      {responsiveStyles}
      <div id="become-seller-container" style={{ minHeight: '100vh', padding: 'clamp(20px, 5vw, 100px) 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: theme.fontSans }}>
        <motion.div
          id="become-seller-card"
          className="glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: theme.bgCard, borderRadius: '24px',
          border: `1px solid ${theme.border}`, maxWidth: '1000px', width: '100%',
          boxShadow: '0 50px 100px rgba(201, 169, 110, 0.12)', overflow: 'hidden',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Left Column: Branding & Steps */}
        <div className="branding-col" style={{ 
          padding: '60px 50px', background: 'rgba(201, 169, 110, 0.03)', 
          borderRight: `1px solid ${theme.border}`, display: 'flex', 
          flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'white', border: `1px solid ${theme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '32px', color: theme.accent,
              boxShadow: '0 10px 20px rgba(201, 169, 110, 0.1)'
            }}>
              <StorefrontOutlinedIcon sx={{ fontSize: 32 }} />
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 700, color: theme.textPrimary, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '24px', fontFamily: theme.fontDisplay }}>
              Launch Your <br /><span style={{ color: theme.accent }}>Luxury Store</span>
            </h1>
            <p style={{ color: theme.textSecondary, fontSize: '16px', lineHeight: 1.6, marginBottom: '48px' }}>
              Join an exclusive collective of elite fashion brands and reach discerning customers worldwide.
            </p>

            <div style={{ display: 'grid', gap: '32px' }}>
              {[
                { step: '01', title: 'Brand Identity', text: 'Define your unique store name and narrative.' },
                { step: '02', title: 'Curator Review', text: 'Our team will verify your credentials for trust.' },
                { step: '03', title: 'Global Reach', text: 'Start selling to fashion lovers everywhere.' }
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: theme.accent, opacity: 0.6 }}>{item.step}</span>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: theme.textPrimary, marginBottom: '4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: 1.4 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '40px' }}>
            <p style={{ fontSize: '12px', color: theme.textMuted, fontWeight: 500 }}>
              Partner Support: <span style={{ color: theme.accent, cursor: 'pointer', fontWeight: 700 }}>support@flashfit.luxury</span>
            </p>
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="form-col" style={{ padding: '60px' }}>
          {error && (
            <div style={{ padding: '16px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Store Name</label>
                <input
                  required name="storeName" value={formData.storeName} onChange={handleChange}
                  placeholder="e.g., Maison de Mode"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Business Contact</label>
                <input
                  required name="businessPhone" value={formData.businessPhone} onChange={handleChange}
                  placeholder="e.g., +91 98765 43210"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = theme.accent}
                  onBlur={e => e.target.style.borderColor = theme.border}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Fashion Category</label>
                <select
                  required name="categories" value={formData.categories} onChange={handleChange}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="" disabled>Select a category</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="footwear">Exotic Footwear</option>
                  <option value="accessories">Accessories</option>
                  <option value="jewelry">Fine Jewelry</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Brand Narrative</label>
              <textarea
                required name="description" value={formData.description} onChange={handleChange}
                placeholder="Share the story behind your brand..."
                rows="3"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.border}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Business Headquarters</label>
              <input
                required name="address" value={formData.address} onChange={handleChange}
                placeholder="Full address of your boutique or office"
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = theme.border}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Identity Verification</label>
              <select
                required name="documentType" value={formData.documentType} onChange={handleChange}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', border: `1px solid ${theme.border}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled>Select document type</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">International Passport</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Proof of Identity</label>
              <div 
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
                style={{ border: `2px dashed ${theme.border}`, borderRadius: '16px', padding: '40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: 'rgba(201, 169, 110, 0.02)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.background = 'rgba(201, 169, 110, 0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = 'rgba(201, 169, 110, 0.02)'; }}
              >
                <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0])} style={{ display: 'none' }} accept=".pdf,.jpg,.png" />
                
                {file ? (
                  <div style={{ color: theme.textPrimary }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#10b981', marginBottom: '12px' }} />
                    <p style={{ fontWeight: 700, fontSize: '15px', fontFamily: theme.fontDisplay }}>{file.name}</p>
                    <p style={{ color: theme.textMuted, fontSize: '12px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div style={{ color: theme.textMuted }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: theme.accent, marginBottom: '12px', opacity: 0.7 }} />
                    <p style={{ fontWeight: 700, fontSize: '15px', color: theme.textPrimary, fontFamily: theme.fontDisplay }}>Upload Official Document</p>
                    <p style={{ fontSize: '12px', marginTop: '4px' }}>PDF, PNG, or JPG (max. 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit" disabled={isSubmitting || !file}
              style={{ 
                width: '100%', padding: '18px', marginTop: '10px', fontWeight: 800, letterSpacing: '2px',
                background: theme.accent, color: '#1a1a1a', border: 'none', borderRadius: '100px',
                cursor: (isSubmitting || !file) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !file) ? 0.6 : 1,
                transition: 'all 0.3s ease', boxShadow: `0 8px 25px ${theme.accent}33`,
                textTransform: 'uppercase', fontSize: '13px'
              }}
              onMouseEnter={e => !isSubmitting && file && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = `0 12px 30px ${theme.accent}44`)}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = `0 8px 25px ${theme.accent}33`)}
            >
              {isSubmitting ? 'Verifying...' : 'Submit For Curation'}
            </button>
          </form>
        </div>
      </motion.div>
      </div>
    </>
  );
}
