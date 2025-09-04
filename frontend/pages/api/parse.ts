import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface ParseRequest {
    text: string;
}

interface ParsedResume {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    education: string[];
    jobs: string[];
    raw: string;
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ParsedResume | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text }: ParseRequest = req.body;

        if (!text) {
            return res.status(400).json({ error: 'text is required' });
        }

        // Forward request to backend
        const backendResponse = await axios.post(`${BACKEND_URL}/api/parse`, {
            text
        }, {
            headers: {
                'Content-Type': 'application/json',
                // Add API key if configured
                ...(process.env.API_KEY && { 'x-api-key': process.env.API_KEY })
            },
            timeout: 10000 // 10 seconds timeout
        });

        return res.json(backendResponse.data);

    } catch (error) {
        console.error('Parse API error:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error || 'Backend service error';
            return res.status(status).json({ error: message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}
