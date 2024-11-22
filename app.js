const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
require('events').EventEmitter.defaultMaxListeners = 15;
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initNotificationCron } = require('./services/cronService');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/movieRoutes'));
app.use('/api/ratings-reviews', require('./routes/ratingReviewRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes')); 
app.use('/api', require('./routes/listRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Initialize notification cron job
initNotificationCron();

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;