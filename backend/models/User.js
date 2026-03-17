const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // Include SuperAdmin so it can be seeded manually; regular UI will expose only Admin/Member
    role: { type: String, enum: ['SuperAdmin', 'Admin', 'Member'], default: 'Member' },
    createdAt: { type: Date, default: Date.now },
    //email verification//
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    //password reset//
    passwordResetToken: String,
    passwordResetExpires: Date
});

module.exports = mongoose.model('User', UserSchema);
