const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully with new About models');
    process.exit(0);
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
})();
