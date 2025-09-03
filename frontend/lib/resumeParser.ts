import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker for different versions
if (typeof window !== 'undefined') {
    // Simple CDN-based worker setup that works across versions
    const version = pdfjsLib.version || '3.11.174';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
}

export interface ParsedResume {
    name: string | null;
    email: string | null;
    phone: string | null;
    skills: string[];
    jobs: string[];
    education: string[];
    raw: string;
}

export async function extractTextFromFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
        if (ext === 'pdf') {
            const arrayBuffer = await file.arrayBuffer();

            // Simple PDF.js API usage that works across versions
            const pdf = await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;

            let text = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
            }

            return text;
        } else if (ext === 'docx' || ext === 'doc') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } else {
            // Fallback for txt files
            return await file.text();
        }
    } catch (error) {
        console.error('Error extracting text from file:', error);
        throw new Error(`Failed to extract text from ${ext} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function parseResumeText(text: string): ParsedResume {
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
    const jobs: string[] = [];
    const yearPattern = /\b(19|20)\d{2}\b/;
    const blocks = text.split(/\n\s*\n/);

    for (const block of blocks) {
        if (yearPattern.test(block) && block.length > 50) {
            jobs.push(block.trim());
        }
    }

    // Extract education
    const education: string[] = [];
    const educationPattern = /(?:education|degree|university|college|bachelor|master|phd)[:\-]?\s*(.+?)(?:\n\n|\n[A-Z]|$)/i;
    const educationMatch = text.match(educationPattern);
    if (educationMatch) {
        education.push(educationMatch[1].trim());
    }

    return {
        name,
        email,
        phone,
        skills: skills.slice(0, 20), // Limit skills
        jobs: jobs.slice(0, 10), // Limit jobs
        education,
        raw: text.slice(0, 4000) // Truncate for storage
    };
}
