const User = require('../models/User');
const Team = require('../models/Team');
const Task = require('../models/Task');

exports.listUsers = async (req, res) => {
    try {
        const { role, available } = req.query;
        const filter = {};
        if (role) filter.role = role;

        let users = await User.find(filter).select('_id name email role');

        if (available === 'true' && role === 'Member') {
            const teams = await Team.find().select('members');
            const assignedIds = new Set(
                teams.flatMap((team) => team.members.map((memberId) => memberId.toString()))
            );
            users = users.filter((user) => !assignedIds.has(user._id.toString()));
        }

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const allowedRoles = ['Admin', 'Member'];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Valid role is required (Member or Admin)' });
        }

        const user = await User.findById(id).select('_id name email role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'SuperAdmin') {
            return res.status(400).json({ message: 'SuperAdmin role cannot be changed' });
        }

        if (req.user.id === id) {
            return res.status(400).json({ message: 'SuperAdmin cannot change own role' });
        }

        // If Admin is downgraded to Member, delete all teams/tasks owned by that Admin.
        if (user.role === 'Admin' && role === 'Member') {
            const teamIds = await Team.find({ createdBy: user._id }).distinct('_id');
            if (teamIds.length) {
                await Task.deleteMany({ teamId: { $in: teamIds } });
                await Team.deleteMany({ _id: { $in: teamIds } });
            }
        }

        user.role = role;
        await user.save();

        return res.json({ message: 'Role updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('_id role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'SuperAdmin') {
            return res.status(400).json({ message: 'SuperAdmin account cannot be deleted' });
        }

        // Remove teams/tasks created by this user if user is/was Admin.
        const teamIds = await Team.find({ createdBy: user._id }).distinct('_id');
        if (teamIds.length) {
            await Task.deleteMany({ teamId: { $in: teamIds } });
            await Team.deleteMany({ _id: { $in: teamIds } });
        }

        // Remove user from any team memberships.
        await Team.updateMany({ members: user._id }, { $pull: { members: user._id } });

        // Remove tasks assigned to this user.
        await Task.deleteMany({ assignedTo: user._id });

        await User.findByIdAndDelete(user._id);
        return res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const nextName = String(name).trim();
        if (nextName.length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }

        const user = await User.findById(req.user.id).select('_id name email role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = nextName;
        await user.save();

        return res.json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
