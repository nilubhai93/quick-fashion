import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@flashfit.app';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  User already exists. Promoting to admin...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✅ User updated to admin.');
    } else {
      console.log('➕ Creating new admin user...');
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('✅ Admin user created.');
    }

    console.log(`\n🔑 Login Credentials:`);
    console.log(`Email: \${adminEmail}`);
    console.log(`Password: adminpassword123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();
