import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { ParsedResume } from '../../lib/resumeParser';

interface ChatRequest {
    parsedJson: ParsedResume;
    question: string;
    parsedId?: string;
    useGroq?: boolean; // New field for AI integration
}

interface ChatResponse {
    answer: string;
    confidence: number;
    source?: string; // 'backend' | 'groq'
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ChatResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { parsedJson, question, useGroq = false }: ChatRequest = req.body;

        if (!parsedJson || !question) {
            return res.status(400).json({ error: 'parsedJson and question are required' });
        }

        // Forward request to backend
        const backendResponse = await axios.post(`${BACKEND_URL}/api/chat`, {
            parsedJson,
            question,
            useGroq // Pass the AI preference to backend
        }, {
            headers: {
                'Content-Type': 'application/json',
                // Add API key if configured
                ...(process.env.API_KEY && { 'x-api-key': process.env.API_KEY })
            },
            timeout: 30000 // 30 seconds timeout for AI responses
        });

        return res.json({
            answer: backendResponse.data.text || backendResponse.data.answer,
            confidence: backendResponse.data.confidence || 0.8,
            source: useGroq ? 'groq' : 'backend'
        });

    } catch (error) {
        console.error('Chat API error:', error);

        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.error || 'Backend service error';
            return res.status(status).json({ error: message });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
}


