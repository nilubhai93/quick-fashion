import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { motion, AnimatePresence } from 'framer-motion';

export default function Addresses() {
  const { user, updateProfile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  const addresses = user?.addresses || [];

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!form.street || !form.city || !form.zip) return;

    try {
      const newAddresses = [...addresses];
      
      if (form.isDefault || newAddresses.length === 0) {
        newAddresses.forEach(a => a.isDefault = false); // only one default
      }
      
      newAddresses.push({
        ...form,
        isDefault: form.isDefault || newAddresses.length === 0
      });

      await updateProfile({ addresses: newAddresses });
      setIsAdding(false);
      setForm({ street: '', city: '', state: '', zip: '', isDefault: false });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (index) => {
    try {
      const newAddresses = addresses.filter((_, i) => i !== index);
      if (addresses[index].isDefault && newAddresses.length > 0) {
        newAddresses[0].isDefault = true;
      }
      await updateProfile({ addresses: newAddresses });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetDefault = async (index) => {
    try {
      const newAddresses = addresses.map((a, i) => ({
        ...a,
        isDefault: i === index
      }));
      await updateProfile({ addresses: newAddresses });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '32px 24px 60px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px' }}>
        <Link to="/profile" style={{ color: '#007185', textDecoration: 'none' }}>Your Account</Link> › <span style={{ color: '#c45500' }}>Your Addresses</span>
      </div>
      
      <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#111', marginBottom: '24px' }}>Your Addresses</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Add Address Card */}
        <div 
          onClick={() => setIsAdding(true)}
          style={{ 
            border: '2px dashed #ccc', 
            borderRadius: '8px', 
            height: '250px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#767676',
            background: '#fafafa'
          }}
        >
          <AddIcon style={{ fontSize: '60px', color: '#ccc', marginBottom: '10px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Add address</h2>
        </div>

        {/* Existing Addresses */}
        {addresses.map((address, idx) => (
          <div key={address._id || idx} style={{ border: '1px solid #d5d9d9', borderRadius: '8px', height: '250px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {address.isDefault && (
              <div style={{ borderBottom: '1px solid #d5d9d9', padding: '10px 20px', background: '#f3f3f3', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: '#555', fontWeight: 700 }}>Default:</span> 
                <span style={{ fontSize: '12px', marginLeft: '5px', fontWeight: 700, color: '#333' }}>amazon</span>
              </div>
            )}
            
            <div style={{ padding: '20px', flex: 1 }}>
              <p style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: 700, color: '#111' }}>{user?.name}</p>
              <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#111' }}>{address.street}</p>
              <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#111' }}>{address.city}, {address.state} {address.zip}</p>
              <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#111' }}>India</p>
              <p style={{ margin: '0 0 5px', fontSize: '14px', color: '#111' }}>Phone number: {user?.phone || 'Not provided'}</p>
              <a href="#" style={{ color: '#007185', fontSize: '13px', textDecoration: 'none', display: 'block', marginTop: '10px' }}>Add delivery instructions</a>
            </div>

            <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a href="#" style={{ color: '#007185', fontSize: '13px', textDecoration: 'none' }}>Edit</a>
              <span style={{ color: '#ddd' }}>|</span>
              <button onClick={() => handleRemove(idx)} style={{ color: '#007185', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>
              {!address.isDefault && (
                <>
                  <span style={{ color: '#ddd' }}>|</span>
                  <button onClick={() => handleSetDefault(idx)} style={{ color: '#007185', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Set as Default</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {isAdding && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '500px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Add a new address</h2>
                <CloseIcon style={{ cursor: 'pointer' }} onClick={() => setIsAdding(false)} />
              </div>

              <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>Street address</label>
                  <input required value={form.street} onChange={e => setForm({...form, street: e.target.value})} type="text" style={{ width: '100%', padding: '8px 10px', border: '1px solid #a6a6a6', borderRadius: '3px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>City</label>
                  <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} type="text" style={{ width: '100%', padding: '8px 10px', border: '1px solid #a6a6a6', borderRadius: '3px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>State</label>
                    <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} type="text" style={{ width: '100%', padding: '8px 10px', border: '1px solid #a6a6a6', borderRadius: '3px', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>Pincode</label>
                    <input required value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} type="text" style={{ width: '100%', padding: '8px 10px', border: '1px solid #a6a6a6', borderRadius: '3px', outline: 'none' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="isDefault" style={{ fontSize: '14px' }}>Make this my default address</label>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" style={{ background: '#ffd814', borderColor: '#FCD200', borderStyle: 'solid', borderWidth: '1px', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '13px', width: '100%', boxShadow: '0 2px 5px rgba(213,217,217,.5)' }}>Add address</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
