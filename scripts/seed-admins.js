const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Helper to load env vars from .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local file not found at', envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        // Remove quotes if any
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  });
  return env;
}

async function seed() {
  const env = loadEnv();
  const uri = env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(uri, { bufferCommands: false });
  console.log('Connected to MongoDB.');

  // Define User schema directly here to avoid typescript/alias issues
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: false }
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const adminEmail = env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = env.DEFAULT_ADMIN_PASSWORD;
  const adminName = env.DEFAULT_ADMIN_NAME || 'Castle of Princes Admin';

  if (!adminEmail || !adminPassword) {
    console.error('DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not set in env file.');
    process.exit(1);
  }

  const adminsToSeed = [
    {
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'admin',
      isVerified: true
    }
  ];

  for (const admin of adminsToSeed) {
    const existingUser = await User.findOne({ email: admin.email.toLowerCase() });
    
    // Hash password once — use updateOne/insertOne (NOT .save() / .create()) to bypass
    // the Mongoose pre('save') hook which would hash the password a SECOND time.
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(admin.password, salt);

    if (existingUser) {
      console.log(`Updating existing user: ${admin.email}`);
      // Use updateOne with $set to skip the pre-save hook (avoids double-hashing)
      await User.updateOne(
        { email: admin.email.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            role: 'admin',
            isVerified: true,
            ...(existingUser.name ? {} : { name: admin.name }),
          }
        }
      );
      console.log(`Updated admin ${admin.email} successfully.`);
    } else {
      console.log(`Creating new admin: ${admin.email}`);
      // Use insertMany/collection.insertOne to skip the pre-save hook (avoids double-hashing)
      await User.collection.insertOne({
        email: admin.email.toLowerCase(),
        password: hashedPassword,
        name: admin.name,
        role: 'admin',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created admin ${admin.email} successfully.`);
    }
  }

  await mongoose.disconnect();
  console.log('Database seeding finished successfully!');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
