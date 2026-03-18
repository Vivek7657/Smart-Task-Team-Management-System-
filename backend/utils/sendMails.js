/*
 * Email sender using Brevo Transactional Email HTTP API
 * Uses HTTPS (port 443) — works on ALL cloud platforms including Render free tier
 * SMTP (port 587) is blocked by Render — this bypasses that entirely
 */

exports.sendMail = async (to, subject, html) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: 'Smart Task Manager',
                email: process.env.BREVO_SENDER_EMAIL   // your verified sender email
            },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Brevo API error:', response.status, errorBody);
        throw new Error(`Brevo API failed: ${response.status} - ${errorBody}`);
    }

    console.log('✅ Email sent via Brevo API to:', to);
};

exports.signupEmailTemplate = (name) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color:#4f46e5;">Welcome ${name} 🎉</h2>
            <p>Your account has been successfully created.</p>
            <p>You can now start managing your tasks and teams inside
                <strong>Smart Task &amp; Team Management System</strong>.
            </p>
            <hr/>
            <p style="font-size:14px;color:#666;">
                If you did not create this account, please ignore this email.
            </p>
            <p style="margin-top:20px;">🚀 Happy Productivity!</p>
        </div>
    `;
};