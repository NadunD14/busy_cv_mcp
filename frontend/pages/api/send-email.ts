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

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

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

        // Forward request to backend
        const backendResponse = await axios.post(`${BACKEND_URL}/api/send-email`, {
            to,
            subject,
            body
        }, {
            headers: {
                'Content-Type': 'application/json',
                // Add API key if configured
                ...(process.env.API_KEY && { 'x-api-key': process.env.API_KEY })
            },
            timeout: 15000 // 15 seconds timeout for email sending
        });

        return res.json({
            success: backendResponse.data.success,
            messageId: backendResponse.data.messageId
        });

    } catch (error) {
        console.error('Email API error:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error || 'Backend service error';
            return res.status(status).json({ error: message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}


