import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';

// Dynamic imports to avoid SSR issues with better error handling
const ResumeUploader = dynamic(() => import('../components/ResumeUploader'), {
    loading: () => <div className="animate-pulse">Loading uploader...</div>,
    ssr: false
});

const ChatInterface = dynamic(() => import('../components/ChatInterface'), {
    loading: () => <div className="animate-pulse">Loading chat...</div>,
    ssr: false
});

const EmailSender = dynamic(() => import('../components/EmailSender'), {
    loading: () => <div className="animate-pulse">Loading email sender...</div>,
    ssr: false
});

export default function Home() {
    const [parsedResume, setParsedResume] = useState(null);
    const [isLoading, setIsLoading] = useState(false); return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>MCP CV Assistant</title>
                <meta name="description" content="AI-powered resume chat and email assistant" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        MCP CV Assistant
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Upload your resume, chat about your experience, and send professional emails
                    </p>
                </header>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Resume Upload Section */}
                    <div className="card">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            📄 Upload Resume
                        </h2>
                        <ErrorBoundary>
                            <ResumeUploader
                                onResumesParsed={setParsedResume}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                            />
                        </ErrorBoundary>
                    </div>

                    {/* Email Sender Section */}
                    <div className="card">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            📧 Send Email
                        </h2>
                        <ErrorBoundary>
                            <EmailSender />
                        </ErrorBoundary>
                    </div>
                </div>

                {/* Chat Section - Full Width */}
                {parsedResume && (
                    <div className="card mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            💬 Chat About Your Resume
                        </h2>
                        <ErrorBoundary>
                            <ChatInterface parsedResume={parsedResume} />
                        </ErrorBoundary>
                    </div>
                )}

                {/* Resume Preview */}
                {parsedResume && (
                    <div className="card mt-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            👀 Parsed Resume Preview
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="font-semibold text-gray-700">Basic Info</h3>
                                    <p><strong>Name:</strong> {parsedResume.name || 'Not found'}</p>
                                    <p><strong>Email:</strong> {parsedResume.email || 'Not found'}</p>
                                    <p><strong>Phone:</strong> {parsedResume.phone || 'Not found'}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Skills</h3>
                                    <p className="text-sm">
                                        {parsedResume.skills?.length > 0
                                            ? parsedResume.skills.join(', ')
                                            : 'No skills found'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-700">Experience ({parsedResume.jobs?.length || 0} positions)</h3>
                                <div className="max-h-40 overflow-y-auto text-sm text-gray-600">
                                    {parsedResume.jobs?.length > 0
                                        ? parsedResume.jobs.slice(0, 2).map((job, index) => (
                                            <div key={index} className="mb-2 p-2 bg-white rounded">
                                                {job.substring(0, 200)}...
                                            </div>
                                        ))
                                        : 'No experience found'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}