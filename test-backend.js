// Quick test script to check backend connectivity
// Run with: node test-backend.js

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://busy-cv-mcp-production.up.railway.app'; // Most likely Railway public URL

function testEndpoint(url, path = '', method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const fullUrl = `${url}${path}`;
        const urlObj = new URL(fullUrl);
        const isHttps = urlObj.protocol === 'https:';
        const lib = isHttps ? https : http;

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Test Client'
            }
        };

        if (data && method === 'POST') {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = lib.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data && method === 'POST') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Try multiple Railway URL patterns
const POSSIBLE_URLS = [
    'https://busy-cv-mcp-production.up.railway.app',
    'https://busycvmcp-production.up.railway.app',
    'https://busy-cv-mcp.railway.app',
    'https://busycvmcp.railway.app',
    'https://web-busy-cv-mcp.up.railway.app'
];

async function testBackend() {
    console.log('🔍 Testing multiple Railway URL patterns...');

    for (const url of POSSIBLE_URLS) {
        console.log(`\n🔗 Testing: ${url}`);
        try {
            const healthResponse = await testEndpoint(url, '/health');
            console.log('Status:', healthResponse.status);
            if (healthResponse.status === 200) {
                console.log('✅ FOUND WORKING URL:', url);
                console.log('Response:', healthResponse.data);
                return url;
            } else {
                console.log('❌ Not working:', healthResponse.data);
            }
        } catch (error) {
            console.log('❌ Connection failed:', error.message);
        }
    }

    console.log('\n❌ None of the URLs worked. Please check your Railway deployment.');
    return null;
} testBackend();
