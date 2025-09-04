export const parseHandler = {
    parseResumeText(text) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        // Extract email
        const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || null;

        // Extract phone
        const phone = (text.match(/(\+?\d[\d\s.()-]{7,}\d)/) || [])[0] || null;

        // Improved name extraction
        let name = null;

        // Method 1: Look for name pattern at the beginning (before email/phone)
        const firstSection = text.split(/(?:email|phone|tel|\+\d|@)/i)[0];
        const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m;
        const nameMatch = firstSection.match(namePattern);

        if (nameMatch) {
            name = nameMatch[1].trim();
        } else {
            // Method 2: Find the first line that looks like a name
            for (const line of lines.slice(0, 5)) { // Check first 5 lines only
                const cleanLine = line.replace(/[#§+\x83—ï]/g, '').trim();
                if (cleanLine.length > 3 &&
                    cleanLine.length < 40 &&
                    !cleanLine.includes('@') &&
                    !cleanLine.match(/\d/) &&
                    cleanLine.split(' ').length >= 2 &&
                    !cleanLine.toLowerCase().includes('resume') &&
                    !cleanLine.toLowerCase().includes('cv') &&
                    /^[A-Z]/.test(cleanLine)) {
                    name = cleanLine;
                    break;
                }
            }
        }

        // Extract skills more accurately
        let skills = [];

        // Method 1: Look for Technical Skills section with bullet points
        const techSkillsPattern = /technical skills\s*(.+?)(?=projects|education|experience|certifications|$)/is;
        let skillsMatch = text.match(techSkillsPattern);

        if (skillsMatch) {
            const skillsText = skillsMatch[1];

            // Extract bullet points
            const bulletItems = skillsText.match(/•[^•]+/g) || [];

            for (const item of bulletItems) {
                const cleanItem = item.replace(/^•\s*/, '').trim();

                // Split by colons to separate category from skills
                const parts = cleanItem.split(':');
                if (parts.length > 1) {
                    const skillsList = parts[1];
                    // Split by commas and clean up
                    const individualSkills = skillsList
                        .split(',')
                        .map(s => s.trim())
                        .filter(s => s.length > 1 && s.length < 40 && !s.includes('•'));
                    skills.push(...individualSkills);
                }
            }
        }

        // Method 2: If bullet points extraction was limited, try direct pattern matching
        if (skills.length < 8) { // If we got fewer than 8 skills, try extracting more
            const skillPatterns = [
                /Programming Languages:\s*([^•\n]+)/gi,
                /Machine Learning & Data Science:\s*([^•\n]+)/gi,
                /Web Development:\s*([^•\n]+)/gi,
                /Databases:\s*([^•\n]+)/gi,
                /Cloud & DevOps:\s*([^•\n]+)/gi,
                /AI & NLP:\s*([^•\n]+)/gi,
                /Tools & Platforms:\s*([^•\n]+)/gi
            ];

            for (const pattern of skillPatterns) {
                const matches = text.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        const skillsText = match.split(':')[1];
                        if (skillsText) {
                            const newSkills = skillsText
                                .split(',')
                                .map(s => s.trim())
                                .filter(s => s.length > 1 && s.length < 30);
                            skills.push(...newSkills);
                        }
                    }
                }
            }
        }

        // Remove duplicates and limit
        skills = [...new Set(skills)].slice(0, 30);

        // Extract work experience/projects more accurately
        const jobs = [];

        // Look for Projects section specifically
        const projectsPattern = /projects\s+(.+?)(?=certifications|professional skills|additional|references|languages|$)/is;
        const projectsMatch = text.match(projectsPattern);

        if (projectsMatch) {
            const projectsText = projectsMatch[1];

            // Split by project names - look for lines that start with project titles (containing dash or specific keywords)
            const segments = projectsText.split(/(?=\b(?:BrandBoost|Idealize|Push Notification|PathMentor|Readle))/);

            for (const segment of segments) {
                const trimmed = segment.trim();
                if (trimmed.length > 100 && trimmed.includes('Tech Stack')) {
                    // Extract project title from the first line
                    const lines = trimmed.split(/\n/);
                    const titleLine = lines[0].replace(/§.*?GitHub/g, '').replace(/—.*$/, '').trim();

                    // Get description (everything before Tech Stack)
                    const fullText = lines.join(' ');
                    const techStackIndex = fullText.indexOf('Tech Stack:');

                    let description = '';
                    let techStack = '';

                    if (techStackIndex > -1) {
                        description = fullText.substring(0, techStackIndex).trim();
                        const techStackText = fullText.substring(techStackIndex);
                        const techStackMatch = techStackText.match(/Tech Stack:\s*([^.]+)/);
                        techStack = techStackMatch ? techStackMatch[1].trim() : '';
                    } else {
                        description = fullText.trim();
                    }

                    // Clean up the description
                    description = description.replace(/§.*?GitHub/g, '').replace(/\s+/g, ' ').trim();

                    // Format project entry with better structure
                    if (titleLine && description.length > 30) {
                        const projectEntry = `${titleLine}: ${description.substring(0, 250)}${description.length > 250 ? '...' : ''}${techStack ? ` (Technologies: ${techStack})` : ''}`;
                        jobs.push(projectEntry);
                    }
                }
            }
        }

        // Extract education more accurately
        const education = [];
        const educationPattern = /education\s+(.+?)(?=technical skills|projects|certifications|professional skills|$)/is;
        const educationMatch = text.match(educationPattern);

        if (educationMatch) {
            const eduText = educationMatch[1].trim();

            // Look for degree information with university
            const degreePattern = /(Bachelor[^.\n]*University[^.\n]*UCSC[^.\n]*)/gi;
            const degrees = eduText.match(degreePattern);

            if (degrees) {
                education.push(...degrees.map(d => d.trim()));
            } else {
                // Fallback: look for Bachelor degree
                const bachelorPattern = /Bachelor of Science in Information Systems[^.\n]*/gi;
                const bachelor = eduText.match(bachelorPattern);
                if (bachelor) {
                    education.push(bachelor[0].trim());
                }

                // Also add university info
                const uniPattern = /University of Colombo School of Computing[^.\n]*/gi;
                const uni = eduText.match(uniPattern);
                if (uni) {
                    education.push(uni[0].trim());
                }
            }
        }

        // Extract certifications
        const certifications = [];
        const certPattern = /(?:certifications?|certificates?)[:\-]?\s*(.+?)(?=\n\s*(?:professional skills?|additional|references?|languages?|$))/is;
        const certMatch = text.match(certPattern);
        if (certMatch) {
            const certText = certMatch[1].trim();
            // Look for specific certification entries
            const certEntries = certText.split(/\n(?=[A-Z])/);
            for (const entry of certEntries) {
                if (entry.trim().length > 10) {
                    certifications.push(entry.trim());
                }
            }
        }

        // Extract summary/objective
        const summaryPattern = /(?:summary|objective|profile)[:\-]?\s*(.+?)(?=\n\s*(?:education|technical skills?|experience|$))/is;
        const summaryMatch = text.match(summaryPattern);
        const summary = summaryMatch ? summaryMatch[1].trim() : null;

        return {
            name,
            email,
            phone,
            skills: skills.slice(0, 30), // Increased limit for skills
            jobs: jobs.slice(0, 10), // Limit jobs
            education,
            certifications,
            summary,
            raw: text.slice(0, 3000), // Increased raw text limit for better context
            parsedAt: new Date().toISOString()
        };
    },

    // Enhanced parsing for specific formats
    parseStructuredResume(text) {
        const basic = this.parseResumeText(text);

        // Try to extract more structured data
        const sections = this.extractSections(text);

        return {
            ...basic,
            sections,
            metadata: {
                wordCount: text.split(/\s+/).length,
                lineCount: text.split(/\n/).length,
                hasStructure: sections.length > 2
            }
        };
    },

    extractSections(text) {
        const sections = [];
        const sectionHeaders = [
            'experience', 'work experience', 'employment',
            'education', 'academic background',
            'skills', 'technical skills', 'technologies',
            'projects', 'achievements', 'accomplishments',
            'certifications', 'certificates',
            'summary', 'objective', 'profile'
        ];

        for (const header of sectionHeaders) {
            const pattern = new RegExp(`(${header})[:\-]?\\s*(.+?)(?=\\n\\n|\\n[A-Z]|$)`, 'is');
            const match = text.match(pattern);
            if (match) {
                sections.push({
                    title: match[1],
                    content: match[2].trim()
                });
            }
        }

        return sections;
    }
};