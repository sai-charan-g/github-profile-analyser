require('dotenv').config();
const app = require('./src/app');
const { testConnection, initializeDatabase } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await testConnection();
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GitHub Token: ${process.env.GITHUB_TOKEN ? 'set' : 'not set (60 req/hr)'}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
