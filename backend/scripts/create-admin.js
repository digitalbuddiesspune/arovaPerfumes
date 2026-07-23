import { configDotenv } from 'dotenv';
import connectDB from '../config/DataBaseConnection.js';
import User from '../models/User.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdmin() {
  try {
    configDotenv();
    await connectDB(process.env.MONGODB_URI || '');

    let admin = await User.findOne({ email: ADMIN_EMAIL });
    const passwordHash = await User.hashPassword(ADMIN_PASSWORD);

    if (admin) {
      admin.passwordHash = passwordHash;
      admin.isAdmin = true;
      admin.provider = 'local';
      admin.name = admin.name || 'Admin User';
      await admin.save();
      console.log('✅ Existing admin updated');
    } else {
      admin = await User.create({
        name: 'Admin User',
        email: ADMIN_EMAIL,
        passwordHash,
        isAdmin: true,
        provider: 'local',
      });
      console.log('✅ Admin user created');
    }

    // Clean up old default admin email
    await User.deleteOne({ email: 'admin@arova.com' });

    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error creating admin:', e?.message || e);
    process.exit(1);
  }
}

createAdmin();
