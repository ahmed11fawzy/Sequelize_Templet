const nodemailer = require("nodemailer");

module.exports = async (options) => {
  // 1) Create a transporter
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // Your email address
      pass: process.env.PASSWORD, // Your email password or app password
    },
  });
  // 2) Define the email options
  const mailOptions = {
    from: "'ahmed11fawzi' <reus11@ahmed.io>",
    to: options.email,
    subject: options.subject,
    subject: "reset password",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            We received a request to reset your password. Here is your 6-digit verification code:
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 0; color: #333;">
              ${options.resetToken}
            </p>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            This code will expire in 10 minutes. you can also reset your password by clicking the link below:
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            <a href="${
              options.url
            }" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">
            If you didn't request this code, you can safely ignore this email.
          </p>
          <p style="font-size: 14px; margin-top: 30px; color: #777; text-align: center;">
            &copy; ${new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      `, // HTML body
  };
  // 3) Actually send the email
  await transport.sendMail(mailOptions);
};
