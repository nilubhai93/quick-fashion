import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NavigationIcon from '@mui/icons-material/NavigationRounded';
import { deliveryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import ActiveDeliveryUI from '../../components/delivery/ActiveDeliveryUI';

export default function DeliveryOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadOrders();
    window.scrollTo(0, 0);
    
    // Poll every 5 seconds for new assignments or status changes
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const [driverPos, setDriverPos] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('Pickup geolocation error:', err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, loading]);

  function getDistanceKm(lat1, lng1, lat2, lng2) {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  const loadOrders = async () => {
    try {
      const res = await deliveryAPI.getCurrentOrders();
      // Show both assigned (new) and accepted (in-progress) orders
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await deliveryAPI.acceptOrder(id);
      loadOrders(); // Refresh
    } catch (e) {
      alert('Failed to accept order.');
    }
  };

  const handleReject = async (id) => {
    try {
      await deliveryAPI.rejectOrder(id);
      loadOrders(); // Refresh
    } catch (e) {
      alert('Failed to reject order.');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await deliveryAPI.updateOrderStatus(id, status);
      loadOrders();
    } catch (e) {
      alert(`Failed to mark as ${status}.`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>My Deliveries</h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No active orders assigned right now. Keep your status Online.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map(order => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Order #{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                  <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>{order.items.length} items to deliver</div>
                </div>
                <div style={{ padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700, height: 'fit-content' }}>
                  {order.status}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {/* Pickup Point */}
                <div style={{ padding: '12px', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <StorefrontIcon sx={{ color: 'var(--accent)', fontSize: '18px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pickup</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {order.items[0]?.productId?.sellerId?.sellerProfile?.storeName || 'Fashion Hub'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                    {order.items[0]?.productId?.sellerId?.sellerProfile?.businessAddress || 'Pickup address not specified'}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const lat = order.sellerHubLocation?.lat;
                      const lng = order.sellerHubLocation?.lng;
                      if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
                    }}
                    style={{
                      marginTop: '10px', padding: '5px 10px', borderRadius: '8px',
                      background: 'rgba(99,102,241,0.1)', color: 'var(--accent)',
                      border: '1px solid rgba(99,102,241,0.3)', fontSize: '11px', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <NavigationIcon sx={{ fontSize: '12px' }} />
                    Directions
                  </button>

                  {driverPos && order.sellerHubLocation?.lat && (
                    <div style={{ 
                      position: 'absolute', top: '-8px', right: '10px',
                      background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <div style={{ width: '4px', height: '4px', background: 'var(--accent)', borderRadius: '50%' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent)' }}>
                        {getDistanceKm(driverPos.lat, driverPos.lng, order.sellerHubLocation.lat, order.sellerHubLocation.lng)} km
                      </span>
                    </div>
                  )}
                </div>

                {/* Drop-off Point */}
                <div style={{ padding: '12px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <LocationOnIcon sx={{ color: 'var(--error)', fontSize: '18px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Drop-off</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {order.userId?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const lat = order.deliveryLocation?.lat;
                      const lng = order.deliveryLocation?.lng;
                      if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
                    }}
                    style={{
                      marginTop: '10px', padding: '5px 10px', borderRadius: '8px',
                      background: 'rgba(239,68,68,0.1)', color: 'var(--error)',
                      border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <NavigationIcon sx={{ fontSize: '12px' }} />
                    Directions
                  </button>

                  {order.deliveryDistanceKm > 0 && (
                    <div style={{ 
                      position: 'absolute', top: '-8px', right: '10px',
                      background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <div style={{ width: '4px', height: '4px', background: '#f97316', borderRadius: '50%' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#f97316' }}>{order.deliveryDistanceKm} km</span>
                    </div>
                  )}
                </div>
              </div>

              {order.delivery?.status === 'accepted' ? (
                <ActiveDeliveryUI 
                  order={order} 
                  updateStatus={updateStatus} 
                  refreshOrders={loadOrders} 
                />
              ) : (
                /* Assigned but not yet accepted */
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleAccept(order._id)} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: 'var(--success)', color: 'white',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Accept Order
                  </button>
                  <button onClick={() => handleReject(order._id)} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: 'var(--bg-elevated)', color: 'var(--error)',
                    border: '1px solid var(--error)',
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
