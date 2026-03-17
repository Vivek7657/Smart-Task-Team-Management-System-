const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');

function buildTaskSummary(tasks) {
    const summary = {
        total: tasks.length,
        todo: 0,
        inProgress: 0,
        completed: 0,
        pending: 0
    };

    for (const task of tasks) {
        if (task.status === 'Todo') summary.todo += 1;
        if (task.status === 'In Progress') summary.inProgress += 1;
        if (task.status === 'Completed') summary.completed += 1;
    }

    summary.pending = summary.todo + summary.inProgress;
    return summary;
}

exports.getDashboardSummary = async (req, res) => {
    try {
        const role = req.user.role;
        const userId = req.user.id;

        if (role === 'SuperAdmin') {
            const [teams, tasks, users] = await Promise.all([
                Team.find().populate('createdBy', 'name email').populate('members', 'name email role'),
                Task.find().populate('teamId', 'teamName').populate('assignedTo', 'name email role'),
                User.find().select('_id role')
            ]);

            const taskSummary = buildTaskSummary(tasks);
            const userCounts = {
                total: users.length,
                admins: users.filter((u) => u.role === 'Admin').length,
                members: users.filter((u) => u.role === 'Member').length,
                superAdmins: users.filter((u) => u.role === 'SuperAdmin').length
            };

            return res.json({
                role,
                taskSummary,
                userCounts,
                teams,
                tasks
            });
        }

        if (role === 'Admin') {
            const teams = await Team.find({ createdBy: userId }).populate('createdBy', 'name email').populate('members', 'name email role');
            const teamIds = teams.map((t) => t._id);
            const tasks = await Task.find({ teamId: { $in: teamIds } }).populate('teamId', 'teamName').populate('assignedTo', 'name email role');

            return res.json({
                role,
                taskSummary: buildTaskSummary(tasks),
                teams,
                tasks
            });
        }

        // Member
        const [teams, tasks] = await Promise.all([
            Team.find({ members: userId }).populate('createdBy', 'name email').populate('members', 'name email role'),
            Task.find({ assignedTo: userId }).populate('teamId', 'teamName').populate('assignedTo', 'name email role')
        ]);

        return res.json({
            role,
            taskSummary: buildTaskSummary(tasks),
            teams,
            tasks
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
