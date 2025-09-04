import dotenv from 'dotenv';
import mailerService from '../src/services/mailer.js';

// Load environment variables
dotenv.config();

async function testEmailServices() {
    console.log('🧪 Testing Email Services...\n');

    // Check configuration
    console.log('📋 Configuration Status:');
    console.log(`   Configured Provider: ${mailerService.getConfiguredProvider()}`);
    console.log(`   Is Configured: ${mailerService.isConfigured()}`);
    console.log(`   SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '✓ Set' : '✗ Not set'}`);
    console.log(`   Email From: ${process.env.EMAIL_FROM || '✗ Not set'}`);
    console.log('');

    if (!mailerService.isConfigured()) {
        console.log('❌ No email service configured. Please set up SendGrid or SMTP credentials.');
        console.log('');
        console.log('To set up SendGrid:');
        console.log('1. Sign up at https://sendgrid.com/');
        console.log('2. Get your API key from Settings → API Keys');
        console.log('3. Set SENDGRID_API_KEY in your .env file');
        console.log('4. Set EMAIL_FROM to your verified sender email');
        return;
    }

    // Test email (only if configured)
    const testEmail = process.env.EMAIL_FROM || 'test@example.com';
    const subject = 'MCP CV Assistant - Test Email';
    const body = `Hello! This is a test email from the MCP CV Assistant.

✅ Email service is working correctly
🕐 Sent at: ${new Date().toISOString()}
🔧 Provider: ${mailerService.getConfiguredProvider()}

If you received this email, your email configuration is working properly!

Best regards,
MCP CV Assistant`;

    try {
        console.log('📧 Sending test email...');
        console.log(`   To: ${testEmail}`);
        console.log(`   Subject: ${subject}`);
        console.log('');

        const result = await mailerService.sendTextEmail(testEmail, subject, body);

        console.log('✅ Email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Provider: ${result.provider}`);
        console.log('');
        console.log('📬 Check your inbox to confirm delivery.');

    } catch (error) {
        console.log('❌ Failed to send email:');
        console.log(`   Error: ${error.message}`);
        console.log('');
        console.log('🔧 Troubleshooting tips:');

        if (error.message.includes('SendGrid')) {
            console.log('   • Verify your SendGrid API key is correct');
            console.log('   • Ensure your sender email is verified in SendGrid');
            console.log('   • Check that your SendGrid account is active');
        } else if (error.message.includes('SMTP')) {
            console.log('   • Verify your SMTP credentials are correct');
            console.log('   • Check that your SMTP server allows connections');
            console.log('   • Ensure your email password/app password is valid');
        }
    }
}

// Run the test
testEmailServices().catch(console.error);
