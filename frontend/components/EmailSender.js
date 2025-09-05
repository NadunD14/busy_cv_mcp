import React, { useState } from 'react';
import axios from 'axios';

const EmailSender = () => {
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        body: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Simple API key handling for demo
            const headers = {};
            const apiKey = process.env.NEXT_PUBLIC_API_KEY;
            if (apiKey) {
                headers['x-api-key'] = apiKey;
            }

            await axios.post('/api/send-email', formData, { headers });

            setMessage({
                type: 'success',
                text: 'Email sent successfully!'
            });

            // Reset form
            setFormData({ to: '', subject: '', body: '' });
        } catch (error) {
            console.error('Email send error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to send email'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const templates = [
        {
            name: 'Professional Introduction',
            subject: 'Introduction - [Your Name]',
            body: `Hello,

I hope this email finds you well. I wanted to introduce myself and express my interest in potential opportunities.

[Add your introduction here]

Best regards,
[Your Name]`
        },
        {
            name: 'Follow-up',
            subject: 'Following up on our conversation',
            body: `Hello,

Thank you for taking the time to speak with me yesterday. I wanted to follow up on our discussion about [topic].

[Add follow-up details here]

Looking forward to hearing from you.

Best regards,
[Your Name]`
        },
        {
            name: 'Thank You Note',
            subject: 'Thank you - [Meeting/Interview]',
            body: `Dear [Name],

Thank you for taking the time to meet with me today. I enjoyed our conversation about [topic/position].

[Add specific details from the meeting]

I look forward to the next steps in the process.

Best regards,
[Your Name]`
        }
    ];

    const useTemplate = (template) => {
        setFormData(prev => ({
            ...prev,
            subject: template.subject,
            body: template.body
        }));
    };

    return (
        <div className="space-y-4">
            {/* Email Templates */}
            <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Email templates:</h4>
                <div className="grid gap-2">
                    {templates.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => useTemplate(template)}
                            className="text-left text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                            disabled={isLoading}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                        To *
                    </label>
                    <input
                        type="email"
                        id="to"
                        name="to"
                        value={formData.to}
                        onChange={handleChange}
                        placeholder="recipient@example.com"
                        className="input-field"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Email subject"
                        className="input-field"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                    </label>
                    <textarea
                        id="body"
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        placeholder="Your message here..."
                        rows={6}
                        className="input-field resize-none"
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !formData.to || !formData.subject || !formData.body}
                    className="btn-primary w-full"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Sending...</span>
                        </div>
                    ) : (
                        'Send Email'
                    )}
                </button>
            </form>

            {/* Message Display */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span>{message.type === 'success' ? '✅' : '❌'}</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">{message.text}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => setMessage(null)}
                                className="opacity-75 hover:opacity-100"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">⚙️ SendGrid Email Service Setup:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                    <p>This application uses SendGrid for email delivery.</p>
                    <p><strong>Required configuration in backend .env:</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                        <li><code>SENDGRID_API_KEY</code> - Your SendGrid API key</li>
                        <li><code>EMAIL_FROM</code> - Your verified sender email address</li>
                        <li><code>EMAIL_FROM_NAME</code> - Display name for emails (optional)</li>
                    </ul>
                    <p className="mt-2">
                        <strong>Note:</strong> You must verify your sender email address in SendGrid dashboard before sending emails.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailSender;
