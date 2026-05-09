import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import StorefrontIcon from '@mui/icons-material/StorefrontRounded';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import LocalShippingIcon from '@mui/icons-material/LocalShippingRounded';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyRounded';

const stats = [
  { label: 'Total Users', value: '2,847', change: '+12%', icon: <PeopleIcon />, color: '#a855f7' },
  { label: 'Active Sellers', value: '134', change: '+8%', icon: <StorefrontIcon />, color: '#FF6B6B' },
  { label: 'Total Orders', value: '5,291', change: '+23%', icon: <ShoppingCartIcon />, color: '#3b82f6' },
  { label: 'Revenue', value: '₹12.4L', change: '+18%', icon: <AttachMoneyIcon />, color: '#10b981' },
  { label: 'Deliveries', value: '4,102', change: '+15%', icon: <LocalShippingIcon />, color: '#f59e0b' },
  { label: 'Growth', value: '34%', change: '+5%', icon: <TrendingUpIcon />, color: '#ec4899' },
];

export default function AdminOverview() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Welcome back, Admin
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px' }}>
          Here's what's happening across your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px'
      }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute', top: '-10px', right: '-10px',
              width: '60px', height: '60px', borderRadius: '50%',
              background: stat.color, opacity: 0.08
            }} />
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${stat.color}20`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px'
            }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Recent Activity
        </h2>
        {[
          { text: 'New seller application from "Urban Threads"', time: '2 min ago', type: 'seller' },
          { text: 'Order #5291 delivered successfully', time: '15 min ago', type: 'order' },
          { text: 'New user registration spike detected', time: '1 hr ago', type: 'user' },
          { text: 'Product "Classic Denim Jacket" flagged for review', time: '3 hr ago', type: 'product' },
          { text: 'Monthly revenue target achieved', time: '5 hr ago', type: 'revenue' },
        ].map((activity, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0',
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{activity.text}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '16px' }}>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
