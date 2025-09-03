import type { NextApiRequest, NextApiResponse } from 'next';
import { ParsedResume } from '../../lib/resumeParser';

interface ChatRequest {
    parsedJson: ParsedResume;
    question: string;
    parsedId?: string;
}

interface ChatResponse {
    answer: string;
    confidence: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ChatResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { parsedJson, question }: ChatRequest = req.body;

        if (!parsedJson || !question) {
            return res.status(400).json({ error: 'parsedJson and question are required' });
        }

        const answer = generateAnswer(parsedJson, question.toLowerCase());

        return res.json({
            answer: answer.text,
            confidence: answer.confidence
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function generateAnswer(parsed: ParsedResume, question: string): { text: string; confidence: number } {
    // Last position/job questions
    if (question.includes('last position') || question.includes('recent job') || question.includes('current job')) {
        if (parsed.jobs && parsed.jobs.length > 0) {
            return {
                text: `Your most recent position: ${parsed.jobs[0]}`,
                confidence: 0.9
            };
        }
        return {
            text: "I couldn't find information about your recent positions in your resume.",
            confidence: 0.3
        };
    }

    // Skills questions
    if (question.includes('skill') || question.includes('technology') || question.includes('programming')) {
        if (parsed.skills && parsed.skills.length > 0) {
            return {
                text: `Your skills include: ${parsed.skills.join(', ')}`,
                confidence: 0.9
            };
        }
        return {
            text: "I couldn't find a skills section in your resume.",
            confidence: 0.3
        };
    }

    // Contact information
    if (question.includes('email') || question.includes('contact')) {
        const contact = [];
        if (parsed.email) contact.push(`Email: ${parsed.email}`);
        if (parsed.phone) contact.push(`Phone: ${parsed.phone}`);

        if (contact.length > 0) {
            return {
                text: `Your contact information: ${contact.join(', ')}`,
                confidence: 0.9
            };
        }
        return {
            text: "I couldn't find contact information in your resume.",
            confidence: 0.3
        };
    }

    // Education questions
    if (question.includes('education') || question.includes('degree') || question.includes('university')) {
        if (parsed.education && parsed.education.length > 0) {
            return {
                text: `Your education: ${parsed.education.join(', ')}`,
                confidence: 0.8
            };
        }
        return {
            text: "I couldn't find education information in your resume.",
            confidence: 0.3
        };
    }

    // Experience questions
    if (question.includes('experience') || question.includes('work') || question.includes('job')) {
        if (parsed.jobs && parsed.jobs.length > 0) {
            return {
                text: `You have ${parsed.jobs.length} work experiences listed. Here are your positions:\n\n${parsed.jobs.slice(0, 3).join('\n\n')}`,
                confidence: 0.8
            };
        }
        return {
            text: "I couldn't find work experience in your resume.",
            confidence: 0.3
        };
    }

    // Name questions
    if (question.includes('name') || question.includes('who are')) {
        if (parsed.name) {
            return {
                text: `Your name is ${parsed.name}`,
                confidence: 0.9
            };
        }
        return {
            text: "I couldn't identify your name from the resume.",
            confidence: 0.3
        };
    }

    // Fallback: search in raw text
    const questionWords = question.split(' ').filter(word => word.length > 3);
    const relevantSnippets = [];

    for (const word of questionWords) {
        const regex = new RegExp(`.{0,100}${word}.{0,100}`, 'gi');
        const matches = parsed.raw.match(regex);
        if (matches) {
            relevantSnippets.push(...matches.slice(0, 2));
        }
    }

    if (relevantSnippets.length > 0) {
        return {
            text: `I found this relevant information: ${relevantSnippets.slice(0, 2).join(' ... ')}`,
            confidence: 0.6
        };
    }

    return {
        text: "I couldn't find specific information to answer your question. Could you try rephrasing or asking about skills, experience, education, or contact information?",
        confidence: 0.2
    };
}
