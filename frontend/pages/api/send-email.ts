import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface EmailRequest {
    to: string;
    subject: string;
    body: string;
}

interface EmailResponse {
    success: boolean;
    messageId?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<EmailResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { to, subject, body }: EmailRequest = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ error: 'to, subject, and body are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Simple API key protection
        if (process.env.API_KEY && req.headers['x-api-key'] !== process.env.API_KEY) {
            return res.status(403).json({ error: 'Forbidden - Invalid API key' });
        }

        // Check if MailerSend is configured
        if (process.env.MAILERSEND_API_KEY) {
            const result = await sendWithMailerSend(to, subject, body);
            return res.json(result);
        }

        // Check if Brevo is configured
        if (process.env.BREVO_API_KEY) {
            const result = await sendWithBrevo(to, subject, body);
            return res.json(result);
        }

        return res.status(500).json({ error: 'No email service configured' });

    } catch (error) {
        console.error('Email API error:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.message || 'Email service error';
            return res.status(status).json({ error: message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function sendWithMailerSend(to: string, subject: string, body: string): Promise<EmailResponse> {
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
            }
        }
    );

    return {
        success: true,
        messageId: response.headers['x-message-id']
    };
}

async function sendWithBrevo(to: string, subject: string, body: string): Promise<EmailResponse> {
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
            }
        }
    );

    return {
        success: true,
        messageId: response.data.messageId
    };
}
