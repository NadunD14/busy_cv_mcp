import dotenv from 'dotenv';
import mailerService from './src/services/mailer.js';

dotenv.config();

async function testEmailSending() {
    console.log('🧪 Testing Email Service...\n');

    // Check configuration
    console.log('📋 Configuration Check:');
    console.log(`- SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`- Email From: ${process.env.EMAIL_FROM || '❌ Missing'}`);
    console.log(`- Email From Name: ${process.env.EMAIL_FROM_NAME || 'Not set (optional)'}`);
    console.log(`- Configured Provider: ${mailerService.getConfiguredProvider()}\n`);

    if (!mailerService.isConfigured()) {
        console.log('❌ Email service is not properly configured. Please check your .env file.');
        return;
    }

    if (!process.env.EMAIL_FROM) {
        console.log('❌ EMAIL_FROM is required in .env file.');
        return;
    }

    // Test email sending
    try {
        console.log('📧 Sending test email...');

        const testEmail = {
            to: process.env.EMAIL_FROM, // Send to yourself for testing
            subject: 'CV Assistant - Test Email',
            body: `Hello from CV Assistant!

This is a test email to verify that the email sending functionality is working correctly.

✅ SendGrid integration: Working
✅ Backend API: Functional
✅ Email service: Ready

Timestamp: ${new Date().toISOString()}

Best regards,
CV Assistant Bot`
        };

        const result = await mailerService.sendTextEmail(testEmail.to, testEmail.subject, testEmail.body);

        console.log('✅ Email sent successfully!');
        console.log(`   Provider: ${result.provider}`);
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   To: ${testEmail.to}`);
        console.log(`   Subject: ${testEmail.subject}\n`);

        console.log('🎉 Email service is working correctly!');

    } catch (error) {
        console.error('❌ Email sending failed:');
        console.error(`   Error: ${error.message}\n`);

        if (error.message.includes('Invalid email')) {
            console.log('💡 Tip: Make sure EMAIL_FROM contains a valid email address.');
        } else if (error.message.includes('SendGrid')) {
            console.log('💡 Tips for SendGrid issues:');
            console.log('   - Verify your SendGrid API key is correct');
            console.log('   - Ensure your sender email is verified in SendGrid dashboard');
            console.log('   - Check if your SendGrid account is active');
        }
    }
}

// Run the test
testEmailSending().catch(console.error);
