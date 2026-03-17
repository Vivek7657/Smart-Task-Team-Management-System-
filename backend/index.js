const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors({
    origin: function (origin, callback) {
        // Allow: no origin (Postman / curl), localhost, any Vercel preview or production URL
        if (
            !origin ||
            origin === 'http://localhost:5173' ||
            origin === process.env.FRONTEND_URL ||
            /^https:\/\/smart-task-team-management-system.*\.vercel\.app$/.test(origin) ||
            /^https:\/\/.*\.vercel\.app$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Smart Task & Team Management API' });
});

// Mount routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Teams
app.use('/api/teams', require('./routes/teams'));
// Users
app.use('/api/users', require('./routes/users'));
// Tasks
app.use('/api/tasks', require('./routes/tasks'));
// Dashboard analytics
app.use('/api/dashboard', require('./routes/dashboard'));

app.use('/api/auth/verify-email', require('./routes/auth'));
app.use('/api/auth/resend-verification', require('./routes/auth'));
app.use('/api/auth/forgot-password', require('./routes/auth'));
app.use('/api/auth/reset-password', require('./routes/auth'));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

async function start() {
    try {
        if (!MONGO_URI) console.warn('MONGO_URI is not set. Connect will fail until .env is configured.');
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
