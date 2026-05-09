import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../../api';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';

export default function ReturnPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);

  const reasons = [
    'Defective Product',
    'Size/Fit Issue',
    'Wrong Item Received',
    'Quality not as expected',
    'Product damaged on arrival',
    'Other'
  ];

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [bank, setBank] = useState(null);
  const [loadingBank, setLoadingBank] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: ''
  });

  useEffect(() => {
    loadOrder();
    fetchSavedAddresses();
    fetchBankDetails();
  }, [id]);

  const fetchBankDetails = async () => {
    try {
      const { authAPI } = await import('../../api');
      const res = await authAPI.getBankDetails();
      if (res.data?.details) setBank(res.data.details);
    } catch (e) {
      console.error('Failed to fetch bank details', e);
    } finally {
      setLoadingBank(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankForm.accountNumber || !bankForm.accountHolderName || !bankForm.ifscCode) {
      return alert('Please fill in required bank details');
    }
    try {
      const { authAPI } = await import('../../api');
      const res = await authAPI.updateBankDetails(bankForm);
      setBank(res.data.details);
      setShowBankForm(false);
    } catch (e) {
      alert('Failed to save bank details');
    }
  };

  const loadOrder = async () => {
    try {
      const res = await orderAPI.getById(id);
      const o = res.data.order;
      setOrder(o);
      setSelectedLocation({
        lat: o.deliveryLocation?.lat,
        lng: o.deliveryLocation?.lng,
        address: `${o.deliveryAddress?.street}, ${o.deliveryAddress?.city}, ${o.deliveryAddress?.zip}`,
        label: 'Original Delivery Address'
      });
      // Check if eligible
      const deliveredAt = new Date(o.deliveredAt || o.updatedAt);
      const diff = (new Date() - deliveredAt) / (1000 * 60);
      if (diff > 30 || o.status !== 'delivered') {
        alert('This order is no longer eligible for return.');
        navigate('/orders');
      }
    } catch (e) {
      console.error(e);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedAddresses = async () => {
    try {
      const res = await orderAPI.getAddresses();
      setSavedAddresses(res.data.addresses || []);
    } catch (e) {
      console.error('Failed to fetch addresses', e);
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!reason) return alert('Please select a reason for return');
    if (!bank) return alert('Please provide bank details for the refund');
    setSubmitting(true);
    try {
      const returnData = {
        reason,
        description,
        photo: photoPreview,
        pickupLocation: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: selectedLocation.address
        }
      };
      
      await orderAPI.return(id, returnData);
      alert('Return request submitted! A delivery partner will be assigned shortly.');
      navigate('/orders');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px 24px 80px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <ArrowBackIcon />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Request Return</h1>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Returning Order</div>
          <div style={{ fontWeight: 700 }}>#{order._id.slice(-8).toUpperCase()}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {order.items.map((item, idx) => (
              <img key={idx} src={item.image} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Why are you returning this?</label>
          <div style={{ display: 'grid', gap: '8px' }}>
            {reasons.map(r => (
              <button 
                key={r}
                onClick={() => setReason(r)}
                style={{
                  padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                  background: reason === r ? 'rgba(99,102,241,0.1)' : 'var(--bg-elevated)',
                  border: reason === r ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: reason === r ? 'var(--accent)' : 'var(--text-primary)',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Additional details (optional)</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '14px', minHeight: '80px', outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Upload Photo (for defects)</label>
          {photoPreview ? (
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <img src={photoPreview} style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--accent)' }} alt="" />
              <button onClick={() => { setPhoto(null); setPhotoPreview(''); }} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--error)', color: 'white', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
          ) : (
            <button onClick={handlePhotoClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', width: '100%', borderRadius: '16px', border: '2px dashed var(--border)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <CameraAltIcon sx={{ fontSize: '32px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Tap to take a picture</span>
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture style={{ display: 'none' }} />
        </div>

        {/* Bank Details Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Refund Destination</label>
          
          {loadingBank ? (
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
          ) : bank && !showBankForm ? (
            <div style={{ 
              padding: '16px', borderRadius: '16px', border: '1.5px solid #10b981', 
              background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', gap: '12px' 
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBalanceIcon sx={{ color: '#10b981' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {bank.accountHolderName} <VerifiedIcon sx={{ fontSize: 14, color: '#10b981' }} />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {bank.bankName} • {bank.accountNumber.replace(/.(?=.{4})/g, '•')}
                </div>
              </div>
              <button 
                onClick={() => setShowBankForm(true)}
                style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-light)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Change
              </button>
            </div>
          ) : (
            <div style={{ 
              padding: '20px', borderRadius: '16px', border: '1px dashed var(--border)', 
              background: 'var(--bg-elevated)', textAlign: 'center' 
            }}>
              {!showBankForm ? (
                <>
                  <AccountBalanceIcon sx={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>No bank account linked for refunds.</p>
                  <button 
                    onClick={() => setShowBankForm(true)}
                    style={{ 
                      padding: '8px 20px', borderRadius: '20px', background: 'var(--accent)', color: 'white', 
                      border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' 
                    }}
                  >
                    Add Bank Account
                  </button>
                </>
              ) : (
                <div style={{ display: 'grid', gap: '10px', textAlign: 'left' }}>
                   <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Account Holder</label>
                    <input 
                      value={bankForm.accountHolderName} 
                      onChange={e => setBankForm({...bankForm, accountHolderName: e.target.value})}
                      placeholder="Full Name" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }} 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Account No.</label>
                      <input 
                        value={bankForm.accountNumber} 
                        onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})}
                        placeholder="XXXX XXXX" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>IFSC</label>
                      <input 
                        value={bankForm.ifscCode} 
                        onChange={e => setBankForm({...bankForm, ifscCode: e.target.value})}
                        placeholder="IFSC Code" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Bank Name</label>
                    <input 
                      value={bankForm.bankName} 
                      onChange={e => setBankForm({...bankForm, bankName: e.target.value})}
                      placeholder="e.g. State Bank of India" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button 
                      onClick={handleSaveBank}
                      style={{ flex: 1, padding: '10px', borderRadius: '10px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Save Account
                    </button>
                    <button 
                      onClick={() => setShowBankForm(false)}
                      style={{ padding: '10px 16px', borderRadius: '10px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Pickup Location</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={selectedLocation?.address || ''}
              onChange={(e) => {
                const addrStr = e.target.value;
                if (addrStr === `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`) {
                  setSelectedLocation({
                    lat: order.deliveryLocation?.lat,
                    lng: order.deliveryLocation?.lng,
                    address: addrStr,
                    label: 'Original Delivery Address'
                  });
                } else {
                  const saved = savedAddresses.find(a => `${a.address.street}, ${a.address.city}` === addrStr);
                  if (saved) {
                    setSelectedLocation({
                      lat: saved.location?.lat,
                      lng: saved.location?.lng,
                      address: addrStr,
                      label: saved.label || 'Saved Address'
                    });
                  }
                }
              }}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: '12px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
                outline: 'none', appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value={`${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`}>
                Original: {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
              </option>
              {savedAddresses.filter(a => a.address.street !== order.deliveryAddress?.street).map((a, i) => (
                <option key={i} value={`${a.address.street}, ${a.address.city}`}>
                  {a.label || 'Saved'}: {a.address.street}, {a.address.city}
                </option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▼</div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={submitting || !reason}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px',
            background: submitting || !reason ? 'var(--bg-elevated)' : 'var(--gradient-primary)',
            color: submitting || !reason ? 'var(--text-muted)' : 'white',
            fontWeight: 800, fontSize: '16px', border: 'none',
            cursor: submitting || !reason ? 'not-allowed' : 'pointer',
            boxShadow: submitting || !reason ? 'none' : '0 8px 20px var(--accent-glow)'
          }}
        >
          {submitting ? 'Submitting...' : 'Confirm Return Request'}
        </button>
      </div>
    </div>
  );
}
