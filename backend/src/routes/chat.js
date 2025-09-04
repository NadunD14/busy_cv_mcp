import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Hugging Face client
const hf = process.env.HUGGINGFACE_API_TOKEN ? new HfInference(process.env.HUGGINGFACE_API_TOKEN) : null;

export const chatHandler = {
    async generateAnswer(parsed, question, useAI = false) {
        // If Hugging Face is available and requested, use DistilBERT
        if (useAI && hf) {
            try {
                return await this.generateDistilBERTAnswer(parsed, question);
            } catch (error) {
                console.error('DistilBERT AI error, falling back to rule-based:', error);
                // Fall back to rule-based system
            }
        }

        // Rule-based system (existing logic)
        return this.generateRuleBasedAnswer(parsed, question);
    },

    async generateDistilBERTAnswer(parsed, question) {
        // Create a context from the parsed resume data
        const context = this.buildResumeContext(parsed);

        try {
            // Use DistilBERT for question answering
            const response = await hf.questionAnswering({
                model: 'distilbert-base-uncased-distilled-squad',
                inputs: {
                    question: question,
                    context: context
                }
            });

            // Validate and format the response
            if (response && response.answer && response.answer.trim()) {
                const confidence = response.score || 0.5; // DistilBERT provides confidence scores

                // Post-process the answer for better formatting
                let answer = response.answer.trim();

                // If it's a name question and answer looks like a name, format it properly
                if (question.toLowerCase().includes('name') && answer.length > 0) {
                    // Capitalize properly if it's a name
                    answer = answer.split(' ').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                    answer = `Your name is ${answer}`;
                }

                return {
                    text: answer,
                    confidence: Math.min(confidence, 0.95), // Cap confidence at 95%
                    source: 'distilbert'
                };
            } else {
                // If DistilBERT can't find a good answer, fall back to rule-based
                console.log('DistilBERT returned low confidence answer, falling back to rule-based');
                return this.generateRuleBasedAnswer(parsed, question);
            }
        } catch (error) {
            console.error('DistilBERT API error:', error);
            // Fall back to rule-based system
            return this.generateRuleBasedAnswer(parsed, question);
        }
    },

    buildResumeContext(parsed) {
        // Build a comprehensive context string for DistilBERT
        const contextParts = [];

        if (parsed.name) {
            contextParts.push(`Name: ${parsed.name}`);
        }

        if (parsed.email) {
            contextParts.push(`Email: ${parsed.email}`);
        }

        if (parsed.phone) {
            contextParts.push(`Phone: ${parsed.phone}`);
        }

        if (parsed.skills && parsed.skills.length > 0) {
            contextParts.push(`Skills: ${parsed.skills.join(', ')}`);
        }

        if (parsed.education && parsed.education.length > 0) {
            contextParts.push(`Education: ${parsed.education.join('. ')}`);
        }

        if (parsed.jobs && parsed.jobs.length > 0) {
            contextParts.push(`Work Experience: ${parsed.jobs.join('. ')}`);
        }

        // Add raw text as additional context if available
        if (parsed.raw) {
            // Limit raw text to avoid context overflow (DistilBERT has input limits)
            const rawText = parsed.raw.length > 1000
                ? parsed.raw.substring(0, 1000) + '...'
                : parsed.raw;
            contextParts.push(`Additional Information: ${rawText}`);
        }

        return contextParts.join('. ');
    },

    generateRuleBasedAnswer(parsed, question) {
        const questionLower = question.toLowerCase();

        // Name questions - improved pattern matching
        if (questionLower.includes('name') || questionLower.includes('who are') || questionLower.includes('who am i')) {
            if (parsed.name && parsed.name.trim()) {
                return {
                    text: `Your name is ${parsed.name.trim()}`,
                    confidence: 0.9,
                    source: 'rule-based'
                };
            }

            // Try to extract name from raw text if not parsed properly
            const rawText = parsed.raw || '';
            const namePatterns = [
                // Look for name at the beginning of the document
                /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/m,
                // Look for patterns like "Name: John Doe"
                /(?:Name|Full Name):\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
                // Look for email patterns to extract name
                /([a-zA-Z]+)(?:\.[a-zA-Z]+)?@/
            ];

            for (const pattern of namePatterns) {
                const match = rawText.match(pattern);
                if (match && match[1] && match[1].length > 3) {
                    const extractedName = match[1].trim();
                    // Validate it looks like a name (contains at least 2 words, mostly letters)
                    if (extractedName.split(' ').length >= 2 && /^[A-Za-z\s]+$/.test(extractedName)) {
                        return {
                            text: `Your name is ${extractedName}`,
                            confidence: 0.8,
                            source: 'rule-based'
                        };
                    }
                }
            }

            return {
                text: "I couldn't identify your name clearly from the resume. It might be helpful if the name is prominently displayed at the top of the document.",
                confidence: 0.3,
                source: 'rule-based'
            };
        }

        // Last position/job questions
        if (questionLower.includes('last position') || questionLower.includes('recent job') || questionLower.includes('current job') || questionLower.includes('latest job')) {
            if (parsed.jobs && parsed.jobs.length > 0) {
                const recentJob = parsed.jobs[0];
                return {
                    text: `Your most recent position: ${recentJob}`,
                    confidence: 0.9,
                    source: 'rule-based'
                };
            }
            return {
                text: "I couldn't find information about your recent positions in your resume.",
                confidence: 0.3,
                source: 'rule-based'
            };
        }

        // Skills questions
        if (questionLower.includes('skill') || questionLower.includes('technology') || questionLower.includes('programming') || questionLower.includes('technical')) {
            if (parsed.skills && parsed.skills.length > 0) {
                const skillsList = parsed.skills.join(', ');
                return {
                    text: `Your technical skills include: ${skillsList}`,
                    confidence: 0.9,
                    source: 'rule-based'
                };
            }
            return {
                text: "I couldn't find a skills section in your resume.",
                confidence: 0.3,
                source: 'rule-based'
            };
        }

        // Contact information
        if (questionLower.includes('email') || questionLower.includes('contact') || questionLower.includes('phone')) {
            const contact = [];
            if (parsed.email) contact.push(`Email: ${parsed.email}`);
            if (parsed.phone) contact.push(`Phone: ${parsed.phone}`);

            if (contact.length > 0) {
                return {
                    text: `Your contact information: ${contact.join(', ')}`,
                    confidence: 0.9,
                    source: 'rule-based'
                };
            }
            return {
                text: "I couldn't find contact information in your resume.",
                confidence: 0.3,
                source: 'rule-based'
            };
        }

        // Education questions
        if (questionLower.includes('education') || questionLower.includes('degree') || questionLower.includes('university') || questionLower.includes('college') || questionLower.includes('study') || questionLower.includes('school')) {
            if (parsed.education && parsed.education.length > 0) {
                const educationInfo = parsed.education.join(', ');
                return {
                    text: `Your education: ${educationInfo}`,
                    confidence: 0.8,
                    source: 'rule-based'
                };
            }
            return {
                text: "I couldn't find education information in your resume.",
                confidence: 0.3,
                source: 'rule-based'
            };
        }

        // Experience questions
        if (questionLower.includes('experience') || questionLower.includes('work') || questionLower.includes('job') || questionLower.includes('project') || questionLower.includes('position')) {
            if (parsed.jobs && parsed.jobs.length > 0) {
                const jobCount = parsed.jobs.length;
                const jobsList = parsed.jobs.slice(0, 3).join('\n\n');
                return {
                    text: `You have ${jobCount} work experience${jobCount > 1 ? 's' : ''} listed. Here are your positions:\n\n${jobsList}${jobCount > 3 ? '\n\n...and more' : ''}`,
                    confidence: 0.8,
                    source: 'rule-based'
                };
            }
            return {
                text: "I couldn't find work experience in your resume.",
                confidence: 0.3,
                source: 'rule-based'
            };
        }

        // Fallback: search in raw text with better filtering
        if (parsed.raw) {
            const questionWords = question.split(' ').filter(word => word.length > 3);
            const relevantSnippets = [];

            for (const word of questionWords) {
                // Look for sentences containing the word, not just any surrounding text
                const regex = new RegExp(`[^.!?]*\\b${word}\\b[^.!?]*[.!?]`, 'gi');
                const matches = parsed.raw.match(regex);
                if (matches) {
                    // Filter out very long matches and clean them up
                    const cleanMatches = matches
                        .filter(match => match.length < 200 && match.length > 10)
                        .map(match => match.trim())
                        .slice(0, 2);
                    relevantSnippets.push(...cleanMatches);
                }
            }

            if (relevantSnippets.length > 0) {
                // Remove duplicates and limit response length
                const uniqueSnippets = [...new Set(relevantSnippets)].slice(0, 2);
                const response = uniqueSnippets.join(' ');

                // Ensure response isn't too long
                const maxLength = 300;
                const finalResponse = response.length > maxLength
                    ? response.substring(0, maxLength) + '...'
                    : response;

                return {
                    text: `Based on your resume: ${finalResponse}`,
                    confidence: 0.6,
                    source: 'rule-based'
                };
            }
        }

        return {
            text: "I couldn't find specific information to answer your question. Could you try asking about:\n• Your skills or technical abilities\n• Work experience or projects\n• Education background\n• Contact information\n• Your name or personal details",
            confidence: 0.2,
            source: 'rule-based'
        };
    }
};