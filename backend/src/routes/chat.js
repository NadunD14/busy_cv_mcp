import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

export const chatHandler = {
    async generateAnswer(parsed, question, useAI = false) {
        // Validate inputs
        if (!parsed || typeof parsed !== 'object') {
            return {
                text: "I couldn't process the resume data. Please ensure a valid resume is uploaded.",
                confidence: 0.1,
                source: 'error'
            };
        }

        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return {
                text: "Please ask a specific question about the resume.",
                confidence: 0.1,
                source: 'error'
            };
        }

        // If OpenAI is available and requested, use GPT
        if (useAI && openai) {
            try {
                return await this.generateOpenAIAnswer(parsed, question);
            } catch (error) {
                console.log('OpenAI API error, falling back to rule-based:', error.message || error);
                // Fall back to rule-based system
            }
        }

        // Rule-based system (existing logic)
        return this.generateRuleBasedAnswer(parsed, question);
    },

    async generateOpenAIAnswer(parsed, question) {
        // Create a context from the parsed resume data
        const context = this.buildResumeContext(parsed);

        // Validate inputs
        if (!context || context.trim().length < 10) {
            console.log('OpenAI: Insufficient context, falling back to rule-based');
            return this.generateRuleBasedAnswer(parsed, question);
        }

        if (!question || question.trim().length < 3) {
            console.log('OpenAI: Invalid question, falling back to rule-based');
            return this.generateRuleBasedAnswer(parsed, question);
        }

        try {
            // Create a prompt for GPT
            const prompt = `Based on the following resume information, please answer the user's question accurately and concisely.

Resume Information:
${context}

User Question: ${question}

Please provide a direct, helpful answer based only on the information provided in the resume. If the information is not available in the resume, say so clearly.`;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo", // Using GPT-3.5-turbo (free tier available)
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that answers questions about resumes. Provide accurate, concise answers based only on the resume information provided. Be friendly and professional."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 150,
                temperature: 0.3, // Lower temperature for more consistent answers
                top_p: 0.9
            });

            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                const answer = response.choices[0].message.content.trim();

                // Validate the response
                if (!answer || answer.length < 5) {
                    console.log('OpenAI: Empty or too short response, falling back to rule-based');
                    return this.generateRuleBasedAnswer(parsed, question);
                }

                // Check if GPT said it doesn't have the information
                const noInfoPhrases = [
                    'not provided', 'not available', 'not mentioned', 'not specified',
                    'cannot find', 'unable to find', 'not included', 'not listed'
                ];

                const hasNoInfo = noInfoPhrases.some(phrase =>
                    answer.toLowerCase().includes(phrase)
                );

                if (hasNoInfo) {
                    console.log('OpenAI: GPT indicated missing information, falling back to rule-based');
                    return this.generateRuleBasedAnswer(parsed, question);
                }

                // Calculate confidence based on response characteristics
                let confidence = 0.8;

                // Higher confidence for specific, detailed answers
                if (answer.length > 50) confidence += 0.1;
                if (answer.includes(parsed.name || '')) confidence += 0.05;

                return {
                    text: answer,
                    confidence: Math.min(confidence, 0.95),
                    source: 'openai'
                };
            } else {
                console.log('OpenAI: Invalid response format, falling back to rule-based');
                return this.generateRuleBasedAnswer(parsed, question);
            }
        } catch (error) {
            // Handle specific error types more gracefully
            if (error.message && error.message.includes('API key')) {
                console.log('OpenAI: Invalid API key, falling back to rule-based');
            } else if (error.message && error.message.includes('quota')) {
                console.log('OpenAI: API quota exceeded, falling back to rule-based');
            } else if (error.message && error.message.includes('rate limit')) {
                console.log('OpenAI: Rate limit exceeded, falling back to rule-based');
            } else {
                console.log(`OpenAI: API error (${error.name || 'Unknown'}), falling back to rule-based`);
            }

            // Fall back to rule-based system
            return this.generateRuleBasedAnswer(parsed, question);
        }
    },

    buildResumeContext(parsed) {
        // Build a comprehensive context string for OpenAI
        const contextParts = [];

        // Add structured information with clear labels
        if (parsed.name && parsed.name.trim()) {
            contextParts.push(`Full Name: ${parsed.name.trim()}`);
        }

        if (parsed.email && parsed.email.trim()) {
            contextParts.push(`Email Address: ${parsed.email.trim()}`);
        }

        if (parsed.phone && parsed.phone.trim()) {
            contextParts.push(`Phone Number: ${parsed.phone.trim()}`);
        }

        if (parsed.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
            const skillsText = parsed.skills.filter(skill => skill && skill.trim()).join(', ');
            if (skillsText) {
                contextParts.push(`Technical Skills and Technologies: ${skillsText}`);
            }
        }

        if (parsed.education && Array.isArray(parsed.education) && parsed.education.length > 0) {
            const educationText = parsed.education.filter(edu => edu && edu.trim()).join('. ');
            if (educationText) {
                contextParts.push(`Educational Background: ${educationText}`);
            }
        }

        if (parsed.jobs && Array.isArray(parsed.jobs) && parsed.jobs.length > 0) {
            const jobsText = parsed.jobs.filter(job => job && job.trim()).join('. ');
            if (jobsText) {
                contextParts.push(`Work Experience and Projects: ${jobsText}`);
            }
        }

        // Add raw text as additional context if available
        if (parsed.raw && typeof parsed.raw === 'string' && parsed.raw.trim()) {
            // Clean up the raw text
            let rawText = parsed.raw.trim();

            // Remove excessive whitespace and newlines
            rawText = rawText.replace(/\s+/g, ' ');

            // OpenAI can handle larger contexts than DistilBERT
            const maxRawLength = 1500;
            if (rawText.length > maxRawLength) {
                rawText = rawText.substring(0, maxRawLength) + '...';
            }

            // Only add if it contains useful information
            if (rawText.length > 50) {
                contextParts.push(`Additional Resume Information: ${rawText}`);
            }
        }

        const finalContext = contextParts.join('\n');

        // Ensure context is not empty and has minimum useful content
        if (finalContext.length < 20) {
            console.log('Warning: Insufficient context for OpenAI');
            return null;
        }

        return finalContext;
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