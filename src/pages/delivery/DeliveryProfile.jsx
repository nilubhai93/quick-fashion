import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import EventAvailableIcon from '@mui/icons-material/EventAvailableRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';

export default function DeliveryProfile() {
  const { user } = useAuth();
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '60px', maxWidth: '600px' }}>
       {/* Profile Header */}
       <div style={{ 
         background: 'linear-gradient(145deg, var(--bg-card) 0%, rgba(18,18,28,0) 100%)',
         border: '1px solid var(--border)', borderRadius: '20px', padding: '20px 16px', 
         textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '16px'
       }}>
         {/* Decorative BG */}
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(135deg, rgba(41,255,198,0.2) 0%, rgba(12,235,235,0.1) 100%)' }} />
         
         <div style={{ 
           width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-elevated)', margin: '0 auto 12px', position: 'relative', zIndex: 1,
           border: '3px solid var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, color: '#000',
           backgroundImage: 'linear-gradient(135deg, #0cebeb 0%, #29ffc6 100%)'
         }}>
           {user?.name?.[0]?.toUpperCase() || 'R'}
         </div>
         
         <h2 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', position: 'relative', zIndex: 1 }}>
           {user?.name || 'Rider Profile'}
         </h2>
         <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px', position: 'relative', zIndex: 1 }}>{user?.email}</p>
       </div>

       {/* Quick Stats Grid */}
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
         {/* Earnings Summary */}
         <motion.div whileTap={{ scale: 0.98 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
           <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(41,255,198,0.1)', color: '#29ffc6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <AccountBalanceWalletIcon sx={{ fontSize: '18px' }} />
           </div>
           <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Weekly Earnings</div>
           <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>₹450.00</div>
         </motion.div>

         {/* Current Slot */}
         <motion.div whileTap={{ scale: 0.98 }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
           <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <EventAvailableIcon sx={{ fontSize: '18px' }} />
           </div>
           <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Slot</div>
           <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>12:00 PM - 4:00 PM</div>
           <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Zone A</div>
         </motion.div>
       </div>
    </motion.div>
  );
}
