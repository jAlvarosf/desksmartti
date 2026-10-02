const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const companyRoutes = require('./routes/companyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static frontend build if present
let publicPath = path.join(__dirname, '../public');
if (!fs.existsSync(publicPath)) {
  publicPath = path.join(__dirname, '../../frontend/dist');
}

if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/companies', companyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'DeskSmartTI Backend Running', time: new Date() });
});

// Single Page Application (SPA) fallback for React Router in production
if (fs.existsSync(publicPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`DeskSmartTI Backend API server running on port ${PORT}`);
});
