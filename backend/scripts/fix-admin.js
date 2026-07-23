import { configDotenv } from 'dotenv';
import connectDB from '../config/DataBaseConnection.js';
import User from '../models/User.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function upsertAdmin() {
  try {
    configDotenv();
    await connectDB(process.env.MONGODB_URI || '');

    // Remove old admin emails if present
    await User.deleteMany({ email: { $in: ['admin@arova.com', ADMIN_EMAIL] } });

    const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
    const admin = await User.create({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      passwordHash,
      isAdmin: true,
      provider: 'local',
    });

    const isValid = await admin.comparePassword(ADMIN_PASSWORD);

    console.log('✅ Admin ready');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log('🔐 Password test:', isValid ? 'PASS' : 'FAIL');

    process.exit(isValid ? 0 : 1);
  } catch (e) {
    console.error('❌ Error:', e?.message || e);
    process.exit(1);
  }
}

upsertAdmin();
