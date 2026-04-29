require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@taxflowpro.com';
const ADMIN_PASSWORD = 'lasser23';
const ADMIN_FIRST_NAME = 'TaxFlow';
const ADMIN_LAST_NAME = 'Admin';
const ADMIN_PHONE = '9999999999';

const createAdminUser = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`Admin user already exists: ${existingAdmin.email}`);
      process.exit(0);
    }

    const admin = new User({
      firstName: ADMIN_FIRST_NAME,
      lastName: ADMIN_LAST_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log(`Admin account created successfully: ${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin account:', error.message || error);
    process.exit(1);
  }
};

createAdminUser();
