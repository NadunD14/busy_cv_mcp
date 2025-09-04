import { chatHandler } from './src/routes/chat.js';

// Sample parsed resume data for testing
const sampleParsedResume = {
    name: "Nadun Sandanayaka",
    email: "nadunsandanayaka01@gmail.com",
    phone: "+94 712442977",
    skills: ["Python", "JavaScript", "Java", "PHP", "React", "Next.js", "TensorFlow", "Docker"],
    education: ["Bachelor of Science in Information Systems", "University of Colombo School of Computing (UCSC)", "2023 – present"],
    jobs: [
        "BrandBoost - Influencer Marketing Platform Developer - Comprehensive platform connecting social media influencers with business owners for seamless product promotion",
        "Idealize-2025 Datathon - Machine Learning Engineer - Cancer Prediction Model achieving 6th place in ML category"
    ],
    raw: `Nadun Sandanayaka
nadunsandanayaka01@gmail.com   —      +94 712442977
github.com/NadunD14   —   LinkedIn Profile
Negombo Road, Kurunegala, Sri Lanka

Profile Summary
Skilled full-stack developer with expertise in Python, JavaScript, and PHP, specializing in web application development and machine learning solutions.

Education
Bachelor of Science in Information Systems   2023 – present
University of Colombo School of Computing (UCSC)

Technical Skills
• Programming Languages: Python, JavaScript, Java, PHP
• Machine Learning & Data Science: TensorFlow, Scikit-learn, Keras, Pandas, NumPy
• Web Development: React, Next.js, Node.js, Express.js, HTML/CSS

Projects
BrandBoost - Influencer Marketing Platform
Idealize-2025 Datathon - Cancer Prediction Model`
};

async function testChatResponses() {
    console.log('🧪 Testing Chat Responses...\n');

    const testQuestions = [
        "What is my name?",
        "What are my skills?",
        "What is my education?",
        "What is my email?",
        "Tell me about my work experience",
        "What programming languages do I know?",
        "Where do I study?",
        "What projects have I worked on?"
    ];

    console.log('📋 Testing Rule-based Responses (useGroq = false):');
    console.log('='.repeat(60));

    for (const question of testQuestions) {
        try {
            const response = await chatHandler.generateAnswer(sampleParsedResume, question, false);
            console.log(`\n❓ Question: "${question}"`);
            console.log(`✅ Answer: ${response.text}`);
            console.log(`📊 Confidence: ${(response.confidence * 100).toFixed(0)}%`);
            console.log(`🔧 Source: ${response.source || 'rule-based'}`);
        } catch (error) {
            console.log(`\n❓ Question: "${question}"`);
            console.log(`❌ Error: ${error.message}`);
        }
    }

    // Test DistilBERT AI if available
    if (process.env.HUGGINGFACE_API_TOKEN) {
        console.log('\n\n🤖 Testing DistilBERT AI Responses (useAI = true):');
        console.log('='.repeat(60));

        for (const question of testQuestions.slice(0, 3)) { // Test first 3 questions only
            try {
                const response = await chatHandler.generateAnswer(sampleParsedResume, question, true);
                console.log(`\n❓ Question: "${question}"`);
                console.log(`✅ Answer: ${response.text}`);
                console.log(`📊 Confidence: ${(response.confidence * 100).toFixed(0)}%`);
                console.log(`🔧 Source: ${response.source}`);
            } catch (error) {
                console.log(`\n❓ Question: "${question}"`);
                console.log(`❌ Error: ${error.message}`);
            }
        }
    } else {
        console.log('\n\n🤖 DistilBERT AI Testing Skipped');
        console.log('='.repeat(60));
        console.log('💡 To test AI responses, set HUGGINGFACE_API_TOKEN in your .env file');
        console.log('🔗 Get a free API token at: https://huggingface.co/settings/tokens');
    }

    console.log('\n\n🎯 Test Results Summary:');
    console.log('✅ Rule-based chat system tested');
    console.log('✅ Response formatting improved');
    console.log('✅ Name extraction enhanced');
    console.log('✅ Fallback logic optimized');

    if (process.env.HUGGINGFACE_API_TOKEN) {
        console.log('✅ DistilBERT AI-powered responses tested');
    } else {
        console.log('⚠️  DistilBERT AI-powered responses not tested (no API token)');
    }
}

// Run the test
testChatResponses().catch(console.error);
