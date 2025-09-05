# Email Setup Guide - CV Assistant

This guide explains how to set up email sending functionality using SendGrid.

## 📧 SendGrid Setup

### 1. Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your account via email

### 2. Create API Key
1. Login to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access**
5. Give it a name like "CV Assistant"
6. Enable **Mail Send** permission
7. Copy the generated API key

### 3. Verify Sender Email
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your email details
4. Check your email and click the verification link

### 4. Configure Environment Variables

Update your `backend/.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=your-verified-email@example.com
EMAIL_FROM_NAME=CV Assistant Bot

# Optional security
API_KEY=your-secret-api-key-here
```

### 5. Test the Setup

Run the email test script:

```bash
cd backend
npm run test:email
```

## 🚀 Using the Email Feature

### Backend API
Send POST request to `http://localhost:3001/api/send-email`:

```json
{
  "to": "recipient@example.com",
  "subject": "Test Subject",
  "body": "Email content here"
}
```

### Frontend Component
The `EmailSender` component is already integrated in the frontend with:
- Email templates
- Form validation
- Loading states
- Error handling

### Starting the Application

1. **Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access:** Open http://localhost:3000

## 🔧 Troubleshooting

### Common Issues

1. **"SendGrid failed: Invalid email address"**
   - Ensure EMAIL_FROM is verified in SendGrid dashboard

2. **"SendGrid failed: Unauthorized"**
   - Check if API key is correct
   - Verify API key has Mail Send permissions

3. **"No email service configured"**
   - Ensure SENDGRID_API_KEY is set in .env file

4. **CORS errors in frontend**
   - Backend must be running on port 3001
   - Check BACKEND_URL in frontend/.env.local

### Testing Tips

- Always test with the same email address you verified in SendGrid
- Check SendGrid dashboard for delivery statistics
- Monitor the browser console for frontend errors
- Check backend logs for detailed error messages

## 📝 Email Templates

The frontend includes pre-built templates for:
- Professional Introduction
- Follow-up emails
- Thank you notes

These can be customized in `frontend/components/EmailSender.js`.

## 🔒 Security

- Never expose your SendGrid API key in frontend code
- Use the optional API_KEY for additional security
- Consider rate limiting in production
- Validate email addresses on both frontend and backend

## 📊 SendGrid Free Tier Limits

- 100 emails per day
- Email analytics and tracking
- Template engine
- Webhook support

For higher volumes, consider upgrading to a paid plan.
