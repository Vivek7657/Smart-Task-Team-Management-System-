const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/auth');
const { createTeam, getTeam, addMember, removeMember, listTeams, deleteTeam, updateTeam } = require('../controllers/teamController');

// POST /api/teams - Admin/SuperAdmin create team
router.post('/', protect, authorizeRoles('Admin', 'SuperAdmin'), createTeam);

// GET /api/teams - list teams (supports ?mine=true)
router.get('/', protect, listTeams);

// GET /api/teams/:id - authenticated users can view
router.get('/:id', protect, getTeam);

// POST /api/teams/:id/add-member - Admin/SuperAdmin add member (verb-explicit)
router.post('/:id/add-member', protect, authorizeRoles('Admin', 'SuperAdmin'), addMember);

// DELETE /api/teams/:id/remove-member/:memberId - Admin/SuperAdmin remove member (verb-explicit)
router.delete('/:id/remove-member/:memberId', protect, authorizeRoles('Admin', 'SuperAdmin'), removeMember);
// DELETE /api/teams/:id - Admin/SuperAdmin delete team
router.delete('/:id', protect, authorizeRoles('Admin', 'SuperAdmin'), deleteTeam);
// PATCH /api/teams/:id - Admin/SuperAdmin update team details
router.patch('/:id', protect, authorizeRoles('Admin', 'SuperAdmin'), updateTeam);

module.exports = router;
