const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require('../middleware/auth');
const { createTask, getMyTasks, getTasksByTeam, updateTaskStatus, updateTask, deleteTask } = require('../controllers/taskController');

// POST /api/tasks - Admin/SuperAdmin create and assign task
router.post('/', protect, authorizeRoles('Admin', 'SuperAdmin'), createTask);
// GET /api/tasks/my - current user's task list with filters
router.get('/my', protect, getMyTasks);
// GET /api/tasks/team/:teamId - Admin/SuperAdmin team task list with filters
router.get('/team/:teamId', protect, authorizeRoles('Admin', 'SuperAdmin'), getTasksByTeam);
// PATCH /api/tasks/:id/status - member can update own assigned task status
router.patch('/:id/status', protect, updateTaskStatus);
// PATCH /api/tasks/:id - Admin/SuperAdmin can edit task details
router.patch('/:id', protect, authorizeRoles('Admin', 'SuperAdmin'), updateTask);
// DELETE /api/tasks/:id - Admin/SuperAdmin can delete task
router.delete('/:id', protect, authorizeRoles('Admin', 'SuperAdmin'), deleteTask);

module.exports = router;
