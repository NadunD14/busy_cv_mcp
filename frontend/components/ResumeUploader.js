import React, { useState, useCallback } from 'react';

const ResumeUploader = ({ onResumesParsed, isLoading, setIsLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = useCallback(async (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(pdf|docx|doc|txt)$/)) {
            setError('Please upload a PDF, DOCX, or TXT file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Dynamic import for client-side only
            const { extractTextFromFile, parseResumeText } = await import('../lib/resumeParser');

            const text = await extractTextFromFile(file);
            const parsed = parseResumeText(text);

            onResumesParsed(parsed);
        } catch (err) {
            console.error('Parse error:', err);
            setError(`Failed to parse resume: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [onResumesParsed, setIsLoading]); const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    const handleChange = useCallback((e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    return (
        <div className="space-y-4">
            {/* File Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleChange}
                    disabled={isLoading}
                />

                <div className="text-center">
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600">Parsing resume...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-4xl">📄</div>
                            <p className="text-gray-600">
                                Drop your resume here or click to upload
                            </p>
                            <p className="text-sm text-gray-500">
                                Supports PDF, DOCX, and TXT files (max 10MB)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-red-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips for best results:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use a well-formatted resume with clear sections</li>
                    <li>• Include dates, company names, and job titles</li>
                    <li>• List skills and technologies you've used</li>
                    <li>• PDF format usually works best</li>
                </ul>
            </div>
        </div>
    );
};

export default ResumeUploader;
