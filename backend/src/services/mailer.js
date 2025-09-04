import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

class MailerService {
    constructor() {
        // Initialize SendGrid if API key is available
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        }
    }

    async sendEmail(options) {
        const { to, subject, text, html } = options;

        // Validate required fields
        if (!to || !subject || (!text && !html)) {
            throw new Error('Missing required email fields: to, subject, and text/html');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            throw new Error('Invalid email address format');
        }

        // Try SendGrid first
        if (process.env.SENDGRID_API_KEY) {
            return await this.sendWithSendGrid(options);
        }

        // Fallback to SMTP if configured
        if (process.env.SMTP_HOST) {
            return await this.sendWithSMTP(options);
        }

        throw new Error('No email service configured. Please set SENDGRID_API_KEY or SMTP credentials.');
    }

    async sendWithSendGrid(options) {
        const { to, subject, text, html, from, fromName } = options;

        try {
            const msg = {
                to: to,
                from: {
                    email: from || process.env.EMAIL_FROM,
                    name: fromName || process.env.EMAIL_FROM_NAME || 'MCP CV Assistant'
                },
                subject: subject,
                text: text,
                html: html || text?.replace(/\n/g, '<br>')
            };

            const response = await sgMail.send(msg);

            return {
                success: true,
                messageId: response[0].headers['x-message-id'] || 'sendgrid-sent',
                provider: 'SendGrid',
                response: response[0]
            };

        } catch (error) {
            console.error('SendGrid error:', error.response?.body || error.message);

            if (error.response) {
                const { body } = error.response;
                const errorMessage = body?.errors?.[0]?.message || body?.message || 'Unknown SendGrid error';
                throw new Error(`SendGrid failed: ${errorMessage}`);
            }

            throw new Error(`SendGrid failed: ${error.message}`);
        }
    }

    async sendWithSMTP(options) {
        const { to, subject, text, html, from, fromName } = options;

        try {
            const transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            const mailOptions = {
                from: `"${fromName || process.env.EMAIL_FROM_NAME || 'MCP CV Assistant'}" <${from || process.env.EMAIL_FROM}>`,
                to: to,
                subject: subject,
                text: text,
                html: html || text?.replace(/\n/g, '<br>')
            };

            const info = await transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: info.messageId,
                provider: 'SMTP',
                response: info
            };

        } catch (error) {
            console.error('SMTP error:', error);
            throw new Error(`SMTP failed: ${error.message}`);
        }
    }

    // Utility method to send a simple text email
    async sendTextEmail(to, subject, body) {
        return await this.sendEmail({
            to,
            subject,
            text: body
        });
    }

    // Utility method to send an HTML email
    async sendHtmlEmail(to, subject, htmlBody, textBody = null) {
        return await this.sendEmail({
            to,
            subject,
            html: htmlBody,
            text: textBody
        });
    }

    // Method to validate SendGrid configuration
    isConfigured() {
        return !!(process.env.SENDGRID_API_KEY || process.env.SMTP_HOST);
    }

    getConfiguredProvider() {
        if (process.env.SENDGRID_API_KEY) return 'SendGrid';
        if (process.env.SMTP_HOST) return 'SMTP';
        return 'None';
    }
}

export default new MailerService();
