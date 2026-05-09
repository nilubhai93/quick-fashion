import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import DeliveryDetail from './src/models/DeliveryDetail.js';
import DeliveryOrderHistory from './src/models/DeliveryOrderHistory.js';

async function initCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    console.log('Connected to DB');

    // Create collections manually just to make them appear
    await DeliveryDetail.createCollection();
    await DeliveryOrderHistory.createCollection();
    console.log('Collections physically created in MongoDB');

    // Attempt to seed data for existing delivery drivers
    const drivers = await User.find({ role: 'delivery' });
    
    for (let driver of drivers) {
      // Upsert detail
      await DeliveryDetail.findOneAndUpdate(
        { deliveryBoyId: driver._id },
        { 
          deliveryBoyId: driver._id,
          name: driver.name || 'Unknown',
          email: driver.email,
          phone: driver.phone || 'N/A'
        },
        { upsert: true }
      );

      // Upsert history
      await DeliveryOrderHistory.findOneAndUpdate(
        { deliveryBoyId: driver._id },
        {
          deliveryBoyId: driver._id,
          totalOrdersDelivered: 0,
          todayOrders: 0,
          totalEarnings: 0,
          todayEarnings: 0
        },
        { upsert: true }
      );
    }

    console.log(`Seeded initialization records for ${drivers.length} delivery drivers!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initCollections();
