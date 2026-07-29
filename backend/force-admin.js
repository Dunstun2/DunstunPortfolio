const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function forceAdmin() {
  try {
    let admin = await User.findOne({ where: { email: 'admin@example.com' } });
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (admin) {
      admin.password_hash = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('Account found, role set to admin and password reset.');
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${password}`);
    } else {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        role: 'admin'
      });
      console.log('Admin account created.');
      console.log(`Email: admin@example.com`);
      console.log(`Password: ${password}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

forceAdmin();
