const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/query', require('./routes/queryRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CodeShield AI API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CodeShield AI Server running on port ${PORT}`);
  console.log(`📚 API endpoints:`);
  console.log(`   POST /api/query - Query secure coding practices`);
  console.log(`   POST /api/upload - Upload security documentation`);
  console.log(`   GET /api/health - Health check`);
});

