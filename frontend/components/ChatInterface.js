import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatInterface = ({ parsedResume }) => {
    const [messages, setMessages] = useState([
        {
            type: 'assistant',
            content: 'Hi! I\'ve analyzed your resume. Ask me anything about your experience, skills, education, or contact information!',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = {
            type: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/chat', {
                parsedJson: parsedResume,
                question: input,
                useAI: true // Always use AI (DistilBERT via Hugging Face)
            });

            const assistantMessage = {
                type: 'assistant',
                content: response.data.answer,
                confidence: response.data.confidence,
                source: response.data.source,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                type: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickQuestions = [
        "What role did I have at my last position?",
        "What are my key skills?",
        "What's my contact information?",
        "Tell me about my work experience",
        "What education do I have?"
    ];

    const handleQuickQuestion = (question) => {
        setInput(question);
    };

    return (
        <div className="space-y-4">
            {/* Quick Questions */}
            <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Quick questions:</h4>
                <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickQuestion(question)}
                            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                            disabled={isLoading}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-800 border'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.confidence && (
                                <div className="mt-1 text-xs opacity-75 flex items-center justify-between">
                                    <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                                    {message.source && (
                                        <span className={`px-1 py-0.5 rounded text-xs ${message.source === 'distilbert'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {message.source === 'distilbert' ? '🤖 AI' : '📋 Rules'}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="text-xs opacity-75 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me about your resume..."
                        className="input-field flex-1"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="btn-primary px-6"
                    >
                        {isLoading ? '...' : 'Send'}
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    Powered by DistilBERT AI for intelligent question answering
                </p>
            </form>
        </div>
    );
};

export default ChatInterface;
