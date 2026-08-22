# Email Setup Guide for Password Reset

This guide will help you configure email sending for password reset functionality.

## Option 1: Gmail (Recommended - Easiest)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)" → Enter "Portfolio Admin"
4. Click "Generate"
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables
Add these to your `.env` file:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=https://your-domain.com
```

**Note:** Remove spaces from the app password when pasting!

---

## Option 2: Other Email Providers (SendGrid, Mailgun, etc.)

### For SMTP Providers:
```env
# Remove EMAIL_SERVICE line or leave it empty
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-api-key
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-domain.com
```

### Common SMTP Settings:

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASSWORD=your-mailgun-smtp-password
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

---

## Testing

### Development Mode (No Configuration Required)
If you don't configure any email settings, the system will:
1. Use Ethereal Email (fake SMTP for testing)
2. Display preview URLs in console logs
3. You can view test emails at https://ethereal.email

### Production Testing
1. Configure your email settings in `.env`
2. Restart the backend server
3. Go to `/admin/forgot-password`
4. Enter your admin email
5. Check your inbox for the reset email

---

## Troubleshooting

### Gmail "Less secure app access" Error
- Gmail removed "Less secure app access" in May 2022
- You **must** use App Passwords (see Option 1 above)
- Regular Gmail passwords will not work

### Email Not Received
1. Check spam/junk folder
2. Verify email credentials in `.env`
3. Check backend logs for error messages
4. Try sending a test email using nodemailer test page

### "Authentication failed" Error
- Double-check username and password
- For Gmail: Ensure 2FA is enabled and you're using App Password
- For other providers: Verify API key is correct

### Port Issues
- Port 587: STARTTLS (recommended)
- Port 465: SSL/TLS
- Port 25: Usually blocked by hosting providers

---

## Security Notes

1. **Never commit `.env` file to Git**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **Use App Passwords, not regular passwords**
   - More secure
   - Can be revoked independently

3. **For Production:**
   - Use environment variables in hosting platform (Railway, Heroku, etc.)
   - Don't hardcode credentials in code

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_SERVICE` | No | Use 'gmail' for Gmail | `gmail` |
| `EMAIL_USER` | For Gmail | Gmail address | `admin@gmail.com` |
| `EMAIL_PASSWORD` | For Gmail | Gmail App Password | `abcdefghijklmnop` |
| `EMAIL_FROM` | No | Sender email address | `noreply@example.com` |
| `SMTP_HOST` | For SMTP | SMTP server hostname | `smtp.example.com` |
| `SMTP_PORT` | For SMTP | SMTP port (usually 587) | `587` |
| `SMTP_SECURE` | No | Use SSL/TLS (true for 465) | `false` |
| `SMTP_USER` | For SMTP | SMTP username | `apikey` |
| `SMTP_PASSWORD` | For SMTP | SMTP password/API key | `your-key` |
| `FRONTEND_URL` | Yes | Your frontend URL | `https://example.com` |

---

## Need Help?

If you're still having issues:
1. Check backend console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your email provider allows SMTP access
4. Test with Ethereal Email first (development mode)
