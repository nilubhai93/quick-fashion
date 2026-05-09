import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/PersonRounded';
import BlockIcon from '@mui/icons-material/BlockRounded';
import VerifiedIcon from '@mui/icons-material/VerifiedRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import api from '../../api/index';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: 'rgba(255,107,107,0.15)', text: '#FF6B6B' },
      seller: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
      delivery: { bg: 'rgba(41,255,198,0.15)', text: '#29ffc6' },
      user: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    };
    const c = colors[role] || colors.user;
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
        background: c.bg, color: c.text, textTransform: 'uppercase'
      }}>
        {role}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#FF6B6B' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: 'var(--text-primary)' }}>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage all registered users</p>
        </div>
        <div style={{ position: 'relative' }}>
          <SearchIcon sx={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', color: 'var(--text-muted)' }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            style={{
              padding: '10px 16px 10px 40px', borderRadius: '10px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '240px'
            }}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
          padding: '14px 24px', background: 'var(--bg-elevated)',
          fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
        </div>

        {/* Rows */}
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No users found.
          </div>
        ) : (
          filteredUsers.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr',
                padding: '14px 24px', borderTop: '1px solid var(--border)',
                alignItems: 'center', fontSize: '14px'
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{u.email}</span>
              {getRoleBadge(u.role)}
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
