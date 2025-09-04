import Groq from 'groq-sdk';

// Initialize Groq client
const groq = process.env.GROQ_API_KEY ? new Groq({
    apiKey: process.env.GROQ_API_KEY
}) : null;

export const chatHandler = {
    async generateAnswer(parsed, question, useGroq = false) {
        // If Groq is available and requested, use AI
        if (useGroq && groq) {
            try {
                return await this.generateGroqAnswer(parsed, question);
            } catch (error) {
                console.error('Groq AI error, falling back to rule-based:', error);
                // Fall back to rule-based system
            }
        }

        // Rule-based system (existing logic)
        return this.generateRuleBasedAnswer(parsed, question);
    },

    async generateGroqAnswer(parsed, question) {
        const systemPrompt = `You are a CV/Resume assistant. You have access to a parsed resume with the following information:

Name: ${parsed.name || 'Not specified'}
Email: ${parsed.email || 'Not specified'}  
Phone: ${parsed.phone || 'Not specified'}
Skills: ${parsed.skills ? parsed.skills.join(', ') : 'Not specified'}
Education: ${parsed.education ? parsed.education.join(', ') : 'Not specified'}
Work Experience: ${parsed.jobs ? parsed.jobs.join('\n') : 'Not specified'}

Raw Resume Text:
${parsed.raw || 'No raw text available'}

Please answer questions about this resume professionally and concisely. If information is not available in the resume, say so clearly.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ],
            model: "llama-3.1-70b-versatile", // Fast and capable model
            temperature: 0.3, // Lower temperature for more consistent responses
            max_tokens: 500
        });

        return {
            text: completion.choices[0]?.message?.content || "I couldn't generate a response.",
            confidence: 0.9,
            source: 'groq'
        };
    },

    generateRuleBasedAnswer(parsed, question) {
        const questionLower = question.toLowerCase();

        // Last position/job questions
        if (questionLower.includes('last position') || questionLower.includes('recent job') || questionLower.includes('current job')) {
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
        if (questionLower.includes('skill') || questionLower.includes('technology') || questionLower.includes('programming')) {
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
        if (questionLower.includes('email') || questionLower.includes('contact')) {
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
        if (questionLower.includes('education') || questionLower.includes('degree') || questionLower.includes('university')) {
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
        if (questionLower.includes('experience') || questionLower.includes('work') || questionLower.includes('job')) {
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
        if (questionLower.includes('name') || questionLower.includes('who are')) {
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
            const matches = parsed.raw?.match(regex);
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
};