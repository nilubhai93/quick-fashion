import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'fashionapp',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
      connectTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Create vector search index if not exists
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: 'products' }).toArray();
      if (collections.length > 0) {
        const indexes = await db.collection('products').listSearchIndexes().toArray();
        const hasVectorIndex = indexes.some(i => i.name === 'style_vector_index');
        if (!hasVectorIndex) {
          console.log('📌 Vector search index not found. Create it in MongoDB Atlas for full AI features.');
        }
      }
    } catch (e) {
      // Vector search index check is optional — works only on Atlas
    }

    return conn;
  } catch (error) {
    isConnected = false;
    console.warn('⚠️  MongoDB connection failed:', error.message);
    console.warn('⚠️  Server will continue with fallback static data. Products will still be served.');
    console.warn('⚠️  To use MongoDB, make sure it is running on:', process.env.MONGODB_URI);
    // Don't exit — let the server run with fallback data
    return null;
  }
};

export const getIsConnected = () => isConnected;
