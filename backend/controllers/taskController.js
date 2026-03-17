const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

exports.createTask = async (req, res) => {
    try {
        const { title, description, teamId, assignedTo, priority, dueDate } = req.body;

        if (!title || !teamId || !assignedTo) {
            return res.status(400).json({ message: 'title, teamId and assignedTo are required' });
        }

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Admin can create tasks only for their own teams. SuperAdmin can create for any team.
        if (req.user.role === 'Admin' && team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can create tasks only for teams created by you' });
        }

        const assignee = await User.findById(assignedTo).select('_id role name email');
        if (!assignee) return res.status(404).json({ message: 'Assigned user not found' });
        if (assignee.role !== 'Member') return res.status(400).json({ message: 'Task can be assigned only to Member role users' });

        const isMemberInTeam = team.members.some((memberId) => memberId.toString() === assignedTo);
        if (!isMemberInTeam) {
            return res.status(400).json({ message: 'Assigned user is not a member of this team' });
        }

        const task = new Task({
            title: title.trim(),
            description: description ? description.trim() : '',
            teamId,
            assignedTo,
            priority: priority || 'Medium',
            dueDate: dueDate || null
        });

        await task.save();

        const createdTask = await Task.findById(task._id)
            .populate('teamId', 'teamName createdBy')
            .populate('assignedTo', '_id name email role');

        return res.status(201).json(createdTask);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const { status, priority } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        if (req.user.role === 'Member') {
            filter.assignedTo = req.user.id;
        } else if (req.user.role === 'Admin') {
            const myTeamIds = await Team.find({ createdBy: req.user.id }).distinct('_id');
            filter.teamId = { $in: myTeamIds };
        }

        const tasks = await Task.find(filter)
            .populate('teamId', 'teamName createdBy')
            .populate('assignedTo', '_id name email role')
            .sort({ createdAt: -1 });

        return res.json(tasks);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.getTasksByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { status, priority } = req.query;
        const filter = { teamId };

        const team = await Team.findById(teamId).select('_id createdBy');
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (req.user.role === 'Admin' && team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can view tasks only for teams created by you' });
        }

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const tasks = await Task.find(filter)
            .populate('teamId', 'teamName createdBy')
            .populate('assignedTo', '_id name email role')
            .sort({ createdAt: -1 });

        return res.json(tasks);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['Todo', 'In Progress', 'Completed'];

        if (!status || !allowed.includes(status)) {
            return res.status(400).json({ message: 'Valid status is required (Todo, In Progress, Completed)' });
        }

        const task = await Task.findById(id).populate('teamId', 'createdBy teamName');
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.user.role === 'Member' && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can update only your assigned tasks' });
        }

        if (
            req.user.role === 'Admin' &&
            task.teamId &&
            task.teamId.createdBy &&
            task.teamId.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({ message: 'You can update tasks only in teams created by you' });
        }

        task.status = status;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('teamId', 'teamName createdBy')
            .populate('assignedTo', '_id name email role');

        return res.json(updatedTask);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, assignedTo, priority, dueDate, status } = req.body;
        const allowedStatuses = ['Todo', 'In Progress', 'Completed'];
        const allowedPriorities = ['Low', 'Medium', 'High'];

        const task = await Task.findById(id).populate('teamId', '_id createdBy members');
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.user.role === 'Admin' && task.teamId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can update tasks only in teams created by you' });
        }

        if (title !== undefined) {
            if (!String(title).trim()) return res.status(400).json({ message: 'title cannot be empty' });
            task.title = String(title).trim();
        }

        if (description !== undefined) task.description = String(description || '').trim();

        if (priority !== undefined) {
            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({ message: 'priority must be one of: Low, Medium, High' });
            }
            task.priority = priority;
        }

        if (status !== undefined) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'status must be one of: Todo, In Progress, Completed' });
            }
            task.status = status;
        }

        if (dueDate !== undefined) task.dueDate = dueDate || null;

        if (assignedTo !== undefined) {
            const assignee = await User.findById(assignedTo).select('_id role');
            if (!assignee) return res.status(404).json({ message: 'Assigned user not found' });
            if (assignee.role !== 'Member') return res.status(400).json({ message: 'Task can be assigned only to Member role users' });

            const isMemberInTeam = task.teamId.members.some((memberId) => memberId.toString() === String(assignedTo));
            if (!isMemberInTeam) return res.status(400).json({ message: 'Assigned user is not a member of this team' });
            task.assignedTo = assignedTo;
        }

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('teamId', 'teamName createdBy')
            .populate('assignedTo', '_id name email role');

        return res.json(updatedTask);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id).populate('teamId', '_id createdBy');
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.user.role === 'Admin' && task.teamId.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can delete tasks only in teams created by you' });
        }

        await Task.findByIdAndDelete(id);
        return res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
