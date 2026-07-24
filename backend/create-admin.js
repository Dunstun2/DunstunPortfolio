/**
 * Production-Safe Admin User Creator
 * 
 * This script creates ONLY an admin user account for production.
 * It does NOT create any sample data, projects, or test content.
 * 
 * Usage:
 *   node create-admin.js
 * 
 * You will be prompted for:
 *   - Admin name
 *   - Admin email
 *   - Admin password
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');
const { User } = require('./models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionPassword(prompt) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(prompt);
    stdin.resume();
    stdin.setRawMode(true);
    stdin.setEncoding('utf8');
    
    let password = '';
    
    stdin.on('data', function(char) {
      char = char.toString('utf8');
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.clearLine();
            stdout.cursorTo(0);
            stdout.write(prompt + '*'.repeat(password.length));
          }
          break;
        default:
          password += char;
          stdout.write('*');
          break;
      }
    });
  });
}

async function createAdmin() {
  console.log('\n===========================================');
  console.log('🔐 Production Admin User Creator');
  console.log('===========================================\n');
  console.log('⚠️  This script creates ONLY an admin account.');
  console.log('📝 No sample data or test content will be created.\n');

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('⚠️  An admin user already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.name}\n`);
      
      const overwrite = await question('Do you want to create another admin? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('\n✅ Keeping existing admin. Exiting...\n');
        rl.close();
        process.exit(0);
      }
    }

    // Get admin details
    const name = await question('\n👤 Enter admin name: ');
    const email = await question('📧 Enter admin email: ');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('\n❌ Invalid email format!\n');
      rl.close();
      process.exit(1);
    }

    // Check if email exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('\n❌ A user with this email already exists!\n');
      rl.close();
      process.exit(1);
    }

    // Get password
    const password = await questionPassword('🔒 Enter admin password (min 8 characters): ');
    
    if (password.length < 8) {
      console.log('\n❌ Password must be at least 8 characters!\n');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await questionPassword('🔒 Confirm password: ');
    
    if (password !== confirmPassword) {
      console.log('\n❌ Passwords do not match!\n');
      rl.close();
      process.exit(1);
    }

    // Create admin user
    console.log('\n⏳ Creating admin user...');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    console.log('\n===========================================');
    console.log('✅ Admin user created successfully!');
    console.log('===========================================');
    console.log(`\n👤 Name: ${admin.name}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin.id}\n`);
    
    console.log('🚀 Next steps:');
    console.log('   1. Login to admin panel at: /admin');
    console.log('   2. Use the email and password you just created');
    console.log('   3. Start creating your content!\n');
    
    console.log('⚠️  IMPORTANT SECURITY REMINDERS:');
    console.log('   - Store your credentials securely');
    console.log('   - Use a strong, unique password');
    console.log('   - Enable 2FA if available');
    console.log('   - Never share your admin credentials\n');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Ensure database is connected');
    console.error('   2. Check .env configuration');
    console.error('   3. Run migrations: npm run migrate');
    console.error('   4. Check database logs\n');
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Run the script
console.log('\n⏳ Connecting to database...\n');
createAdmin();
