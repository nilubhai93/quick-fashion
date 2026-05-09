import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (name, email, password, role, extraData = {}) => api.post('/auth/register', { name, email, password, role, ...extraData }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updateSizeProfile: (data) => api.put('/auth/profile/size', data),
  sendOtp: (email) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getBankDetails: () => api.get('/auth/profile/bank'),
  updateBankDetails: (data) => api.put('/auth/profile/bank', data),
};

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getFeatured: () => api.get('/products/featured'),
  getDeals: () => api.get('/products/deals'),
  getQuickDelivery: (zip) => api.get('/products/quick-delivery', { params: { zip } }),
};

// AI
export const aiAPI = {
  recommend: (data) => api.post('/ai/recommend', data),
  occasionSearch: (data) => api.post('/ai/occasion-search', data),
  smartFit: (data) => api.post('/ai/smart-fit', data),
  getChatHistory: () => api.get('/ai/chat/history'),
  clearChatHistory: () => api.delete('/ai/chat/history'),
};

// Cart
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  acceptBundle: () => api.post('/cart/accept-bundle'),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  saveAddress: (data) => api.post('/orders/address', data),
  getAddresses: () => api.get('/orders/addresses'),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  track: (id) => api.get(`/orders/${id}/track`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  rateItem: (id, productId, rating) => api.post(`/orders/${id}/rate`, { orderId: id, productId, rating }),
  return: (id, data) => api.post(`/orders/${id}/return`, data),
  cancelReturn: (id) => api.post(`/orders/${id}/cancel-return`),
};

// Seller Orders
export const sellerOrderAPI = {
  getAll: () => api.get('/seller/orders'),
  updateStatus: (id, status, reason) => api.put(`/seller/orders/${id}/status`, { status, reason }),
};

// Seller Settings
export const sellerSettingsAPI = {
  get: () => api.get('/seller/dashboard/settings'),
  update: (data) => api.put('/seller/dashboard/settings', data),
};

// Delivery
export const deliveryAPI = {
  getProfile: () => api.get('/delivery/profile'),
  updateStatus: (isOnline) => api.put('/delivery/status', { isOnline }),
  getCurrentOrders: () => api.get('/delivery/orders/current'),
  acceptOrder: (id) => api.put(`/delivery/orders/${id}/accept`),
  rejectOrder: (id) => api.put(`/delivery/orders/${id}/reject`),
  updateOrderStatus: (id, status) => api.put(`/delivery/orders/${id}/status`, { status }),
  markReached: (id) => api.put(`/delivery/orders/${id}/reached`),
  verifyOTP: (id, otp) => api.put(`/delivery/orders/${id}/verify-otp`, { otp }),
  getEarnings: () => api.get('/delivery/earnings'),
  payCompany: (amount) => api.post('/delivery/pay-company', { amount }),
  getHistory: (params) => api.get('/delivery/history', { params }),
};

export default api;
