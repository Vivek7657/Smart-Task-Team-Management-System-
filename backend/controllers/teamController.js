const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');

exports.createTeam = async (req, res) => {
    try {
        const { teamName, members } = req.body;
        if (!teamName) return res.status(400).json({ message: 'teamName is required' });

        const nameTrimmed = teamName.trim();
        // ensure uniqueness
        const existing = await Team.findOne({ teamName: nameTrimmed });
        if (existing) return res.status(400).json({ message: 'A team with that name already exists' });

        const createdBy = req.user.id;
        const membersList = Array.isArray(members) ? [...new Set(members.map((m) => String(m)))] : [];

        if (membersList.length) {
            const memberUsers = await User.find({ _id: { $in: membersList } }).select('_id role');
            if (memberUsers.length !== membersList.length) {
                return res.status(400).json({ message: 'One or more selected members are invalid' });
            }

            const hasInvalidRole = memberUsers.some((u) => u.role !== 'Member');
            if (hasInvalidRole) {
                return res.status(400).json({ message: 'Only users with role "Member" can be added to teams' });
            }

            // Global uniqueness: one Member can belong to only one team at a time.
            const existingTeamWithMembers = await Team.findOne({ members: { $in: membersList } }).populate('members', '_id name email');
            if (existingTeamWithMembers) {
                return res.status(400).json({ message: 'One or more selected members already belong to another team' });
            }
        }

        const team = new Team({ teamName: nameTrimmed, createdBy, members: membersList });
        await team.save();
        res.status(201).json(team);
    } catch (err) {
        console.error(err);
        // handle duplicate key race (unique index)
        if (err.code === 11000) return res.status(400).json({ message: 'A team with that name already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('members', '-password').populate('createdBy', 'name email');
        if (!team) return res.status(404).json({ message: 'Team not found' });

        const isSuperAdmin = req.user.role === 'SuperAdmin';
        const isCreator = team.createdBy && team.createdBy._id.toString() === req.user.id;
        const isMember = team.members.some((m) => m._id.toString() === req.user.id);
        if (!isSuperAdmin && !isCreator && !isMember) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { id } = req.params; // team id
        const { memberId } = req.body;
        if (!memberId) return res.status(400).json({ message: 'memberId is required' });

        const team = await Team.findById(id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (req.user.role === 'Admin' && team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only modify teams created by you' });
        }

        // ensure member exists and is a 'Member' role (admins/superadmins should not be added)
        const userToAdd = await User.findById(memberId);
        if (!userToAdd) return res.status(404).json({ message: 'User not found' });
        if (userToAdd.role !== 'Member') return res.status(400).json({ message: 'Only users with role "Member" can be added to a team' });

        if (team.members.some((m) => m.toString() === memberId)) return res.status(400).json({ message: 'Member already in team' });

        const existingTeam = await Team.findOne({ _id: { $ne: id }, members: memberId }).select('_id teamName');
        if (existingTeam) {
            return res.status(400).json({ message: `Member already belongs to another team (${existingTeam.teamName})` });
        }

        team.members.push(memberId);
        await team.save();
        const populated = await Team.findById(id).populate('members', '-password').populate('createdBy', 'name email');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id, memberId } = req.params;
        const team = await Team.findById(id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (req.user.role === 'Admin' && team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only modify teams created by you' });
        }

        const idx = team.members.findIndex(m => m.toString() === memberId);
        if (idx === -1) return res.status(404).json({ message: 'Member not in team' });

        team.members.splice(idx, 1);
        await team.save();
        const populated = await Team.findById(id).populate('members', '-password').populate('createdBy', 'name email');
        res.json(populated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (req.user.role === 'Admin' && team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can delete only teams created by you' });
        }

        await Task.deleteMany({ teamId: team._id });
        await Team.findByIdAndDelete(team._id);

        return res.json({ message: 'Team and related tasks deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const { teamName } = req.body;
        if (!teamName || !String(teamName).trim()) {
            return res.status(400).json({ message: 'teamName is required' });
        }

        const team = await Team.findById(id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (req.user.role === 'Admin' && team.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can update only teams created by you' });
        }

        const nameTrimmed = String(teamName).trim();
        const duplicate = await Team.findOne({ _id: { $ne: id }, teamName: nameTrimmed });
        if (duplicate) return res.status(400).json({ message: 'A team with that name already exists' });

        team.teamName = nameTrimmed;
        await team.save();

        const updated = await Team.findById(id).populate('members', '-password').populate('createdBy', 'name email');
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// List teams. If ?mine=true returns teams where user is creator or member.
exports.listTeams = async (req, res) => {
    try {
        const { mine } = req.query;
        const userId = req.user.id;

        if (mine === 'true') {
            const teams = await Team.find({ $or: [{ createdBy: userId }, { members: userId }] })
                .populate('members', '-password')
                .populate('createdBy', 'name email');
            return res.json(teams);
        }

        // Admin can only see teams created by them. SuperAdmin can see all teams.
        if (req.user.role === 'Admin') {
            const teams = await Team.find({ createdBy: userId }).populate('members', '-password').populate('createdBy', 'name email');
            return res.json(teams);
        }

        if (req.user.role === 'SuperAdmin') {
            const teams = await Team.find().populate('members', '-password').populate('createdBy', 'name email');
            return res.json(teams);
        }

        return res.status(403).json({ message: 'Forbidden' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
