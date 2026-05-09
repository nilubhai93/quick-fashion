import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBikeRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CameraAltIcon from '@mui/icons-material/CameraAltRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import PaymentIcon from '@mui/icons-material/PaymentRounded';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupeeRounded';
import NavigationIcon from '@mui/icons-material/NavigationRounded';
import NearMeIcon from '@mui/icons-material/NearMeRounded';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconImg from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: iconImg,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom green icon for driver location
const driverIcon = L.divIcon({
  className: '',
  html: `<div style="background:#29ffc6;width:16px;height:16px;border-radius:50%;border:3px solid #121218;box-shadow:0 0 12px rgba(41,255,198,0.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Custom red icon for drop location
const dropIcon = L.divIcon({
  className: '',
  html: `<div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid #121218;box-shadow:0 0 12px rgba(239,68,68,0.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Calculate distance between two lat/lng points (Haversine formula)
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Auto-fit bounds component
function FitBounds({ driverPos, dropPos, sellerPos }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (driverPos) points.push(driverPos);
    if (dropPos) points.push(dropPos);
    if (sellerPos) points.push(sellerPos);

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], 16);
    }
  }, [driverPos, dropPos, sellerPos, map]);
  return null;
}
import { deliveryAPI } from '../../api';

export default function ActiveDeliveryUI({ order, updateStatus, refreshOrders }) {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [cashCollected, setCashCollected] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [reaching, setReaching] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const fileInputRef = useRef(null);

  // Robust return detection
  const isReturnOrder = order.status === 'return-requested' || 
                        order.status === 'returning' || 
                        order.status === 'returned' ||
                        !!order.returnDetails?.reason;

  // Step logic for standard vs return flows
  // 1: Heading to Pickup, 2: At Pickup/Verify, 3: Heading to Drop-off, 4: At Drop-off/Verify
  let step = 1;
  if (!isReturnOrder) {
    if (order.status === 'reached') step = 4;
    else if (order.status === 'out-for-delivery') step = 3;
    else if (order.status === 'picking') step = 2;
  } else {
    // Return Flow: 
    // return-requested (unpicked) -> picking (at user) -> returning (in transit to hub) -> returned (at hub)
    if (order.status === 'returned') step = 4;
    else if (order.status === 'returning') step = 3;
    else if (order.status === 'picking') step = 2;
    else if (order.status === 'return-requested') step = 1;
  }

  const isCOD = order.paymentMethod === 'cod';
  const isPaid = order.paymentStatus === 'paid';
  const hasDeliveryCoords = order.deliveryLocation?.lat && order.deliveryLocation?.lng;
  const hasPickupCoords = order.returnDetails?.pickupLocation?.lat && order.returnDetails?.pickupLocation?.lng;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [routeCoords, setRouteCoords] = useState([]);

  // Fetch real road route from OSRM
  useEffect(() => {
    if (!order.sellerHubLocation?.lat || !hasDeliveryCoords || !driverLocation) return;

    const fetchRoute = async () => {
      try {
        // Construct points: current driver location -> next stop -> final destination
        const points = `${driverLocation.lng},${driverLocation.lat};${order.sellerHubLocation.lng},${order.sellerHubLocation.lat};${order.deliveryLocation.lng},${order.deliveryLocation.lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson&steps=true`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes?.[0]) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteCoords(coords);
        }
      } catch (e) {
        console.error('OSRM Route fetch error:', e);
      }
    };

    fetchRoute();
  }, [driverLocation?.lat, driverLocation?.lng, order.sellerHubLocation, order.deliveryLocation]);

  const handleGetDirections = () => {
    let destLat, destLng;
    if (!isReturnOrder) {
      if (step <= 2) {
        destLat = order.sellerHubLocation?.lat;
        destLng = order.sellerHubLocation?.lng;
      } else {
        destLat = order.deliveryLocation?.lat;
        destLng = order.deliveryLocation?.lng;
      }
    } else {
      // Return flow directions
      if (step === 1) {
        destLat = order.returnDetails?.pickupLocation?.lat;
        destLng = order.returnDetails?.pickupLocation?.lng;
      } else {
        destLat = order.sellerHubLocation?.lat;
        destLng = order.sellerHubLocation?.lng;
      }
    }
    
    if (!destLat || !destLng) return alert('Destination coordinates not available');

    const origin = driverLocation ? `${driverLocation.lat},${driverLocation.lng}` : '';
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destLat},${destLng}&travelmode=driving&dir_action=navigate`;
    
    window.open(url, '_blank');
  };

  // Track driver's live location
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Geolocation error:', err)
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error('Geolocation watch error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);

  const distance = (driverLocation && hasDeliveryCoords)
    ? getDistanceKm(driverLocation.lat, driverLocation.lng, order.deliveryLocation.lat, order.deliveryLocation.lng)
    : null;

  const handleArrivedAtSeller = () => {
    if (isReturnOrder) {
      // For returns, step 1 -> step 2 is arriving at customer
      // But we use 'picking' status for both hubs and customers for now
      updateStatus(order._id, 'picking'); 
    } else {
      updateStatus(order._id, 'picking');
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setTimeout(() => setPhotoUploaded(true), 1000);
    }
  };

  const handleConfirmPickup = () => {
    if (!photoUploaded) return;
    if (isReturnOrder) {
      updateStatus(order._id, 'returning');
    } else {
      updateStatus(order._id, 'out-for-delivery');
    }
  };

  // Mark as reached — generates OTP
  const handleReached = async () => {
    setReaching(true);
    try {
      await deliveryAPI.markReached(order._id);
      // Refresh orders
      if (refreshOrders) refreshOrders();
    } catch (e) {
      alert('Failed to mark as reached.');
    } finally {
      setReaching(false);
    }
  };

  const [otpVerified, setOtpVerified] = useState(false);

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otpInput];
    newOtp[index] = value.slice(-1);
    setOtpInput(newOtp);
    setOtpError('');
    // Auto-focus next
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const code = otpInput.join('');
    if (code.length !== 4) {
      setOtpError('Please enter the 4-digit code');
      return;
    }
    setVerifying(true);
    setOtpError('');
    try {
      await deliveryAPI.verifyOTP(order._id, code);
      setOtpVerified(true);
      // If NOT COD, we can refresh immediately as it's done
      if (!isCOD) {
        if (refreshOrders) refreshOrders();
      }
    } catch (e) {
      setOtpError(e.response?.data?.error || 'Invalid OTP. Try again.');
      setOtpInput(['', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleFinalComplete = async () => {
    // This is called after money is collected in COD flow
    if (refreshOrders) refreshOrders();
  };

  const paymentMethodLabel = {
    'cod': '💵 Cash on Delivery',
    'upi': '📱 UPI',
    'card': '💳 Card',
    'wallet': '👛 Wallet'
  };

  return (
    <div style={{ marginTop: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid rgba(41,255,198,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Active Delivery Route</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(41,255,198,0.2)', color: '#065f46', fontSize: '12px', fontWeight: 800 }}>
            {isReturnOrder 
              ? (step === 1 ? 'Heading to Customer' : step === 2 ? 'Verifying Return' : 'Heading to Hub')
              : (step === 1 ? 'Heading to Hub' : step === 2 ? 'Verifying Pickup' : 'Heading to Customer')
            }
          </span>
          <span style={{
            padding: '6px 12px', borderRadius: '20px',
            background: isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
            color: isPaid ? '#10b981' : '#f59e0b',
            fontSize: '12px', fontWeight: 700
          }}>
            {isPaid ? '✅ PAID' : '💰 COD'}
          </span>
        </div>
      </div>

      {/* Active Route Info Card */}
      <div style={{
        display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr', gap: isMobile ? '12px' : '20px', marginBottom: '24px'
      }}>
        <div style={{
          padding: isMobile ? '12px 8px' : '20px', borderRadius: '16px', background: 'rgba(249,115,22,0.05)',
          border: '1px solid rgba(249,115,22,0.1)', textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? '10px' : '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Distance</div>
          <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: '#f97316' }}>
            {order.deliveryDistanceKm || '--'} <span style={{ fontSize: isMobile ? '10px' : '14px' }}>km</span>
          </div>
          <div style={{ fontSize: isMobile ? '9px' : '12px', color: 'var(--text-muted)' }}>Total Route</div>
        </div>

        <div style={{
          padding: isMobile ? '12px 8px' : '20px', borderRadius: '16px', background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.1)', textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? '10px' : '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Earnings</div>
          <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: '#10b981' }}>
            ₹{order.deliveryEarnings || 0}
          </div>
          <div style={{ fontSize: isMobile ? '9px' : '12px', color: 'var(--text-muted)' }}>@ ₹10/km</div>
        </div>
      </div>


      {/* Real-time Logistics Map */}
      <div style={{
        height: isMobile ? '280px' : '350px', width: '100%', borderRadius: 'var(--radius-md)',
        overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border)', position: 'relative'
      }}>
        <MapContainer
          center={[order.sellerHubLocation?.lat || 22.5726, order.sellerHubLocation?.lng || 88.3639]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Hub Marker */}
          {order.sellerHubLocation?.lat && (
            <Marker position={[order.sellerHubLocation.lat, order.sellerHubLocation.lng]} 
              icon={L.divIcon({
                className: '',
                html: `<div style="background:${isReturnOrder ? '#ef4444' : '#8b5cf6'};width:18px;height:18px;border-radius:50%;border:3px solid #121218;box-shadow:0 0 15px ${isReturnOrder ? 'rgba(239,68,68,0.7)' : 'rgba(139,92,246,0.7)'};display:flex;align-items:center;justify-content:center;color:white;"><i class="material-icons" style="font-size:10px;">store</i></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9]
              })}
            >
              <Popup>
                <strong style={{ color: isReturnOrder ? '#ef4444' : '#8b5cf6' }}>{isReturnOrder ? '📍 Drop-off Hub' : '🏪 Pickup Hub'}</strong><br />
                {order.items[0]?.productId?.sellerId?.sellerProfile?.storeName || 'Fashion Hub'}
              </Popup>
            </Marker>
          )}

          {/* Customer Marker */}
          {(isReturnOrder ? hasPickupCoords : hasDeliveryCoords) && (
            <Marker 
              position={isReturnOrder 
                ? [order.returnDetails.pickupLocation.lat, order.returnDetails.pickupLocation.lng] 
                : [order.deliveryLocation.lat, order.deliveryLocation.lng]
              } 
              icon={isReturnOrder ? L.divIcon({
                className: '',
                html: `<div style="background:#8b5cf6;width:16px;height:16px;border-radius:50%;border:3px solid #121218;box-shadow:0 0 12px rgba(139,92,246,0.6);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              }) : dropIcon}
            >
              <Popup>
                <strong style={{ color: isReturnOrder ? '#8b5cf6' : '#ef4444' }}>{isReturnOrder ? '🏪 Pickup Point' : '📍 Drop-off Point'}</strong><br />
                {order.userId?.name}
              </Popup>
            </Marker>
          )}

          {/* Driver Live Position */}
          {driverLocation && (
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup>
                <strong style={{ color: '#29ffc6' }}>🚴 You are here</strong>
              </Popup>
            </Marker>
          )}

          {/* Road-based Route Polyline */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: isReturnOrder ? '#ef4444' : '#8b5cf6', weight: 6, opacity: 0.9, lineJoin: 'round' }}
            />
          )}

          <FitBounds 
            driverPos={driverLocation ? [driverLocation.lat, driverLocation.lng] : null}
            dropPos={isReturnOrder ? [order.sellerHubLocation.lat, order.sellerHubLocation.lng] : (hasDeliveryCoords ? [order.deliveryLocation.lat, order.deliveryLocation.lng] : null)}
            sellerPos={isReturnOrder ? (hasPickupCoords ? [order.returnDetails.pickupLocation.lat, order.returnDetails.pickupLocation.lng] : null) : (order.sellerHubLocation?.lat ? [order.sellerHubLocation.lat, order.sellerHubLocation.lng] : null)}
          />
        </MapContainer>

      </div>

      {/* Get Directions Button */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGetDirections}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
            background: 'white', color: '#1a1a1a', fontWeight: 800, fontSize: '15px',
            border: '1px solid var(--border)', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <NavigationIcon sx={{ fontSize: '20px', color: '#4285F4' }} />
          Get Directions on Google Maps
        </motion.button>
      </div>

      {/* Action Area */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <strong>Next Stop:</strong> {isReturnOrder ? `Customer: ${order.userId?.name}` : 'FlashFit Hub (Seller Location)'}
            </div>
            <button onClick={handleArrivedAtSeller} style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--gradient-primary)', color: 'white', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px var(--accent-glow)' }}>
              {isReturnOrder ? 'I have Arrived at Customer Location' : 'I have Arrived at Seller Hub'}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>
              {isReturnOrder ? 'Verify Return: Snapshot of the product being returned' : 'Verify Pickup: Snapshot of the package is required'}
            </div>
            
            {!photoUploaded ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={handleUploadClick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '2px dashed var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <CameraAltIcon sx={{ fontSize: '24px' }} />
                  Take Package Picture
                </button>
                <input type="file" accept="image/*" capture ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <CheckCircleOutlineIcon />
                <span style={{ fontWeight: 600 }}>Photo Verified! Secure the package in your vehicle.</span>
              </motion.div>
            )}

            <button 
              onClick={handleConfirmPickup} 
              disabled={!photoUploaded}
              style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', background: photoUploaded ? 'var(--gradient-primary)' : 'var(--bg-elevated)', color: photoUploaded ? 'white' : 'var(--text-muted)', fontWeight: 800, fontSize: '16px', border: photoUploaded ? 'none' : '1px solid var(--border)', cursor: photoUploaded ? 'pointer' : 'not-allowed', marginTop: '16px', transition: 'all 0.3s' }}
            >
              {photoUploaded ? (isReturnOrder ? 'Start Navigation to Hub' : 'Start Navigation to Customer') : 'Upload Photo to Continue'}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            {/* Destination Info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', padding: '16px', background: isReturnOrder ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: isReturnOrder ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)' }}>
              {isReturnOrder ? <StorefrontIcon sx={{ color: 'var(--error)' }} /> : <LocationOnIcon sx={{ color: 'var(--error)' }} />}
              <div>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {isReturnOrder ? 'Return to Seller Hub' : 'Dropoff Location'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {isReturnOrder ? (order.items[0]?.productId?.sellerId?.sellerProfile?.storeName || 'Fashion Hub') : order.userId?.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {isReturnOrder ? (order.items[0]?.productId?.sellerId?.sellerProfile?.businessAddress) : `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}, ${order.deliveryAddress?.zip}`}
                </div>
              </div>
            </div>

            {/* Reached Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isReturnOrder ? () => updateStatus(order._id, 'returned') : handleReached}
              disabled={reaching}
              style={{
                width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
                background: reaching ? 'var(--bg-card)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: reaching ? 'var(--text-muted)' : 'white',
                fontWeight: 800, fontSize: '16px',
                border: reaching ? '1px solid var(--border)' : 'none',
                cursor: reaching ? 'not-allowed' : 'pointer',
                boxShadow: reaching ? 'none' : '0 4px 20px rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.3s'
              }}
            >
              {isReturnOrder ? <CheckCircleIcon /> : <LocationOnIcon />} 
              {isReturnOrder ? 'Mark as Returned to Hub' : (reaching ? 'Marking...' : '📍 Reached Delivery Location')}
            </motion.button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            {/* Reached Banner */}
            <div style={{
              padding: '14px 16px', borderRadius: '12px', marginBottom: '20px',
              background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)',
              display: 'flex', alignItems: 'center', gap: '10px', color: '#f97316', fontWeight: 700, fontSize: '14px'
            }}>
              <LocationOnIcon /> You have reached the delivery location
            </div>

            {/* OTP Verification Section (FIRST STEP) */}
            {!otpVerified ? (
              <div style={{
                padding: '24px', borderRadius: 'var(--radius-lg)',
                background: '#fff', border: '2px solid #121218',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#121218', marginBottom: '8px' }}>Enter Verification Code</div>
                  <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 600, lineHeight: 1.5 }}>Ask the customer for the 4-digit OTP<br/>shown on their Orders page</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
                  {otpInput.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '60px', height: '70px', textAlign: 'center',
                        fontSize: '32px', fontWeight: 900,
                        borderRadius: '12px', border: `2px solid ${otpError ? '#ef4444' : digit ? '#10b981' : '#121218'}`,
                        background: '#fff', color: '#121218',
                        outline: 'none', transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>{otpError}</div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOTP}
                  disabled={verifying || otpInput.join('').length !== 4}
                  style={{
                    width: '100%', padding: '18px', borderRadius: '16px',
                    background: otpInput.join('').length === 4 ? '#121218' : '#e5e7eb',
                    color: otpInput.join('').length === 4 ? 'white' : '#9ca3af',
                    fontWeight: 900, fontSize: '16px', border: 'none',
                    cursor: otpInput.join('').length === 4 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {verifying ? 'Verifying...' : 'Verify Recipient'}
                </motion.button>
              </div>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '20px', borderRadius: '16px', marginBottom: '20px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981',
                  display: 'flex', alignItems: 'center', gap: '12px', color: '#065f46', fontWeight: 800
                }}
              >
                <CheckCircleIcon /> Recipient Verified Successfully
              </motion.div>
            )}

            {/* Payment Info & Collection (SECOND STEP - Only if COD and OTP verified) */}
            {otpVerified && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px',
                  padding: '16px', borderRadius: '16px',
                  background: isCOD ? '#fff9f2' : '#f0fdf4',
                  border: `2px solid ${isCOD ? '#f59e0b' : '#10b981'}`
                }}>
                  {isCOD ? <CurrencyRupeeIcon sx={{ color: '#f59e0b', fontSize: '28px' }} /> : <CheckCircleIcon sx={{ color: '#10b981', fontSize: '28px' }} />}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: isCOD ? '#b45309' : '#166534' }}>
                      {isCOD ? 'Pending Payment Collection' : 'Payment Verified'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#121218', fontWeight: 600 }}>
                      {isCOD
                        ? `Please collect ₹${Math.round(order.totalAmount).toLocaleString()} in cash.`
                        : `Already paid online. You can now hand over the package.`
                      }
                    </div>
                  </div>
                </div>

                {isCOD && !cashCollected && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCashCollected(true)}
                    style={{
                      width: '100%', padding: '20px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white', fontWeight: 900, fontSize: '16px', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
                    }}
                  >
                    <CurrencyRupeeIcon /> Confirm Cash Collected
                  </motion.button>
                )}

                {(cashCollected || !isCOD) && (
                  <motion.button
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinalComplete}
                    style={{
                      width: '100%', padding: '20px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white', fontWeight: 900, fontSize: '18px', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      boxShadow: '0 8px 25px rgba(16,185,129,0.4)', marginTop: '10px'
                    }}
                  >
                    <LocalShippingIcon /> Complete Delivery
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
