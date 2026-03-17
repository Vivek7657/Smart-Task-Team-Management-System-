const nodemailer = require("nodemailer");

/*SMTP TRANSPORTER*/
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
    },
});

/*SEND MAIL FUNCTION*/
exports.sendMail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        html,
    });
};


exports.signupEmailTemplate = (name) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color:#4f46e5;">Welcome ${name} 🎉</h2>

            <p>Your account has been successfully created.</p>

            <p>
                You can now start managing your tasks and teams inside
                <strong>Smart Task & Team Management System</strong>.
            </p>

            <hr/>

            <p style="font-size:14px;color:#666;">
                If you did not create this account, please ignore this email.
            </p>

            <p style="margin-top:20px;">
                🚀 Happy Productivity!
            </p>
        </div>
    `;
};