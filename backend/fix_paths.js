import 'dotenv/config';
import mongoose from 'mongoose';
import SellerApplication from './src/models/SellerApplication.js';

async function fixPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'fashionapp' });
    console.log('✅ Connected to MongoDB');

    const applications = await SellerApplication.find({});
    let count = 0;

    for (const app of applications) {
      if (app.documentPath && (app.documentPath.includes(':\\') || app.documentPath.startsWith('/'))) {
        // If it looks like an absolute path, clean it up
        const parts = app.documentPath.split(/[\\/]/);
        const uploadsIndex = parts.indexOf('uploads');
        
        if (uploadsIndex !== -1) {
          const newPath = parts.slice(uploadsIndex).join('/');
          console.log(`🔧 Fixing path: \${app.documentPath} -> \${newPath}`);
          app.documentPath = newPath;
          await app.save();
          count++;
        }
      }
    }

    console.log(`\n✨ Migration complete! Fixed \${count} records.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixPaths();
