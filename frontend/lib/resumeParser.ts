// Dynamic loading & safe parsing utilities to avoid build/runtime issues with pdfjs & mammoth
// We defer heavy library imports until actually needed and isolate failures.
let _pdf: any | null = null;
let _mammoth: any | null = null;

async function loadPdfLib() {
    if (_pdf) return _pdf;

    try {
        console.log('[resumeParser] Loading pdfjs-dist v3.11.174...');

        // Use the stable v3 import pattern
        const pdfjsModule: any = await import('pdfjs-dist');
        console.log('[resumeParser] Raw module:', typeof pdfjsModule, Object.keys(pdfjsModule || {}));

        _pdf = pdfjsModule;

        // Configure worker for v3.11.174
        if (typeof window !== 'undefined') {
            try {
                const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

                if (_pdf.GlobalWorkerOptions) {
                    _pdf.GlobalWorkerOptions.workerSrc = workerUrl;
                    console.log('[resumeParser] Worker configured with URL:', workerUrl);
                } else {
                    console.warn('[resumeParser] GlobalWorkerOptions not found on pdf module');
                }
            } catch (workerErr) {
                console.warn('[resumeParser] Worker setup failed (continuing anyway):', workerErr);
            }
        }

    } catch (importErr: any) {
        console.error('[resumeParser] Failed to import pdfjs-dist:', importErr);
        throw new Error(`Could not load pdf.js: ${importErr?.message || String(importErr)}`);
    }

    // Validate the loaded library
    if (!_pdf) {
        throw new Error('pdf.js library is null after import');
    }

    console.log('[resumeParser] Final _pdf object keys:', Object.keys(_pdf));
    console.log('[resumeParser] getDocument type:', typeof _pdf.getDocument);

    if (typeof _pdf.getDocument !== 'function') {
        console.error('[resumeParser] Available properties:', Object.getOwnPropertyNames(_pdf));
        throw new Error('pdf.js getDocument function not found');
    }

    console.log('[resumeParser] pdf.js v3.11.174 loaded successfully');
    return _pdf;
}

async function loadMammoth() {
    if (_mammoth) return _mammoth;
    try {
        _mammoth = await import('mammoth');
    } catch (e) {
        console.warn('[resumeParser] mammoth import failed – DOCX support disabled', e);
    }
    return _mammoth;
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
            console.log('[resumeParser] Starting PDF extraction for file:', file.name);
            const pdfjs = await loadPdfLib();
            if (!pdfjs || typeof pdfjs.getDocument !== 'function') {
                throw new Error('pdf.js not initialized correctly');
            }
            console.log('[resumeParser] pdf.js loaded successfully');

            const arrayBuffer = await file.arrayBuffer();
            console.log('[resumeParser] File buffer size:', arrayBuffer.byteLength);

            // Wrap getDocument for safety - v3 pattern
            let docPromise;
            try {
                console.log('[resumeParser] Calling getDocument...');
                const task = pdfjs.getDocument({ data: arrayBuffer });
                docPromise = task.promise; // v3 always returns task with promise property
                console.log('[resumeParser] Document task created, promise type:', typeof docPromise);
            } catch (inner) {
                console.error('[resumeParser] getDocument failed:', inner);
                const errorMsg = inner instanceof Error ? inner.message : String(inner);
                throw new Error(`pdf.js getDocument failed: ${errorMsg}`);
            }

            console.log('[resumeParser] Awaiting PDF document...');
            const pdf = await docPromise;
            console.log('[resumeParser] PDF loaded, pages:', pdf.numPages);

            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                console.log(`[resumeParser] Processing page ${i}/${pdf.numPages}`);
                const page = await pdf.getPage(i);
                const tc = await page.getTextContent();
                const pageText = tc.items.map((item: any) => (item && item.str) ? item.str : '').join(' ');
                text += pageText + '\n';
                console.log(`[resumeParser] Page ${i} extracted ${pageText.length} chars`);
            }

            if (!text.trim()) throw new Error('No extractable text found in PDF');
            console.log('[resumeParser] PDF extraction complete, total chars:', text.length);
            return text;
        }
        if (ext === 'docx' || ext === 'doc') {
            const mammothLib = await loadMammoth();
            if (!mammothLib) throw new Error('DOCX parser unavailable');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammothLib.extractRawText({ arrayBuffer });
            if (!result?.value) throw new Error('DOCX contained no text');
            return result.value;
        }
        // Plain text fallback
        return await file.text();
    } catch (error: any) {
        // Surface original error details for debugging
        console.error('[resumeParser] Extraction error', error);
        const base = error?.message || String(error);
        throw new Error(`Extraction failed (${ext || 'unknown'}): ${base}`);
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
        skills: skills.slice(0, 20),
        jobs: jobs.slice(0, 10),
        education,
        raw: text.slice(0, 4000)
    };
}
