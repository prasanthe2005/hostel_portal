const { initializeDatabase } = require('./config/init-db');

// Run database initialization
const runInit = async () => {
  try {
    await initializeDatabase();
    console.log('Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

runInit();