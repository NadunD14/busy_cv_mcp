import axios from 'axios';
import nodemailer from 'nodemailer';

export const emailHandler = {
    async sendEmail(to, subject, body) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            throw new Error('Invalid email address');
        }

        // Try MailerSend first
        if (process.env.MAILERSEND_API_KEY) {
            return await this.sendWithMailerSend(to, subject, body);
        }

        // Try Brevo next
        if (process.env.BREVO_API_KEY) {
            return await this.sendWithBrevo(to, subject, body);
        }

        // Try SMTP as fallback
        if (process.env.SMTP_HOST) {
            return await this.sendWithSMTP(to, subject, body);
        }

        throw new Error('No email service configured. Please set up MailerSend, Brevo, or SMTP credentials.');
    },

    async sendWithMailerSend(to, subject, body) {
        try {
            const response = await axios.post(
                'https://api.mailersend.com/v1/email',
                {
                    from: {
                        email: process.env.EMAIL_FROM,
                        name: process.env.EMAIL_FROM_NAME || 'MCP CV Assistant'
                    },
                    to: [{ email: to }],
                    subject,
                    text: body,
                    html: body.replace(/\n/g, '<br>')
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.MAILERSEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return {
                success: true,
                messageId: response.headers['x-message-id'] || 'mailersend-sent',
                provider: 'MailerSend'
            };
        } catch (error) {
            console.error('MailerSend error:', error.response?.data || error.message);
            throw new Error(`MailerSend failed: ${error.response?.data?.message || error.message}`);
        }
    },

    async sendWithBrevo(to, subject, body) {
        try {
            const response = await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: {
                        email: process.env.EMAIL_FROM,
                        name: process.env.EMAIL_FROM_NAME || 'MCP CV Assistant'
                    },
                    to: [{ email: to }],
                    subject,
                    textContent: body,
                    htmlContent: body.replace(/\n/g, '<br>')
                },
                {
                    headers: {
                        'api-key': process.env.BREVO_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return {
                success: true,
                messageId: response.data.messageId || 'brevo-sent',
                provider: 'Brevo'
            };
        } catch (error) {
            console.error('Brevo error:', error.response?.data || error.message);
            throw new Error(`Brevo failed: ${error.response?.data?.message || error.message}`);
        }
    },

    async sendWithSMTP(to, subject, body) {
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

            const info = await transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'MCP CV Assistant'}" <${process.env.EMAIL_FROM}>`,
                to,
                subject,
                text: body,
                html: body.replace(/\n/g, '<br>')
            });

            return {
                success: true,
                messageId: info.messageId,
                provider: 'SMTP'
            };
        } catch (error) {
            console.error('SMTP error:', error);
            throw new Error(`SMTP failed: ${error.message}`);
        }
    }
};