const { sequelize, User } = require('../modes/portfolio/models');

/**
 * Production-Safe Admin Seeder
 * 
 * This creates ONLY an admin account - NO sample data.
 * Use environment variables for credentials or the interactive create-admin.js script.
 */

async function seedAdmin() {
  try {
    console.log('🔐 Admin Account Creator');
    console.log('========================\n');
    console.log('⚠️  This creates ONLY an admin account.');
    console.log('📝 No sample data will be created.\n');

    console.log('Connecting to database...');
    await sequelize.sync({ force: false });
    console.log('✅ Database connected.\n');

    // Get credentials from environment or use defaults (CHANGE IN PRODUCTION!)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.ADMIN_NAME || 'Portfolio Admin';

    // Warn about default credentials
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.log('⚠️  WARNING: Using default credentials!');
      console.log('⚠️  SET THESE ENVIRONMENT VARIABLES FOR PRODUCTION:');
      console.log('   - ADMIN_EMAIL');
      console.log('   - ADMIN_PASSWORD');
      console.log('   - ADMIN_NAME (optional)\n');
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const [user, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: adminName,
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
      },
    });

    if (!created) {
      user.password_hash = passwordHash;
      await user.save();
    }

    console.log('===========================================');
    if (created) {
      console.log('✅ Admin account created successfully!');
    } else {
      console.log('ℹ️  Admin account exists - password updated.');
    }
    console.log('===========================================');
    console.log(`\n👤 Name:     ${user.name}`);
    console.log(`📧 Email:    ${adminEmail}`);

    if (!process.env.ADMIN_PASSWORD) {
      console.log(`🔒 Password: ${adminPassword}`);
      console.log('\n⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!');
    } else {
      console.log(`🔒 Password: (set from environment variable)`);
    }

    console.log(`\n🔑 Role:     ${user.role}`);
    console.log(`🆔 ID:       ${user.id}\n`);

    console.log('🚀 Next steps:');
    console.log('   1. Login at /admin with these credentials');
    console.log('   2. Change password immediately if using defaults');
    console.log('   3. Start creating your content!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    console.error('\n🔍 Check:');
    console.error('   - Database connection in .env');
    console.error('   - Run migrations: npm run migrate');
    console.error('   - Database logs for errors\n');
    process.exit(1);
  }
}

seedAdmin();
