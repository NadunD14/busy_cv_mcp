export const chatHandler = {
    generateAnswer(parsed, question) {
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