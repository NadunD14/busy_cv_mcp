export const parseHandler = {
    parseResumeText(text) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        // Extract email
        const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0] || null;

        // Extract phone
        const phone = (text.match(/(\+?\d[\d .()-]{7,}\d)/) || [])[0] || null;

        // Extract name (usually first line or line after header)
        const name = lines.find(line =>
            line.length > 2 &&
            line.length < 50 &&
            !line.includes('@') &&
            !line.match(/\d{4}/) &&
            line.split(' ').length >= 2
        ) || lines[0] || null;

        // Extract skills
        const skillsPattern = /(?:skills?|technologies?|technical skills?|programming languages?)[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/i;
        const skillsMatch = text.match(skillsPattern);
        const skills = skillsMatch
            ? skillsMatch[1].split(/[,•\n]/).map(s => s.trim()).filter(Boolean)
            : [];

        // Extract job experiences (blocks containing years)
        const jobs = [];
        const yearPattern = /\b(19|20)\d{2}\b/;
        const blocks = text.split(/\n\s*\n/);

        for (const block of blocks) {
            if (yearPattern.test(block) && block.length > 50) {
                jobs.push(block.trim());
            }
        }

        // Extract education
        const education = [];
        const educationPattern = /(?:education|degree|university|college|bachelor|master|phd)[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/i;
        const educationMatch = text.match(educationPattern);
        if (educationMatch) {
            education.push(educationMatch[1].trim());
        }

        // Extract certifications
        const certifications = [];
        const certPattern = /(?:certifications?|certificates?)[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/i;
        const certMatch = text.match(certPattern);
        if (certMatch) {
            certifications.push(certMatch[1].trim());
        }

        // Extract summary/objective
        const summaryPattern = /(?:summary|objective|profile)[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/i;
        const summaryMatch = text.match(summaryPattern);
        const summary = summaryMatch ? summaryMatch[1].trim() : null;

        return {
            name,
            email,
            phone,
            skills: skills.slice(0, 20), // Limit skills
            jobs: jobs.slice(0, 10), // Limit jobs
            education,
            certifications,
            summary,
            raw: text.slice(0, 4000), // Truncate for storage
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