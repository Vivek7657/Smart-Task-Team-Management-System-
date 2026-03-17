const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const { register, login, getMe, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me - protected
router.get('/me', protect, getMe);

router.get('/verify-email', verifyEmail);

router.post('/resend-verification', resendVerificationEmail); 

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);


module.exports = router;
