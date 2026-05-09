import SellerApplication from '../models/SellerApplication.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import SellerDetail from '../models/SellerDetail.js';

export const getSellerApplications = async (req, res) => {
  try {
    const applications = await SellerApplication.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching seller applications:', error);
    res.status(500).json({ error: 'Failed to fetch seller applications' });
  }
};

export const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await SellerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    if (status === 'rejected') {
      application.rejectionReason = rejectionReason || 'Reason not specified';
    } else if (status === 'approved') {
      application.rejectionReason = '';
    }
    
    await application.save();

    // If approved, dynamically update the user's role to 'seller' AND create sellerDetails
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.userId, { role: 'seller' });

      // Store/Update in sellerDetails collection
      await SellerDetail.findOneAndUpdate(
        { userId: application.userId },
        {
          userId: application.userId,
          storeName: application.storeName,
          description: application.description,
          address: application.address,
          categories: application.categories,
          documentType: application.documentType,
          documentPath: application.documentPath,
          businessPhone: application.businessPhone || '', // Ensure we match the schema
          applicationId: application._id,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: `Application ${status} successfully`, application });
  } catch (error) {
    console.error('Error updating seller status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role phone createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

