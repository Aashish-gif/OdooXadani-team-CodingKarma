import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a transporter for sending emails
 */
const createTransporter = () => {
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // Check if all required SMTP configuration is present
  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.warn('SMTP configuration is missing. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport(smtpConfig);
};

/**
 * Sends an email using the configured transporter
 */
export const sendEmail = async ({ to, subject, html, text }: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.warn('Email transport not configured. Skipping email delivery.');
      return false;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

/**
 * Sends a welcome email to a new user
 */
export const sendWelcomeEmail = async (email: string, name: string, password: string): Promise<boolean> => {
  const subject = 'Welcome to Our Company!';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Our Company!</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We're excited to have you join our team! Your account has been created successfully.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Account Credentials:</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Please log in to our system using the credentials above and change your password for security reasons.</p>
      <p>If you have any questions or need assistance, please reach out to our IT department.</p>
      <br>
      <p>Best regards,<br>The Admin Team</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, html });
};