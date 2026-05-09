import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sellerOrderAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import CancelIcon from '@mui/icons-material/CancelRounded';
import HistoryIcon from '@mui/icons-material/HistoryRounded';
import InventoryIcon from '@mui/icons-material/InventoryRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import PrintIcon from '@mui/icons-material/PrintRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';

const CURRENT_STATUSES = ['placed', 'confirmed', 'picking', 'out-for-delivery', 'reached'];
const RETURN_STATUSES = ['return-requested', 'returning'];
const HISTORY_STATUSES = ['delivered', 'returned', 'cancelled'];

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [sellerProductIds, setSellerProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [slipOrder, setSlipOrder] = useState(null);
  const slipRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    loadOrders();
    window.scrollTo(0, 0);

    // Poll every 10s to catch delivery partner assignments
    const interval = setInterval(() => {
      loadOrders(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await sellerOrderAPI.getAll();
      setOrders(res.data.orders || []);
      setSellerProductIds(res.data.sellerProductIds || []);
    } catch (error) {
      console.error('Failed to load seller orders', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await sellerOrderAPI.updateStatus(orderId, newStatus);
      setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update order status');
    }
  };

  const currentOrders = orders.filter(o => CURRENT_STATUSES.includes(o.status));
  const returnOrders = orders.filter(o => RETURN_STATUSES.includes(o.status));
  const historyOrders = orders.filter(o => HISTORY_STATUSES.includes(o.status));
  
  const displayOrders = 
    activeTab === 'current' ? currentOrders : 
    activeTab === 'returns' ? returnOrders : 
    historyOrders;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const sellerCancelReasons = [
    'Product out of stock',
    'Pricing error',
    'Shipping service unavailable',
    'Product damaged',
    'Incorrect product listed',
    'Other'
  ];

  const handleCancelClick = (id) => {
    setCancelOrderId(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
    if (!finalReason) return alert('Please provide a reason');
    
    setCancelling(true);
    try {
      await sellerOrderAPI.updateStatus(cancelOrderId, 'cancelled', finalReason);
      loadOrders(true);
      setShowCancelModal(false);
      setCancelOrderId(null);
      setCancelReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Failed to cancel order', error);
      alert('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const statusColors = {
    'placed': '#f59e0b',
    'confirmed': '#3b82f6',
    'picking': '#a855f7',
    'out-for-delivery': '#8b5cf6',
    'reached': '#f97316',
    'delivered': '#10b981',
    'return-requested': '#f43f5e',
    'returning': '#ec4899',
    'returned': '#8b5cf6',
    'cancelled': '#ef4444'
  };

  const paymentMethodLabels = {
    'cod': '💵 Cash on Delivery',
    'upi': '📱 UPI',
    'card': '💳 Card',
    'wallet': '👛 Wallet'
  };

  const handlePrintSlip = () => {
    const printContent = slipRef.current;
    if (!printContent) return;
    const win = window.open('', '', 'width=420,height=600');
    win.document.write(`<html><head><title>Order Invoice</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #111; background: #fff; }
      .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 16px; margin-bottom: 16px; }
      .header h1 { font-size: 22px; font-weight: 800; }
      .header p { font-size: 12px; color: #666; margin-top: 4px; }
      .meta { display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-bottom: 16px; }
      .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 700; margin-bottom: 8px; }
      .customer { font-size: 13px; margin-bottom: 16px; }
      .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      .items-table th { text-align: left; font-size: 11px; text-transform: uppercase; color: #999; border-bottom: 1px solid #ddd; padding: 6px 4px; }
      .items-table td { font-size: 13px; padding: 8px 4px; border-bottom: 1px solid #f0f0f0; }
      .items-table td:last-child, .items-table th:last-child { text-align: right; }
      .totals { border-top: 2px dashed #ccc; padding-top: 12px; }
      .totals .row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
      .totals .row.total { font-size: 16px; font-weight: 800; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 4px; }
      .payment-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; background: #f3f4f6; font-size: 12px; font-weight: 600; margin-top: 8px; }
      .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #999; border-top: 2px dashed #ccc; padding-top: 12px; }
    </style></head><body>`);
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Customer Orders</h2>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '150px', marginBottom: '16px', borderRadius: '12px' }} />)}
      </div>
    );
  }

  return (
    <>
    <div style={{ padding: '0 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '2px' }}>
          Customer Orders
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Manage and confirm orders for your products.</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '16px',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '4px', width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('current')}
          style={{
            padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none',
            background: activeTab === 'current' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'current' ? '#fff' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <InventoryIcon sx={{ fontSize: 18 }} />
          Current Orders
          {currentOrders.length > 0 && (
            <span style={{
              background: activeTab === 'current' ? 'rgba(255,255,255,0.25)' : 'var(--accent)',
              color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700
            }}>
              {currentOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          style={{
            padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none',
            background: activeTab === 'returns' ? '#f43f5e' : 'transparent',
            color: activeTab === 'returns' ? '#fff' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <HistoryIcon sx={{ fontSize: 18, transform: 'rotate(-90deg)' }} />
          Returns
          {returnOrders.length > 0 && (
            <span style={{
              background: activeTab === 'returns' ? 'rgba(255,255,255,0.25)' : '#f43f5e',
              color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700
            }}>
              {returnOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none',
            background: activeTab === 'history' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'history' ? '#fff' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <HistoryIcon sx={{ fontSize: 18 }} />
          Order History
          {historyOrders.length > 0 && (
            <span style={{
              background: activeTab === 'history' ? 'rgba(255,255,255,0.25)' : 'var(--text-muted)',
              color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700
            }}>
              {historyOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Order List */}
      <AnimatePresence mode="wait">
        {displayOrders.length === 0 ? (
          <motion.div
            key={`empty-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border)'
            }}
          >
            {activeTab === 'current' ? (
              <>
                <LocalShippingIcon sx={{ fontSize: 64, color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Active Orders</h3>
                <p style={{ color: 'var(--text-secondary)' }}>When customers place new orders, they will appear here.</p>
              </>
            ) : activeTab === 'returns' ? (
              <>
                <HistoryIcon sx={{ fontSize: 64, color: 'var(--text-muted)', marginBottom: '16px', transform: 'rotate(-90deg)' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Return Requests</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Active product returns will be shown here.</p>
              </>
            ) : (
              <>
                <HistoryIcon sx={{ fontSize: 64, color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>No Order History</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Completed and cancelled orders will appear here.</p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`list-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{ display: 'grid', gap: '20px' }}
          >
            {displayOrders.map((order) => {
              // Filter to only show items that belong to this seller
              const myItems = order.items.filter(item =>
                item.productId && sellerProductIds.includes(item.productId._id)
              );

              if (myItems.length === 0) return null; // Safe fallback

              const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              const myTotal = myItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                    padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {orderDate}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700,
                        background: `color-mix(in srgb, ${statusColors[order.status]} 15%, transparent)`,
                        color: statusColors[order.status], textTransform: 'uppercase'
                      }}>
                        • {order.status.replace('-', ' ')}
                      </div>

                      {/* Revenue badge */}
                      <div style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'
                      }}>
                        ₹{myTotal.toFixed(2)}
                      </div>

                      {/* Action buttons if order is just placed */}
                      {order.status === 'placed' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                            style={{
                              padding: '6px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--success)', color: 'white',
                              fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <CheckCircleIcon sx={{ fontSize: 16 }} /> Confirm
                          </button>
                          <button
                            onClick={() => handleCancelClick(order._id)}
                            style={{
                              padding: '6px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--error)', background: 'transparent', color: 'var(--error)',
                              fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <CancelIcon sx={{ fontSize: 16 }} /> Cancel
                          </button>
                        </div>
                      )}

                      {/* Delivery partner currently controls subsequent statuses (picking, out-for-delivery, delivered) */}

                      {/* Slip / Invoice Button */}
                      <button
                        onClick={() => setSlipOrder(order)}
                        style={{
                          padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                        }}
                      >
                        <ReceiptLongIcon sx={{ fontSize: 16 }} /> Slip
                      </button>
                    </div>
                  </div>

                  {/* Delivery Assignment Status */}
                  {order.status !== 'placed' && order.status !== 'cancelled' && (
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Delivery Partner</div>
                      {(!order.delivery || order.delivery.status === 'unassigned' || order.delivery.status === 'assigned') ? (
                        <div style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid var(--warning)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                          Waiting for delivery partner to accept...
                        </div>
                      ) : (
                        <div>
                          {order.delivery.deliveryBoyId ? (
                            <>
                              <div style={{ fontWeight: 600, color: 'var(--accent-light)', fontSize: '15px' }}>✅ {order.delivery.deliveryBoyId.name} (Accepted)</div>
                              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Phone: {order.delivery.deliveryBoyId.phone || 'N/A'}</div>
                            </>
                          ) : (
                            <div style={{ color: 'var(--info)' }}>Partner assigned, info pending...</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivered badge for history */}
                  {order.status === 'delivered' && (
                    <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />
                        <span style={{ fontWeight: 600, color: '#10b981', fontSize: '14px' }}>Successfully delivered</span>
                      </div>
                      
                      {/* Settlement Timer */}
                      {(() => {
                        const deliveredAt = new Date(order.deliveredAt || order.updatedAt);
                        const settlementTime = new Date(deliveredAt.getTime() + 30 * 60 * 1000);
                        const now = new Date();
                        const diff = settlementTime - now;
                        
                        if (diff > 0) {
                          const mins = Math.floor(diff / 60000);
                          const secs = Math.floor((diff % 60000) / 1000);
                          return (
                            <div style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                              🕒 Wallet Settlement in {mins}m {secs}s
                            </div>
                          );
                        } else {
                          return (
                            <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                              💰 Funds Added to Wallet
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {/* Returned status info */}
                  {order.status === 'returned' && (
                    <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(139, 92, 246, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                        <span style={{ fontWeight: 600, color: '#8b5cf6', fontSize: '14px' }}>Product Returned to Hub</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                        💸 Refunded to Customer
                      </div>
                    </div>
                  )}
                  {order.status === 'cancelled' && (
                    <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CancelIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                        <span style={{ fontWeight: 600, color: '#ef4444', fontSize: '14px' }}>
                          Order Cancelled {order.cancelledBy === 'user' ? 'by Customer' : order.cancelledBy === 'seller' ? 'by You' : ''}
                        </span>
                      </div>
                      {order.cancelReason && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '26px', fontStyle: 'italic' }}>
                          Reason: {order.cancelReason}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Details */}
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>Customer</div>
                    <div style={{ fontSize: '15px' }}>
                      <span style={{ fontWeight: 600 }}>{order.userId?.name || 'Guest User'}</span> &nbsp;
                      <span style={{ color: 'var(--text-secondary)' }}>{order.userId?.email || ''}</span>
                    </div>
                    {order.deliveryAddress && (
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.zip}
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase' }}>Products in this order</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {myItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                            {item.image || item.productId?.images?.[0] ? (
                              <img src={item.image || item.productId?.images?.[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>No Image</div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              Size: <span style={{ color: 'var(--text-primary)' }}>{item.size}</span> |
                              Color: <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{item.color || 'Default'}</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '8px', color: 'var(--accent-light)' }}>
                              {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Cancellation Modal */}
    <AnimatePresence>
      {showCancelModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Cancel Order</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Select a reason for cancelling this order.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {sellerCancelReasons.map(reason => (
                <button key={reason} onClick={() => {
                  setCancelReason(reason);
                  if (reason !== 'Other') setCustomReason('');
                }}
                  style={{
                    padding: '12px 16px', borderRadius: '12px', textAlign: 'left',
                    background: cancelReason === reason ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
                    border: cancelReason === reason ? '1px solid var(--border)' : '1px solid var(--border)',
                    borderColor: cancelReason === reason ? 'var(--accent)' : 'var(--border)',
                    color: cancelReason === reason ? 'var(--accent)' : 'var(--text-primary)',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                  {reason}
                </button>
              ))}
              
              {cancelReason === 'Other' && (
                <motion.input 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  autoFocus
                  type="text"
                  placeholder="Enter custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--accent)', color: 'var(--text-primary)', fontSize: '14px', marginTop: '4px'
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); setCustomReason(''); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button 
                onClick={confirmCancel} 
                disabled={cancelling || !cancelReason || (cancelReason === 'Other' && !customReason)} 
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: (cancelling || !cancelReason || (cancelReason === 'Other' && !customReason)) ? 0.6 : 1 }}
              >
                {cancelling ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ======= Invoice Slip Modal ======= */}
    <AnimatePresence>
      {slipOrder && (() => {
        const slipItems = slipOrder.items.filter(item =>
          item.productId && sellerProductIds.includes(typeof item.productId === 'object' ? item.productId._id : item.productId)
        );
        const slipMyTotal = slipItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const slipDate = new Date(slipOrder.createdAt).toLocaleDateString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        return (
          <motion.div
            key="slip-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSlipOrder(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)', width: '100%', maxWidth: '480px',
                maxHeight: '85vh', overflow: 'auto', position: 'relative'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ReceiptLongIcon sx={{ color: 'var(--accent)' }} /> Order Invoice
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePrintSlip} style={{
                    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: 'var(--gradient-primary)', color: '#fff',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <PrintIcon sx={{ fontSize: 16 }} /> Print
                  </button>
                  <button onClick={() => setSlipOrder(null)} style={{
                    width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </div>

              {/* Printable content */}
              <div ref={slipRef} style={{ padding: '24px' }}>
                <div className="header">
                  <h1>FlashFit Fashion</h1>
                  <p>Order Invoice</p>
                </div>

                <div className="meta" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', marginTop: '16px' }}>
                  <span>Order #{slipOrder._id.slice(-8).toUpperCase()}</span>
                  <span>{slipDate}</span>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>Customer</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{slipOrder.userId?.name || 'Guest User'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{slipOrder.userId?.email || ''}</div>
                  {slipOrder.deliveryAddress && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {slipOrder.deliveryAddress.street}, {slipOrder.deliveryAddress.city}, {slipOrder.deliveryAddress.state} - {slipOrder.deliveryAddress.zip}
                    </div>
                  )}
                  {slipOrder.deliveryLocation?.lat && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📍 Coords: {slipOrder.deliveryLocation.lat.toFixed(5)}, {slipOrder.deliveryLocation.lng.toFixed(5)}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 4px' }}>Item</th>
                      <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 4px' }}>Size</th>
                      <th style={{ textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 4px' }}>Qty</th>
                      <th style={{ textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 4px' }}>Price</th>
                      <th style={{ textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 4px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slipItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 4px', fontSize: '13px' }}>{item.name}</td>
                        <td style={{ padding: '8px 4px', fontSize: '13px' }}>{item.size}</td>
                        <td style={{ padding: '8px 4px', fontSize: '13px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 4px', fontSize: '13px', textAlign: 'right' }}>₹{item.price}</td>
                        <td style={{ padding: '8px 4px', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>₹{item.quantity * item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span>₹{slipMyTotal.toLocaleString()}</span>
                  </div>
                  {slipOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: 'var(--success)' }}>
                      <span>Discount</span>
                      <span>-₹{slipOrder.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Total</span>
                    <span className="gradient-text">₹{Math.round(slipOrder.totalAmount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Payment</span>
                  <span style={{
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    background: slipOrder.paymentStatus === 'paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: slipOrder.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                    fontSize: '12px', fontWeight: 700
                  }}>
                    {paymentMethodLabels[slipOrder.paymentMethod] || slipOrder.paymentMethod} — {slipOrder.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                  </span>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '2px dashed var(--border)', paddingTop: '12px' }}>
                  Thank you for shopping with FlashFit Fashion!
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  </>);
}
