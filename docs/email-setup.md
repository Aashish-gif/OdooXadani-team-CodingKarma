# Email Configuration Guide

This document explains how to set up email notifications for user account creation.

## SMTP Configuration

To enable email notifications, you need to configure SMTP settings in your `.env.local` file:

```env
# SMTP Configuration for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-company-name@your-domain.com
```

## Gmail Setup Instructions

If you're using Gmail for sending emails, follow these steps:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to your Google Account settings
   - Navigate to Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
   - Use this app password in the `SMTP_PASS` field

## Other Email Providers

For other email providers (Outlook, Yahoo, etc.), adjust the SMTP settings accordingly:

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Security Note

Never commit your `.env.local` file to version control. It should be included in your `.gitignore` file.

## Testing

After configuring the email settings, test the functionality by creating a new user through the admin panel. The new user should receive a welcome email with their credentials.

## Troubleshooting

- If emails are not being sent, check that your SMTP settings are correct
- Ensure your firewall is not blocking outbound connections on the SMTP port
- Verify that your email provider allows SMTP authentication from your IP address