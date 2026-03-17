const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

// GET /api/dashboard/summary - role-aware dashboard data
router.get('/summary', protect, getDashboardSummary);

module.exports = router;
