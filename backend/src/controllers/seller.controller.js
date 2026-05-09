import SellerApplication from '../models/SellerApplication.js';
import User from '../models/User.js';

export const applySeller = async (req, res) => {
  try {
    const { storeName, description, address, categories, documentType, businessPhone } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!storeName || !description || !address || !categories || !documentType || !businessPhone) {
      return res.status(400).json({ error: 'All fields including business phone are required.' });
    }

    // Checking if file was uploaded properly
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an ID proof or business document.' });
    }

    // Check if the user already has a pending or approved application
    const existingApp = await SellerApplication.findOne({ userId, status: { $in: ['pending', 'approved'] } });
    if (existingApp) {
      return res.status(400).json({ error: 'You already have an active or pending seller application.' });
    }

    const application = new SellerApplication({
      userId,
      storeName,
      description,
      address,
      categories,
      businessPhone,
      documentType,
      status: 'pending', // Set to pending, requires admin approval
      documentPath: req.file.path // Path where multer saved the file
    });

    await application.save();

    res.status(201).json({
      message: 'Seller application submitted successfully. Please wait for admin approval.',
      application
    });
  } catch (error) {
    console.error('Error applying for seller:', error);
    res.status(500).json({ error: 'An error occurred while submitting your application.' });
  }
};

export const getSellerStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find the latest application for this user
    const application = await SellerApplication.findOne({ userId }).sort({ createdAt: -1 });

    if (!application) {
      return res.status(200).json({ application: null });
    }

    res.status(200).json({ application });
  } catch (error) {
    console.error('Error fetching seller status:', error);
    res.status(500).json({ error: 'An error occurred while fetching your application status.' });
  }
};
