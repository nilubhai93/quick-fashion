import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import BankDetail from '../models/BankDetail.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, vehicleType, vehicleNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const validRole = ['user', 'seller', 'delivery', 'admin'].includes(role) ? role : 'user';

    const userData = { name, email, password, phone, role: validRole };
    if (validRole === 'delivery' && vehicleType) {
      userData.deliveryProfile = {
        isOnline: false,
        vehicleType: vehicleType,
        vehicleNumber: vehicleNumber || ''
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please sign up.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`[OTP DEBUG] OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired OTP.' });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      message: 'OTP verified successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -chatHistory');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, addresses, sizeProfile, stylePreferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (addresses) updates.addresses = addresses;
    if (sizeProfile) updates.sizeProfile = sizeProfile;
    if (stylePreferences) updates.stylePreferences = stylePreferences;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export const updateSizeProfile = async (req, res) => {
  try {
    const { topSize, bottomSize, shoeSize, preferredBrands } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { sizeProfile: { topSize, bottomSize, shoeSize, preferredBrands } },
      { new: true }
    ).select('-password');
    res.json({ message: 'Size profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update size profile.' });
  }
};

export const getBankDetails = async (req, res) => {
  try {
    const details = await BankDetail.findOne({ userId: req.user._id });
    res.json({ details });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ error: 'Failed to fetch bank details.' });
  }
};

export const updateBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, bankName, ifscCode, branchName } = req.body;
    
    let details = await BankDetail.findOne({ userId: req.user._id });
    if (details) {
      details.accountHolderName = accountHolderName;
      details.accountNumber = accountNumber;
      details.bankName = bankName;
      details.ifscCode = ifscCode;
      details.branchName = branchName;
      await details.save();
    } else {
      details = await BankDetail.create({
        userId: req.user._id,
        accountHolderName,
        accountNumber,
        bankName,
        ifscCode,
        branchName
      });
    }
    
    res.json({ message: 'Bank details updated successfully', details });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({ error: 'Failed to update bank details.' });
  }
};
