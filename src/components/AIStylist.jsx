import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import SendIcon from '@mui/icons-material/SendRounded';
import ImageIcon from '@mui/icons-material/ImageRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';

export default function AIStylist() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Stylist ✨ Tell me about your occasion, mood, or upload a photo of something you own — I'll find the perfect match!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('ai') === 'true') {
      setOpen(true);
    }
  }, [location.search]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await aiAPI.recommend({ message: userMsg });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.message || "Here are some suggestions for you!",
        products: res.data.products,
        sizeMapping: res.data.sizeMapping,
        bundle: res.data.bundle
      }]);
      if (res.data.products?.length) setProducts(res.data.products);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Try one of these quick queries: 'party outfit', 'office wear', or 'casual weekend look'!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      setMessages(prev => [...prev, {
        role: 'user',
        content: '📸 Uploaded an image for style matching',
        isImage: true
      }]);
      setLoading(true);

      try {
        const res = await aiAPI.recommend({
          message: 'What matches this outfit piece?',
          imageBase64: base64
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.message || "Here's what I found to match your item!",
          products: res.data.products,
          imageAnalysis: res.data.imageAnalysis
        }]);
      } catch {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I couldn't analyze that image right now. Try describing the item instead!"
        }]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const quickPrompts = [
    "🎉 Party outfit for tonight",
    "💼 Office wear under ₹3000",
    "🌧️ Rainy day outfit",
    "💍 Wedding guest look",
    "👟 Casual weekend",
    "I wear Levi's 32 jeans"
  ];

  if (location.pathname === '/') return null;

  return (
    <>
      {/* FAB Button */}
      <motion.button
        id="ai-stylist-fab"
        onClick={() => setOpen(!open)}
        animate={{ boxShadow: open ? 'none' : '0 0 30px rgba(168, 85, 247, 0.4)' }}
        style={{
          position: 'fixed',
          bottom: '90px', right: '24px',
          width: '60px', height: '60px',
          borderRadius: '50%',
          background: 'var(--gradient-primary)',
          color: 'white',
          display: open ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 1001,
          cursor: 'pointer',
          border: 'none'
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
      </motion.button>

      {/* Chat Panel and Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Click-away Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                // Transparent so users don't see a darkened screen, but blocks clicks
                background: 'transparent'
              }}
            />
            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                position: 'fixed',
                bottom: '90px', right: '24px',
                width: '400px', maxWidth: 'calc(100vw - 48px)',
                height: '600px', maxHeight: 'calc(100vh - 100px)',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 1001,
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <AutoAwesomeIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)', color: 'white' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      AI Stylist
                    </div>
                    <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                      Always online
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => { setMessages([messages[0]]); setProducts([]); }}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)', background: 'var(--bg-glass)'
                    }}>
                    <DeleteOutlineIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
                  </button>
                  <button onClick={() => setOpen(false)} style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)', background: 'var(--bg-glass)'
                  }}>
                    <CloseIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: '4px'
                    }}>
                      {msg.role === 'assistant' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', marginLeft: '4px', marginBottom: '2px' }}>
                          <AutoAwesomeIcon sx={{ fontSize: 12 }} /> AI STYLIST
                        </div>
                      )}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: msg.role === 'user'
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        background: msg.role === 'user'
                          ? 'var(--gradient-primary)'
                          : 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: msg.role === 'user' ? 'none' : 'blur(10px)',
                        border: msg.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                        fontSize: 'clamp(13px, 2.5vw, 16px)', lineHeight: 1.6,
                        boxShadow: msg.role === 'user' ? '0 4px 15px rgba(168, 85, 247, 0.3)' : 'none'
                      }}>
                        {msg.content}
                      </div>
                    </div>

                    {/* Inline Product Cards */}
                    {msg.products?.length > 0 && (
                      <div style={{
                        marginTop: '8px',
                        display: 'flex', gap: '8px',
                        overflowX: 'auto', paddingBottom: '4px'
                      }}>
                        {msg.products.slice(0, 4).map(p => (
                          <a
                            key={p._id}
                            href={`/products/${p._id}`}
                            style={{
                              minWidth: '120px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              overflow: 'hidden', textDecoration: 'none',
                              flexShrink: 0
                            }}
                          >
                            <img
                              src={p.images?.[0] || 'https://placehold.co/120x120/1a1a25/9a9ab0?text=No+Image'}
                              alt={p.name}
                              style={{ width: '120px', height: '100px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: p.matchScore === 100 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                  color: p.matchScore === 100 ? '#22c55e' : '#eab308'
                                }}>
                                  {p.matchScore}% {p.matchScore === 100 ? 'Match' : 'Similar'}
                                </div>
                              </div>
                              <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', fontWeight: 700, color: 'var(--accent-light)', marginTop: '2px' }}>
                                ₹{p.discountPrice || p.price}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Size Mapping Result */}
                    {msg.sizeMapping?.found && (
                      <div style={{
                        marginTop: '8px', padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        fontSize: 'clamp(13px, 2.5vw, 16px)', color: 'var(--success)'
                      }}>
                        <strong>Smart Fit Result:</strong><br />
                        {msg.sizeMapping.referenceBrand} {msg.sizeMapping.referenceSize} → Our size: <strong>{msg.sizeMapping.ourSize}</strong><br />
                        <span style={{ color: 'var(--text-muted)' }}>{msg.sizeMapping.fitNotes}</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {loading && (
                  <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '6px', padding: '16px' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                        style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: 'var(--accent)'
                        }}
                      />
                    ))}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length <= 2 && (
                <div style={{
                  padding: '0 16px 8px',
                  display: 'flex', flexWrap: 'wrap', gap: '6px'
                }}>
                  {quickPrompts.map(prompt => (
                    <button key={prompt} onClick={() => {
                      setInput(prompt);
                      // Auto-send isn't possible directly withsendMessage() immediately since state isn't updated instantly, so we can mock the call or update state
                      setTimeout(() => {
                        const fakeEvent = { preventDefault: () => { } };
                        document.getElementById('ai-send-btn')?.click();
                      }, 50);
                    }}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', fontSize: 'clamp(13px, 2.5vw, 16px)',
                        cursor: 'pointer', transition: 'all var(--transition-fast)',
                        whiteSpace: 'nowrap'
                      }}
                    >{prompt}</button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex', gap: '8px', alignItems: 'center'
              }}>
                <input ref={fileInputRef} type="file" accept="image/*" hidden
                  onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', background: 'var(--bg-card)',
                  flexShrink: 0
                }}>
                  <ImageIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
                </button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything about fashion..."
                  style={{
                    flex: 1, padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 'clamp(13px, 2.5vw, 16px)', outline: 'none'
                  }}
                />
                <motion.button
                  id="ai-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: input.trim() ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', flexShrink: 0,
                    opacity: input.trim() ? 1 : 0.5
                  }}
                >
                  <SendIcon sx={{ fontSize: 'clamp(20px, 4vw, 28px)' }} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) {
          #ai-stylist-fab {
            bottom: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
