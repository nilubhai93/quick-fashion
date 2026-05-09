import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import InventoryIcon from '@mui/icons-material/InventoryRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDiningRounded';
import LocationOnIcon from '@mui/icons-material/LocationOnRounded';

export default function OrderTracking() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    const load = async () => {
      try {
        const [orderRes, trackRes] = await Promise.all([
          orderAPI.getById(id),
          orderAPI.track(id)
        ]);
        setOrder(orderRes.data.order);
        setTracking(trackRes.data.tracking);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();

    // Poll tracking every 30s
    const interval = setInterval(async () => {
      try {
        const [orderRes, trackRes] = await Promise.all([
          orderAPI.getById(id),
          orderAPI.track(id)
        ]);
        setOrder(orderRes.data.order);
        setTracking(trackRes.data.tracking);
      } catch (e) { }
    }, 30000);

    return () => clearInterval(interval);
  }, [id, isAuthenticated]);

  const deliverySteps = [
    { key: 'placed', label: 'Order Placed', icon: <CheckCircleIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'We received your order' },
    { key: 'confirmed', label: 'Confirmed', icon: <InventoryIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'Order verified & confirmed' },
    { key: 'picking', label: 'Picking', icon: <StorefrontIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'Items being picked' },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: <DeliveryDiningIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'On the way to you' },
    { key: 'reached', label: 'Reached', icon: <LocationOnIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'Driver at your location' },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircleIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'Enjoy your fashion!' },
  ];

  const returnSteps = [
    { key: 'return-requested', label: 'Return Requested', icon: <CheckCircleIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'We are processing your request' },
    { key: 'assigned', label: 'Pickup Assigned', icon: <InventoryIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'Delivery partner assigned' },
    { key: 'returning', label: 'Returning', icon: <DeliveryDiningIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'On the way to seller hub' },
    { key: 'returned', label: 'Returned', icon: <CheckCircleIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />, desc: 'Refund processed' },
  ];

  const isReturnFlow = ['return-requested', 'returning', 'returned'].includes(order?.status);
  const steps = isReturnFlow ? returnSteps : deliverySteps;
  
  // Custom logic for return step index
  let currentIndex = 0;
  if (isReturnFlow) {
    if (order.status === 'return-requested') {
      currentIndex = order.delivery?.status === 'accepted' ? 1 : 0;
    } else if (order.status === 'returning') {
      currentIndex = 2;
    } else if (order.status === 'returned') {
      currentIndex = 3;
    }
  } else {
    currentIndex = deliverySteps.findIndex(s => s.key === order?.status);
  }

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '80px' }}>
        <h2 style={{ marginBottom: '16px' }}>Please sign in</h2>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 24px', maxWidth: '800px', marginTop: '80px' }}>
        <div className="skeleton" style={{ height: '200px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '80px' }}>
        <h2>Order not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '16px' }}>View Orders</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '10px 24px 60px', maxWidth: '700px', marginTop: '10px' }}>
      <Link to="/orders" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '10px', fontSize: '12px',
        fontWeight: 500
      }}>
        <ArrowBackIcon sx={{ fontSize: '16px' }} /> Back to Orders
      </Link>

      <h1 style={{
        fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '1px',
        letterSpacing: '-0.5px'
      }}>
        Order <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>#</span>{order._id.slice(-8).toUpperCase()}
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '16px' }}>
        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>

      {/* Live Progress Bar */}
      {tracking && order.status !== 'delivered' && order.status !== 'cancelled' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px 20px', borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.05))',
            border: '1px solid rgba(168,85,247,0.2)', marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LocalShippingOutlinedIcon sx={{ color: 'var(--accent-light)', fontSize: '20px' }} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Live Tracking</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800 }} className="gradient-text">
                {isReturnFlow ? (
                   <>
                    {order.status === 'return-requested' && (order.delivery?.status === 'accepted' ? 'Partner Assigned' : 'Finding Partner')}
                    {order.status === 'returning' && 'Pickup Done - Returning'}
                    {order.status === 'returned' && 'Returned'}
                   </>
                ) : (
                  <>
                    {order.status === 'placed' && 'Order Placed'}
                    {order.status === 'confirmed' && 'Confirmed'}
                    {order.status === 'picking' && 'Packing Items'}
                    {order.status === 'out-for-delivery' && (tracking.minutesRemaining > 0 ? `${tracking.minutesRemaining} min` : 'Arriving!')}
                    {order.status === 'reached' && 'Arrived!'}
                  </>
                )}
              </span>
            </div>
          <div style={{
            height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tracking.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: '3px',
                background: 'var(--gradient-primary)',
                boxShadow: '0 0 10px var(--accent-glow)'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>{isReturnFlow ? 'Requested' : 'Order placed'}</span>
            <span>{tracking.progress}% complete</span>
            <span>{isReturnFlow ? 'Refunded' : 'Delivered'}</span>
          </div>
        </motion.div>
      )}

      {/* Return Refunded Info */}
      {order.status === 'returned' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '20px', borderRadius: 'var(--radius-xl)',
            background: 'rgba(16, 185, 129, 0.08)', border: '1.5px solid #10b981',
            textAlign: 'center', marginBottom: '24px'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircleIcon sx={{ color: '#10b981', fontSize: '24px' }} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>Refund Successful</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            The product has reached the hub. The refund has been initiated to your original payment method/wallet.
          </p>
        </motion.div>
      )}

      {/* Delivery Verification OTP */}
      {(order.status === 'out-for-delivery' || order.status === 'reached') && order.deliveryOTP && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          style={{
            padding: '20px', borderRadius: 'var(--radius-xl)',
            background: '#0a0a0c', color: 'white',
            textAlign: 'center', marginBottom: '24px',
            border: '1.5px solid #29ffc6',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#29ffc6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
            Delivery Verification Code
          </div>
          <div style={{ 
            fontSize: '36px', fontWeight: 900, letterSpacing: '8px', color: 'white',
            fontFamily: 'monospace', marginBottom: '10px'
          }}>
            {order.deliveryOTP}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            Share this code with the delivery partner to confirm receipt
          </div>
        </motion.div>
      )}

      {/* Stepper */}
      <div style={{
        padding: '20px', borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {steps.map((step, i) => {
            const isCompleted = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step.key} style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <motion.div
                    initial={isCurrent ? { scale: 0.8 } : {}}
                    animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                    transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: isCompleted ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                      border: `2px solid ${isCompleted ? 'transparent' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isCompleted ? 'white' : 'var(--text-muted)',
                      boxShadow: isCurrent ? '0 0 15px var(--accent-glow)' : 'none'
                    }}
                  >
                    {isCompleted ? <CheckCircleIcon sx={{ fontSize: '18px' }} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }} />}
                  </motion.div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: '2px', height: '24px',
                      background: i < currentIndex ? 'var(--accent)' : 'var(--border)'
                    }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? '12px' : 0 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: 700,
                    color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginTop: '4px'
                  }}>{step.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items */}
      <div style={{
        padding: '16px 20px', borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-card)', border: '1px solid var(--border)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Items</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {order.items?.map((item, j) => (
            <div key={j} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)'
            }}>
              {item.image && <img src={item.image} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.name}
                  {item.isRental && (
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--info)', fontSize: '10px', fontWeight: 700 }}>
                      Rent · {item.rentalDays}d
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--text-muted)' }}>
                  Size: {item.size} × {item.quantity}
                  {item.isRental && item.rentPricePerDay > 0 && (
                    <span> · ₹{item.rentPricePerDay}/day</span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 700, color: item.isRental ? 'var(--info)' : 'var(--text-primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(() => {
            const itemsSubtotal = order.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
            const fee = order.deliveryFee || 0;
            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(13px, 2.5vw, 14px)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>₹{itemsSubtotal.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(13px, 2.5vw, 14px)' }}>
                    <span style={{ color: 'var(--success)' }}>Bundle Discount</span>
                    <span style={{ color: 'var(--success)' }}>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(13px, 2.5vw, 14px)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Charges</span>
                  <span style={{ color: fee === 0 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {fee === 0 ? 'FREE' : `₹${fee}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 800 }} className="gradient-text">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
