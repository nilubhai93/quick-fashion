import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/user/Home';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import CartPage from './pages/user/CartPage';
import Checkout from './pages/user/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/user/Orders';
import OrderTracking from './pages/user/OrderTracking';
import Profile from './pages/user/Profile';
import Addresses from './pages/user/Addresses';
import Rent from './pages/user/Rent';
import Sell from './pages/user/Sell';
import GiftCards from './pages/user/GiftCards';
import BrowsingHistory from './pages/user/BrowsingHistory';
import BecomeSeller from './pages/user/BecomeSeller';
import ReturnPage from './pages/user/ReturnPage';
import SellerLayout from './components/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import ManageProducts from './pages/seller/ManageProducts';
import AddProduct from './pages/seller/AddProduct';
import SellerOrders from './pages/seller/SellerOrders';
import SellerSettings from './pages/seller/SellerSettings';
import SellerProfile from './pages/seller/SellerProfile';
import SellerWallet from './pages/seller/SellerWallet';

// Delivery
import DeliveryLayout from './components/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import DeliveryHistory from './pages/delivery/DeliveryHistory';
import DeliveryEarnings from './pages/delivery/DeliveryEarnings';
import DeliveryProfile from './pages/delivery/DeliveryProfile';
import DeliverySettings from './pages/delivery/DeliverySettings';
import DeliveryNotifications from './pages/delivery/DeliveryNotifications';
import DeliveryOffers from './pages/delivery/DeliveryOffers';
import DeliveryMarket from './pages/delivery/DeliveryMarket';
import DeliverySupport from './pages/delivery/DeliverySupport';

// Admin
import AdminLayout from './components/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminProfile from './pages/admin/AdminProfile';

import AIStylist from './components/AIStylist';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/delivery');

  return (
    <>
      {!isDashboard && <Navbar />}
      <main className="app-main" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id/track" element={<OrderTracking />} />
          <Route path="/orders/:id/return" element={<ReturnPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/browsing-history" element={<BrowsingHistory />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/ai-stylist" element={<Home />} />

          {/* Seller Dashboard Routes */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="edit-product/:id" element={<AddProduct />} />
            <Route path="settings" element={<SellerSettings />} />
            <Route path="profile" element={<SellerProfile />} />
            <Route path="wallet" element={<SellerWallet />} />
          </Route>

          {/* Delivery Routes */}
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryDashboard />} />
            <Route path="orders" element={<DeliveryOrders />} />
            <Route path="history" element={<DeliveryHistory />} />
            <Route path="earnings" element={<DeliveryEarnings />} />
            <Route path="profile" element={<DeliveryProfile />} />
            <Route path="settings" element={<DeliverySettings />} />
            <Route path="notifications" element={<DeliveryNotifications />} />
            <Route path="offers" element={<DeliveryOffers />} />
            <Route path="market" element={<DeliveryMarket />} />
            <Route path="support" element={<DeliverySupport />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="sellers" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <AIStylist />}
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }
      }} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
