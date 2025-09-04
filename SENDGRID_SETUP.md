# SendGrid Setup Guide

This guide will help you set up SendGrid for sending emails through the MCP CV Assistant.

## Why SendGrid?

- **100 emails/day free** - No credit card required
- **Reliable delivery** - Industry-leading email infrastructure  
- **Easy setup** - Simple API integration
- **Great documentation** - Well-documented service

## Setup Steps

### 1. Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com/)
2. Click "Start for Free"
3. Fill out the registration form
4. Verify your email address

### 2. Complete Sender Authentication

**Option A: Single Sender Verification (Recommended for testing)**
1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill out the form with your email details:
   - From Name: `CV Assistant` (or your preferred name)
   - From Email: Your email address (e.g., `you@gmail.com`)
   - Reply To: Same as From Email
   - Physical Address: Your address (required for compliance)
4. Click **Create**
5. Check your email and click the verification link

**Option B: Domain Authentication (For production)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the DNS setup instructions for your domain

### 3. Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it a name like "MCP CV Assistant"
5. Under **Mail Send**, toggle it to **Full Access**
6. Click **Create & View**
7. **Copy the API key** (you won't see it again!)

### 4. Configure Environment

1. Copy your API key
2. Open your `.env` file in the project root
3. Add/update these variables:

```env
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=your_verified_email@domain.com
EMAIL_FROM_NAME=CV Assistant
```

### 5. Test the Configuration

Run the email test script:

```bash
cd backend
npm run test:email
```

You should see:
```
✅ Email sent successfully!
   Message ID: <message-id>
   Provider: SendGrid
```

## Common Issues & Solutions

### 🔑 Invalid API Key
- **Error**: "The provided authorization grant is invalid"
- **Solution**: Regenerate your API key with proper Mail Send permissions

### 📧 Sender Not Verified
- **Error**: "The from address does not match a verified Sender Identity"
- **Solution**: Complete sender authentication (step 2 above)

### 🚫 Account Suspended
- **Error**: "Your account is suspended"
- **Solution**: Contact SendGrid support or verify your account details

### 📱 Test Email Not Received
- Check spam/junk folder
- Verify the sender email is correct
- Try sending to a different email address
- Check SendGrid Activity tab for delivery status

## Production Considerations

### Domain Authentication
For production use, set up domain authentication instead of single sender verification:
- Better deliverability
- Professional appearance
- Required for high-volume sending

### Email Templates
SendGrid supports dynamic templates for professional-looking emails:
- Create templates in SendGrid dashboard
- Use template IDs in your application
- Support for personalization and styling

### Monitoring
Monitor your email performance:
- **Activity** tab: See delivery status, opens, clicks
- **Statistics** tab: View sending metrics
- **Alerts**: Set up notifications for issues

## Free Tier Limits

- **100 emails/day** for free accounts
- **40,000 emails first month** (then 100/day)
- All features included
- No credit card required

## Need Help?

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Support](https://support.sendgrid.com/)
- [API Reference](https://docs.sendgrid.com/api-reference)

## Security Notes

- Never commit your API key to version control
- Use environment variables for all credentials
- Rotate API keys regularly
- Use restricted API keys with minimal permissions needed
