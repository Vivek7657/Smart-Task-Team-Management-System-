const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail, signupEmailTemplate } = require('../utils/sendMails');
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Missing fields' });

        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const safeRole = role === 'Admin' ? 'Admin' : 'Member';

        const user = new User({
            name,
            email,
            password: hashed,
            role: safeRole
        });

        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        // Try to send verification email — but don't crash registration if it fails
        try {
            const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            await sendMail(
                user.email,
                "Verify your email",
                `
<h2>Verify your account</h2>
<p>Click below to verify your email:</p>
<a href="${verifyUrl}">Verify Email</a>
`
            );
            console.log('✅ Verification email sent to', user.email);
        } catch (emailErr) {
            console.error('⚠️ Email send failed (user still registered):', emailErr.message);
            // Registration continues — user can request resend from login page
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 🚨 Email verification check FIRST
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in."
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ message: 'Not authenticated' });
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {

    const { token } = req.query;

    console.log("Token from URL:", token);

    const user = await User.findOne({
        emailVerificationToken: token
    });

    console.log("User found:", user);

    if (!user) {
        return res.status(400).json({
            message: "Invalid or expired token"
        });
    }

    if (user.emailVerificationExpires < Date.now()) {
        return res.status(400).json({
            message: "Token expired"
        });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully" });
};


exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // if (user.emailVerificationExpires > Date.now() - 60 * 1000) {
        //     return res.status(429).json({
        //         message: "Please wait before requesting another email."
        //     });
        // }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        // Send new email
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        await sendMail(
            user.email,
            "Verify your email",
            `
<h2>Verify your account</h2>
<p>Click below to verify your email:</p>
<a href="${verifyUrl}">Verify Email</a>
`
        );

        res.json({ message: "Verification email resent successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const crypto = require("crypto");

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendMail(
            user.email,
            "Reset your password",
            `
<h2>Password Reset</h2>
<p>Click the link below to reset your password:</p>
<a href="${resetUrl}">Reset Password</a>
`
        );

        res.json({ message: "Password reset email sent" });

    } catch (error) {

        res.status(500).json({ message: "Server error" });

    }

};

exports.resetPassword = async (req, res) => {

    try {

        const { token } = req.query;
        const { password } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const bcrypt = require("bcrypt");

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (error) {

        res.status(500).json({ message: "Server error" });

    }

};