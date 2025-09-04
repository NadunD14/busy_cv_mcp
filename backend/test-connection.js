#!/usr/bin/env node


import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

import { parseHandler } from './src/routes/parse.js';

const BACKEND_URL = 'http://localhost:3001';

async function testBackendConnection() {
    console.log('🔄 Testing Backend Connection...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Health check:', healthResponse.data);

        // Test resume parsing
        console.log('\n2. Testing resume parsing...');
        const sampleResume = `
John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

Skills: JavaScript, Python, React, Node.js

Experience:
- Senior Developer at TechCorp (2020-2023)
- Junior Developer at StartupInc (2018-2020)

Education:
- BS Computer Science, University of Tech (2018)
        `;

        const parseResponse = await axios.post(`${BACKEND_URL}/api/parse`, {
            text: sampleResume
        });
        console.log('✅ Parse result:', JSON.stringify(parseResponse.data, null, 2));

        // Test chat
        console.log('\n3. Testing chat (rule-based)...');
        const chatResponse = await axios.post(`${BACKEND_URL}/api/chat`, {
            parsedJson: parseResponse.data,
            question: "What skills do I have?",
            useGroq: false
        });
        console.log('✅ Chat response:', chatResponse.data);

        // Test chat with Groq (if available)
        if (process.env.GROQ_API_KEY) {
            console.log('\n4. Testing chat (Groq AI)...');
            const groqChatResponse = await axios.post(`${BACKEND_URL}/api/chat`, {
                parsedJson: parseResponse.data,
                question: "What skills do I have?",
                useGroq: true
            });
            console.log('✅ Groq AI response:', groqChatResponse.data);
        } else {
            console.log('\n4. ⚠️ Skipping Groq AI test (GROQ_API_KEY not set)');
        }

        console.log('\n🎉 All backend tests passed!');

    } catch (error) {
        console.error('❌ Backend test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        process.exit(1);
    }
}

async function testFrontendToBackend() {
    console.log('\n🔄 Testing Frontend-to-Backend Connection...\n');

    try {
        // These would normally be frontend API endpoints
        // For now, we can test them directly if the frontend is running
        console.log('ℹ️ To test frontend-to-backend connection:');
        console.log('1. Start frontend: cd frontend && npm run dev');
        console.log('2. Test: curl http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d \'{"parsedJson":{"skills":["JavaScript"]},"question":"What skills do I have?"}\'');
        console.log('3. Check browser network tab for API calls');

    } catch (error) {
        console.error('❌ Frontend test failed:', error.message);
    }
}

// Run tests
async function main() {
    console.log('🧪 CV MCP Server Connection Tests\n');
    console.log('Make sure backend is running: npm run dev\n');

    await testBackendConnection();
    await testFrontendToBackend();
}

main().catch(console.error);
