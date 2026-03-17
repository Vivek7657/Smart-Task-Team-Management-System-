const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/*SEND MAIL FUNCTION*/
exports.sendMail = async (to, subject, html) => {
    const { error } = await resend.emails.send({
        from: 'Smart Task Manager <onboarding@resend.dev>',
        to,
        subject,
        html,
    });

    if (error) {
        console.error('Resend email error:', error);
        throw new Error('Failed to send email');
    }
};

exports.signupEmailTemplate = (name) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color:#4f46e5;">Welcome ${name} 🎉</h2>

            <p>Your account has been successfully created.</p>

            <p>
                You can now start managing your tasks and teams inside
                <strong>Smart Task &amp; Team Management System</strong>.
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