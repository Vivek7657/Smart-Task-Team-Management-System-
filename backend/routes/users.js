const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/auth');
const { listUsers, updateUserRole, deleteUser, updateMe } = require('../controllers/userController');

// PATCH /api/users/me - user can update own profile (name only)
router.patch('/me', protect, updateMe);
// GET /api/users?role=Member - only Admin/SuperAdmin can list users
router.get('/', protect, authorizeRoles('Admin', 'SuperAdmin'), listUsers);
// PATCH /api/users/:id/role - only SuperAdmin can update role
router.patch('/:id/role', protect, authorizeRoles('SuperAdmin'), updateUserRole);
// DELETE /api/users/:id - only SuperAdmin can delete user
router.delete('/:id', protect, authorizeRoles('SuperAdmin'), deleteUser);

module.exports = router;
