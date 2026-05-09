import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../api';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import CelebrationIcon from '@mui/icons-material/CelebrationRounded';
import MyLocationIcon from '@mui/icons-material/MyLocationRounded';
import AddLocationAltRoundedIcon from '@mui/icons-material/AddLocationAltRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Checkout() {
  const { items, subtotal, bundleSuggestion, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirm
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    zip: user?.addresses?.[0]?.zip || '',
  });
  const [coords, setCoords] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [addressSubStep, setAddressSubStep] = useState(0); // 0=choose/new, 1=map, 2=form
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Fetch saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await orderAPI.getAddresses();
        const addrs = res.data?.addresses || [];
        setSavedAddresses(addrs);
        // If no saved addresses, skip straight to map
        if (addrs.length === 0) setAddressSubStep(1);
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
        setAddressSubStep(1);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleSelectSavedAddress = (saved) => {
    setAddress(saved.address);
    if (saved.location?.lat && saved.location?.lng) {
      setCoords({ lat: saved.location.lat, lng: saved.location.lng });
    }
    setAddressSubStep(2);
  };

  const fetchAddressDetails = async (lat, lon) => {
    setFetchingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.address) {
        setAddress(prev => ({
          ...prev,
          street: data.address.road || data.address.suburb || data.address.neighbourhood || prev.street,
          city: data.address.city || data.address.town || data.address.village || data.address.county || prev.city,
          state: data.address.state || prev.state,
          zip: data.address.postcode || prev.zip
        }));
      }
    } catch (err) {
      console.error("Failed to fetch address details:", err);
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleAutoFillLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setCoords({ lat, lng: lon });
      fetchAddressDetails(lat, lon);
    }, (error) => {
      console.error(error);
      alert("Unable to retrieve your location");
      setFetchingLocation(false);
    });
  };

  const LocationMarker = () => {
    const markerRef = useRef(null);
    const map = useMap();

    useEffect(() => {
      if (coords) {
        map.flyTo(coords, Math.max(map.getZoom(), 16), { animate: true, duration: 1.5 });
      }
    }, [coords, map]);

    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current;
          if (marker != null) {
            const newPos = marker.getLatLng();
            setCoords({ lat: newPos.lat, lng: newPos.lng });
            fetchAddressDetails(newPos.lat, newPos.lng);
          }
        },
      }),
      [],
    );

    useMapEvents({
      click(e) {
        setCoords(e.latlng);
        fetchAddressDetails(e.latlng.lat, e.latlng.lng);
      },
    });

    return coords === null ? null : (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={coords}
        ref={markerRef}
      ></Marker>
    );
  };

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const deliveryFee = subtotal > 999 ? 0 : 49;
  const bundleDiscount = bundleSuggestion?.isActive ? (subtotal * (bundleSuggestion.discount || 15)) / 100 : 0;
  const total = subtotal - bundleDiscount + deliveryFee;

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
    transition: 'border var(--transition-fast)'
  };

  const paymentOptions = [
    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when it arrives' },
    { value: 'upi', label: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, etc.' },
    { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
    { value: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm, Amazon Pay' },
  ];

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.create({
        deliveryAddress: address,
        paymentMethod,
        deliveryLocation: coords || undefined,
        deliveryFee
      });
      setOrderResult(res.data);
      setStep(3);
      // Cart will be cleared server-side
      await clearCart();
    } catch (err) {
      console.error('Place order error:', err);
      alert(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0 && !orderResult) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '80px' }}>
        <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, marginBottom: '12px' }}>No items to checkout</h2>
        <Link to="/products" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  // Step 3 — Success
  if (step === 3 && orderResult) {
    return (
      <div className="container" style={{ padding: '20px', textAlign: 'center', maxWidth: '500px', marginTop: '10px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CelebrationIcon sx={{ fontSize: '24px', color: 'var(--success)' }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 style={{
            fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)',
            marginBottom: '4px'
          }}>
            Order Placed! <span className="gradient-text">🎉</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            Your fashion is on its way — estimated delivery in <strong style={{ color: 'var(--success)' }}>
              {orderResult.estimatedDelivery}
            </strong>
          </p>

          <div style={{
            padding: '20px', borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            marginBottom: '20px', textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Order #{orderResult.order?._id?.slice(-8).toUpperCase()}
              </span>
              <span style={{
                padding: '2px 10px', borderRadius: 'var(--radius-full)',
                background: 'rgba(59,130,246,0.15)', color: 'var(--info)',
                fontSize: '12px', fontWeight: 700
              }}>
                {orderResult.order?.status?.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800 }} className="gradient-text">
              ₹{Math.round(orderResult.order?.totalAmount || 0).toLocaleString()}
            </div>
            {orderResult.order?.deliveryFee > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                incl. ₹{orderResult.order.deliveryFee} delivery charges
              </div>
            )}
            {orderResult.order?.deliveryFee === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>
                🎉 Free delivery!
              </div>
            )}
            {orderResult.order?.discount > 0 && (
              <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--success)', marginTop: '4px' }}>
                Bundle discount saved you ₹{orderResult.order.discount}!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={`/orders/${orderResult.order?._id}/track`} className="btn btn-primary"
              style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: '14px' }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: '18px' }} /> Track Order
            </Link>
            <Link to="/shop" className="btn btn-outline"
              style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: '14px' }}>
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px 20px 40px', maxWidth: '900px', marginTop: '10px' }}>
      {/* Back */}
      <Link to="/cart" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px', fontSize: '13px'
      }}>
        <ArrowBackIcon sx={{ fontSize: '18px' }} /> Back to Cart
      </Link>

      {/* Steps */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px'
      }}>
        {[
          { num: 1, label: 'Delivery', icon: <LocalShippingOutlinedIcon sx={{ fontSize: '18px' }} /> },
          { num: 2, label: 'Payment', icon: <PaymentIcon sx={{ fontSize: '18px' }} /> },
          { num: 3, label: 'Confirm', icon: <CheckCircleIcon sx={{ fontSize: '18px' }} /> }
        ].map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: step >= s.num ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: `1px solid ${step >= s.num ? 'transparent' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step >= s.num ? 'white' : 'var(--text-muted)',
              transition: 'all var(--transition-base)'
            }}>{s.icon}</div>
            <span style={{
              fontSize: '13px', fontWeight: 600,
              color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)'
            }}>{s.label}</span>
            {i < 2 && <div style={{
              width: '30px', height: '2px',
              background: step > s.num ? 'var(--accent)' : 'var(--border)'
            }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        {/* Left — Form */}
        <div>
          {/* Sub-step 0: Choose Previous or Add New */}
          {step === 1 && addressSubStep === 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)', border: '1px solid var(--border)'
              }}>
              <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LocalShippingOutlinedIcon sx={{ color: 'var(--accent-light)' }} /> Delivery Address
              </h2>

              {loadingAddresses ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading saved addresses...</div>
              ) : (
                <>
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HistoryRoundedIcon sx={{ fontSize: '16px' }} /> Previously Used
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedAddresses.map((saved, i) => (
                          <motion.button
                            key={saved._id || i}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSelectSavedAddress(saved)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                              cursor: 'pointer', textAlign: 'left', width: '100%',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'var(--accent-bg)', border: '1px solid rgba(168,85,247,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <PlaceRoundedIcon sx={{ fontSize: '18px', color: 'var(--accent-light)' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {saved.label && <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-light)', marginBottom: '1px' }}>{saved.label}</div>}
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {saved.address?.street || 'No street'}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {[saved.address?.city, saved.address?.state, saved.address?.zip].filter(Boolean).join(', ')}
                              </div>
                            </div>
                            <div style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-full)',
                              background: 'var(--accent-bg)', border: '1px solid rgba(168,85,247,0.2)',
                              fontSize: '11px', fontWeight: 600, color: 'var(--accent-light)',
                              whiteSpace: 'nowrap'
                            }}>
                              Use this
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {savedAddresses.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 16px' }}>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
                      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>
                  )}

                  {/* Add New Address Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setAddress({ street: '', city: '', state: '', zip: '' });
                      setCoords(null);
                      setAddressSubStep(1);
                    }}
                    style={{
                      width: '100%', padding: '14px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--gradient-primary)',
                      color: 'white', fontSize: '14px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 15px var(--accent-glow)'
                    }}
                  >
                    <AddLocationAltRoundedIcon sx={{ fontSize: '20px' }} />
                    Add New Address
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* Sub-step 1: Map Location Picker */}
          {step === 1 && addressSubStep === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)', border: '1px solid var(--border)'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MyLocationIcon sx={{ color: 'var(--accent-light)' }} /> Set Location
                </h2>
                <button 
                  onClick={handleAutoFillLocation}
                  disabled={fetchingLocation}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600,
                    cursor: fetchingLocation ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    opacity: fetchingLocation ? 0.7 : 1
                  }}
                >
                  <MyLocationIcon sx={{ fontSize: '14px', color: 'var(--accent)' }} /> 
                  {fetchingLocation ? 'Locating...' : 'Auto-fill Location'}
                </button>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '16px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', height: '280px', width: '100%', position: 'relative' }}>
                <MapContainer center={coords || { lat: 22.5726, lng: 88.3639 }} zoom={coords ? 15 : 10} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker />
                </MapContainer>
                {!coords && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', pointerEvents: 'none' }}>
                    <MyLocationIcon sx={{ fontSize: '32px', opacity: 0.9, marginBottom: '8px', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
                    <p style={{ fontWeight: 600, fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Click map or use Auto-fill</p>
                  </div>
                )}
              </motion.div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {savedAddresses.length > 0 && (
                  <button onClick={() => { setAddressSubStep(0); }} className="btn btn-outline"
                    style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)' }}>
                    ← Back
                  </button>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setAddressSubStep(2)}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '12px', fontSize: '14px', borderRadius: 'var(--radius-lg)' }}>
                  Confirm & Proceed →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 1 && addressSubStep === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)', border: '1px solid var(--border)'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LocalShippingOutlinedIcon sx={{ color: 'var(--accent-light)' }} /> Delivery Address
                </h2>
              </div>

              {/* Map Preview/Editor */}
              <div style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ height: '180px', width: '100%' }}>
                  <MapContainer center={coords || { lat: 22.5726, lng: 88.3639 }} zoom={coords ? 15 : 10} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                  </MapContainer>
                </div>
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                  <button onClick={handleAutoFillLocation} disabled={fetchingLocation} style={{ padding: '6px 12px', borderRadius: '20px', background: 'white', color: 'black', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <MyLocationIcon sx={{ fontSize: '14px', color: 'var(--accent)' }} /> {fetchingLocation ? '...' : 'Auto-fill'}
                  </button>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  📍 Tip: Drag the marker to fine-tune your delivery location
                </div>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Street Address</label>
                  <input value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                    placeholder="123 Main Street" required style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>City</label>
                    <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                      placeholder="Mumbai" required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>State</label>
                    <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})}
                      placeholder="Maharashtra" required style={inputStyle} />
                  </div>
                </div>
                <div style={{ maxWidth: '160px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>ZIP Code</label>
                  <input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})}
                    placeholder="400001" required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button onClick={() => savedAddresses.length > 0 ? setAddressSubStep(0) : setAddressSubStep(1)} className="btn btn-outline"
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)' }}>
                  ← Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!address.street || !address.city || !address.zip) {
                      alert('Please fill all address fields');
                      return;
                    }
                    try {
                      await orderAPI.saveAddress({ address, location: coords || undefined });
                    } catch (e) {
                      console.error("Failed to save address history", e);
                    }
                    setStep(2);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '12px', fontSize: '14px', borderRadius: 'var(--radius-lg)' }}>
                  Continue to Payment →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-card)', border: '1px solid var(--border)'
              }}>
              <h2 style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PaymentIcon sx={{ color: 'var(--accent-light)' }} /> Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {paymentOptions.map(opt => (
                  <motion.button key={opt.value} whileHover={{ scale: 1.01 }}
                    onClick={() => setPaymentMethod(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                      background: paymentMethod === opt.value ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                      border: `1.5px solid ${paymentMethod === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all var(--transition-fast)'
                    }}>
                    <span style={{ fontSize: '18px' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</div>
                    </div>
                    <div style={{
                      marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%',
                      border: `2px solid ${paymentMethod === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: paymentMethod === opt.value ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {paymentMethod === opt.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button onClick={() => setStep(1)} className="btn btn-outline"
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-lg)' }}>
                  ← Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder} disabled={loading}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '12px', fontSize: '14px', borderRadius: 'var(--radius-lg)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Placing Order...' : `Place Order · ₹${Math.round(total).toLocaleString()}`}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right — Summary */}
        <div style={{ position: 'sticky', top: '72px' }}>
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Order Summary</h3>

            {/* Items mini list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {items.slice(0, 4).map(item => (
                <div key={item._id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.product?.images?.[0] || 'https://placehold.co/48x48/1a1a25/9a9ab0?text=Img'}
                    alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {item.size} × {item.quantity}{item.isRental ? ` · ${item.rentalDays}d rent` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: item.isRental ? 'var(--info)' : 'var(--text-primary)' }}>
                    ₹{(item.isRental && item.rentalDays > 0
                      ? (item.product?.rentPricePerDay || 0) * item.rentalDays * item.quantity
                      : (item.product?.discountPrice || item.product?.price || 0) * item.quantity
                    ).toLocaleString()}
                  </div>
                </div>
              ))}
              {items.length > 4 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  +{items.length - 4} more items
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {bundleDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--success)' }}>Bundle Discount</span>
                  <span style={{ color: 'var(--success)' }}>-₹{bundleDiscount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span style={{ color: deliveryFee === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '14px', fontWeight: 800 }} className="gradient-text">
                  ₹{Math.round(total).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{
              marginTop: '12px', padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', color: 'var(--success)'
            }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: '18px' }} />
              Est. delivery: <strong>20-30 min</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){.container>div:last-child{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
