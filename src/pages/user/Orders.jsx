import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import InventoryIcon from '@mui/icons-material/InventoryRounded';
import LockIcon from '@mui/icons-material/LockRounded';
import StarIcon from '@mui/icons-material/StarRounded';
import StarBorderIcon from '@mui/icons-material/StarBorderRounded';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturnRounded';

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleRate = async (orderId, productId, rating) => {
    setRatingSubmitting(true);
    try {
      await orderAPI.rateItem(orderId, productId, rating);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };
  
  const [returning, setReturning] = useState(false);
  const handleReturn = async (id) => {
    if (!window.confirm('Are you sure you want to return this order? Our partner will pick it up within 30 minutes.')) return;
    setReturning(true);
    try {
      await orderAPI.return(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to request return');
    } finally {
      setReturning(false);
    }
  };

  const [cancellingReturn, setCancellingReturn] = useState(false);
  const handleCancelReturn = async (id) => {
    if (!window.confirm('Are you sure you want to cancel the return request?')) return;
    setCancellingReturn(true);
    try {
      await orderAPI.cancelReturn(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to cancel return');
    } finally {
      setCancellingReturn(false);
    }
  };

  const statusColors = {
    placed: 'var(--info)', confirmed: 'var(--accent)', picking: 'var(--warning)',
    'out-for-delivery': '#f97316', reached: '#8b5cf6', delivered: 'var(--success)',
    'return-requested': '#f97316', returned: 'var(--error)', cancelled: 'var(--error)'
  };

  const statusIcons = {
    placed: <InventoryIcon sx={{ fontSize: '18px' }} />,
    confirmed: <CheckCircleIcon sx={{ fontSize: '18px' }} />,
    delivered: <CheckCircleIcon sx={{ fontSize: '18px' }} />,
    reached: <LockIcon sx={{ fontSize: '18px' }} />,
    'out-for-delivery': <LocalShippingOutlinedIcon sx={{ fontSize: '18px' }} />,
    'return-requested': <AssignmentReturnIcon sx={{ fontSize: '18px' }} />,
    returned: <AssignmentReturnIcon sx={{ fontSize: '18px' }} />,
    cancelled: <CheckCircleIcon sx={{ fontSize: '18px', opacity: 0.5 }} />
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const cancellationReasons = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Order placed by mistake',
    'Delivery time is too long',
    'Want to change payment method',
    'Other'
  ];

  const handleCancelClick = (id) => {
    setCancelOrderId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason) return alert('Please select a reason');
    setCancelling(true);
    try {
      await orderAPI.cancel(cancelOrderId, cancelReason);
      await load();
      setShowCancelModal(false);
      setCancelOrderId(null);
      setCancelReason('');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', marginTop: '80px' }}>
        <h2 style={{ marginBottom: '16px' }}>Please sign in to view orders</h2>
        <Link to="/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '10px 24px 60px', maxWidth: '800px', marginTop: '10px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '20px' }}>My Orders</h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No orders yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>Start shopping to place your first order!</p>
          <Link to="/products" className="btn btn-primary btn-sm">Browse Products</Link>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Order #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 900 }} className="gradient-text">₹{order.totalAmount.toLocaleString()}</div>
                  {order.deliveryFee > 0 && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>incl. ₹{order.deliveryFee} delivery</div>}
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 10px', borderRadius: 'var(--radius-full)',
                  background: `${statusColors[order.status]}12`, color: statusColors[order.status],
                  fontSize: '12px', fontWeight: 800, textTransform: 'capitalize'
                }}>
                  {statusIcons[order.status]} {order.status.replace('-', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items?.map((item, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {item.image && <img src={item.image} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Size: {item.size} · Qty: {item.quantity}</div>
                      </div>
                    </div>
                    
                    {/* Rating UI */}
                    {order.status === 'delivered' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.isRated ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--accent-bg)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-light)' }}>
                            <StarIcon sx={{ fontSize: '14px' }} />
                            <span style={{ fontSize: '12px', fontWeight: 800 }}>{item.userRating}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <button key={star} onClick={() => handleRate(order._id, item.productId, star)} disabled={ratingSubmitting}
                                style={{ cursor: ratingSubmitting ? 'not-allowed' : 'pointer', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, opacity: ratingSubmitting ? 0.5 : 1 }}>
                                <StarBorderIcon sx={{ fontSize: '18px' }} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ===== OTP Display when delivery partner has reached ===== */}
              {order.status === 'reached' && order.deliveryOTP && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(168,85,247,0.04) 100%)', border: '1px solid rgba(139,92,246,0.2)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <LockIcon sx={{ color: '#8b5cf6', fontSize: '16px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verification Code</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Share with delivery partner</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {order.deliveryOTP.split('').map((d, idx) => (
                      <div key={idx} style={{ width: '36px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#8b5cf6', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 2px 8px rgba(139,92,246,0.1)' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#f97316', animation: 'pulse 1.5s infinite' }}></span>
                    <span style={{ fontSize: '11px', color: '#f97316', fontWeight: 700 }}>Partner is at your location</span>
                  </div>
                </motion.div>
              )}

              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: order.status === 'cancelled' ? 'var(--text-muted)' : 'var(--success)' }}>
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <><LocalShippingOutlinedIcon sx={{ fontSize: '20px' }} /> Est. delivery: {order.estimatedDeliveryMinutes} min</>
                  )}
                  {order.status === 'delivered' && <span>Delivered on {new Date(order.updatedAt).toLocaleDateString()}</span>}
                  {order.status === 'cancelled' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 700 }}>Order Cancelled {order.cancelledBy === 'seller' ? 'by Seller' : ''}</span>
                      {order.cancelReason && <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Reason: {order.cancelReason}</span>}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Cancellation */}
                  {['placed', 'confirmed'].includes(order.status) && (
                    <button onClick={() => handleCancelClick(order._id)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>Cancel</button>
                  )}

                  {/* Return Logic: Within 30 mins of delivery */}
                  {order.status === 'delivered' && (
                    (() => {
                      const deliveredAt = new Date(order.deliveredAt || order.updatedAt);
                      const diffMinutes = (new Date() - deliveredAt) / (1000 * 60);
                      const isEligible = diffMinutes <= 30;
                      
                      if (isEligible) {
                        return (
                          <button 
                            onClick={() => navigate(`/orders/${order._id}/return`)} 
                            style={{ 
                              padding: '6px 14px', borderRadius: 'var(--radius-full)', 
                              background: 'rgba(249,115,22,0.1)', color: '#f97316', 
                              fontSize: '13px', fontWeight: 700, border: '1px solid rgba(249,115,22,0.2)', 
                              cursor: 'pointer'
                            }}
                          >
                            Return
                          </button>
                        );
                      }
                      return null;
                    })()
                  )}

                  {/* Cancel Return Logic */}
                  {order.status === 'return-requested' && (
                    <button 
                      onClick={() => handleCancelReturn(order._id)} 
                      disabled={cancellingReturn}
                      style={{ 
                        padding: '6px 14px', borderRadius: 'var(--radius-full)', 
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444', 
                        fontSize: '13px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.2)', 
                        cursor: cancellingReturn ? 'not-allowed' : 'pointer',
                        opacity: cancellingReturn ? 0.6 : 1
                      }}
                    >
                      {cancellingReturn ? '...' : 'Cancel Return'}
                    </button>
                  )}

                  <Link to={`/orders/${order._id}/track`} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--accent-bg)', color: 'var(--accent-light)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(168,85,247,0.2)' }}>
                    {order.status === 'delivered' ? 'View Details' : 'Track Order'} →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Cancel Order</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Please tell us why you're cancelling this order.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {cancellationReasons.map(reason => (
                <button key={reason} onClick={() => setCancelReason(reason)} style={{ padding: '12px 16px', borderRadius: '12px', textAlign: 'left', background: cancelReason === reason ? 'rgba(168,85,247,0.1)' : 'var(--bg-elevated)', border: cancelReason === reason ? '1px solid var(--accent)' : '1px solid var(--border)', color: cancelReason === reason ? 'var(--accent)' : 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{reason}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); }} className="btn" style={{ flex: 1, background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>Close</button>
              <button onClick={confirmCancel} disabled={cancelling || !cancelReason} className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }}>{cancelling ? 'Processing...' : 'Confirm Cancel'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
