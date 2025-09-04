import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Hugging Face client
const hf = process.env.HUGGINGFACE_API_TOKEN ? new HfInference(process.env.HUGGINGFACE_API_TOKEN) : null;

export const chatHandler = {
    async generateAnswer(parsed, question, useAI = true) {
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
        // Create a question-specific context from the parsed resume data
        const context = this.buildQuestionSpecificContext(parsed, question);

        try {
            // Use DistilBERT for question answering
            const response = await hf.questionAnswering({
                model: 'bert-large-uncased-whole-word-masking-finetuned-squad',
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

                // Enhanced answer validation and formatting
                const questionLower = question.toLowerCase();

                // if (questionLower.includes('name')) {
                //     // For name questions, validate the answer looks like a real name
                //     if (this.isValidName(answer, parsed)) {
                //         answer = this.formatName(answer);
                //         answer = `Your name is ${answer}`;
                //     } else {
                //         // If extracted answer doesn't look like a name, use structured data
                //         console.log('DistilBERT extracted invalid name, using structured data');
                //         return this.generateRuleBasedAnswer(parsed, question);
                //     }
                // } else if (questionLower.includes('skill') || questionLower.includes('technology') || questionLower.includes('programming')) {
                //     // For skills questions, ensure we get a comprehensive answer
                //     if (answer.length < 10 || !answer.includes(',')) {
                //         // If the answer is too short or doesn't contain multiple skills, use rule-based
                //         console.log('DistilBERT skills answer too brief, using rule-based');
                //         return this.generateRuleBasedAnswer(parsed, question);
                //     }
                // } else if (questionLower.includes('education') || questionLower.includes('degree') || questionLower.includes('university')) {
                //     // For education questions, format properly
                //     if (answer.length > 5) {
                //         answer = `Your education: ${answer}`;
                //     }
                // } else if (questionLower.includes('experience') || questionLower.includes('work') || questionLower.includes('job')) {
                //     // For experience questions, ensure comprehensive answer
                //     if (answer.length < 20) {
                //         console.log('DistilBERT experience answer too brief, using rule-based');
                //         return this.generateRuleBasedAnswer(parsed, question);
                //     }
                // }

                // Only return AI answer if confidence is reasonable
                if (confidence > 0) {
                    return {
                        text: answer,
                        confidence: Math.min(confidence, 0.95),
                        source: 'distilbert'
                    };
                } else {
                    // Low confidence, fall back to rule-based
                    console.log('Low confidence DistilBERT answer, falling back to rule-based');
                    return this.generateRuleBasedAnswer(parsed, question);
                }
            } else {
                // If DistilBERT can't find a good answer, fall back to rule-based
                console.log('DistilBERT returned no answer, falling back to rule-based');
                return this.generateRuleBasedAnswer(parsed, question);
            }
        } catch (error) {
            console.error('DistilBERT API error:', error);
            // Fall back to rule-based system
            return this.generateRuleBasedAnswer(parsed, question);
        }
    },

    buildQuestionSpecificContext(parsed, question) {
        const questionLower = question.toLowerCase();
        const contextParts = [];

        // For name questions, prioritize name information
        if (questionLower.includes('name') || questionLower.includes('who are')) {
            if (parsed.name) {
                contextParts.push(`The person's name is ${parsed.name}.`);
            }
            if (parsed.email) {
                contextParts.push(`Email address: ${parsed.email}.`);
            }
            // Don't include raw text for name questions to avoid confusion
            return contextParts.join(' ');
        }

        // For skills questions
        if (questionLower.includes('skill') || questionLower.includes('technology') || questionLower.includes('programming')) {
            if (parsed.skills && parsed.skills.length > 0) {
                contextParts.push(`The person has the following technical skills and technologies: ${parsed.skills.join(', ')}.`);
                contextParts.push(`Programming languages and frameworks include: ${parsed.skills.join(', ')}.`);
            }
            // Return focused context for skills questions
            return contextParts.join(' ');
        }

        // For education questions
        if (questionLower.includes('education') || questionLower.includes('degree') || questionLower.includes('university') || questionLower.includes('study')) {
            if (parsed.education && parsed.education.length > 0) {
                contextParts.push(`Education: ${parsed.education.join('. ')}.`);
            }
        }

        // For work experience questions
        if (questionLower.includes('experience') || questionLower.includes('work') || questionLower.includes('job') || questionLower.includes('position') || questionLower.includes('project')) {
            if (parsed.jobs && parsed.jobs.length > 0) {
                contextParts.push(`Work experience and projects: ${parsed.jobs.join('. ')}.`);
            }
        }

        // For contact questions
        if (questionLower.includes('contact') || questionLower.includes('email') || questionLower.includes('phone')) {
            if (parsed.email) {
                contextParts.push(`Email: ${parsed.email}.`);
            }
            if (parsed.phone) {
                contextParts.push(`Phone: ${parsed.phone}.`);
            }
        }

        // If no specific context built, use general structured data
        if (contextParts.length === 0) {
            if (parsed.name) {
                contextParts.push(`Name: ${parsed.name}.`);
            }
            if (parsed.email) {
                contextParts.push(`Email: ${parsed.email}.`);
            }
            if (parsed.phone) {
                contextParts.push(`Phone: ${parsed.phone}.`);
            }
            if (parsed.skills && parsed.skills.length > 0) {
                contextParts.push(`Skills: ${parsed.skills.slice(0, 10).join(', ')}.`);
            }
            if (parsed.education && parsed.education.length > 0) {
                contextParts.push(`Education: ${parsed.education.join('. ')}.`);
            }
            if (parsed.jobs && parsed.jobs.length > 0) {
                contextParts.push(`Work experience and projects: ${parsed.jobs.slice(0, 5).join('. ')}.`);
            }
        }

        return contextParts.join(' ');
    },

    isValidName(answer, parsed) {
        // Check if the answer looks like a valid name
        const cleanAnswer = answer.trim();

        // Should be 2-50 characters
        if (cleanAnswer.length < 2 || cleanAnswer.length > 50) {
            return false;
        }

        // Should contain mostly letters and spaces
        if (!/^[A-Za-z\s\-\.]+$/.test(cleanAnswer)) {
            return false;
        }

        // Should not be technical terms commonly found in resumes
        const technicalTerms = ['python', 'javascript', 'react', 'nodejs', 'tensorflow', 'keras', 'pandas', 'numpy', 'mongodb', 'mysql', 'docker', 'aws', 'git', 'github'];
        if (technicalTerms.includes(cleanAnswer.toLowerCase())) {
            return false;
        }

        // If we have a structured name and it's very different, prefer structured
        if (parsed.name && parsed.name.toLowerCase() !== cleanAnswer.toLowerCase()) {
            const similarity = this.calculateSimilarity(parsed.name.toLowerCase(), cleanAnswer.toLowerCase());
            if (similarity < 0.3) {
                return false;
            }
        }

        return true;
    },

    formatName(name) {
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    },

    calculateSimilarity(str1, str2) {
        // Simple similarity calculation
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    },

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
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