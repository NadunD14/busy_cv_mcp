# MCP CV Assistant 🤖📄

A Model Context Protocol (MCP) server that provides AI-powered resume chat functionality and email notifications. Now with **OpenAI GPT integration** for enhanced chat responses!

## Features ✨

- **📄 Resume Chat**: Parse your CV/resume and chat about your experience
- **🤖 AI-Powered Responses**: Optional OpenAI GPT-3.5/GPT-4 for smarter, contextual answers
- **📧 Email Notifications**: Send professional emails with templates
- **🎨 Next.js Playground**: Modern web interface for easy interaction
- **🔒 Separate Services**: Frontend and backend properly separated for scalability
- **⚡ Real-time**: Instant resume parsing and responses

## Architecture 🏗️

### Frontend (Next.js) - Port 3000
- **API Proxy Layer**: Routes requests to backend server
- **Client-side Parsing**: PDF, DOCX, TXT file support
- **Real-time Chat**: With AI toggle for enhanced responses
- **Email Interface**: Professional templates and composition
- **Responsive Design**: Tailwind CSS with modern UI

### Backend (MCP Server) - Port 3001
- **Dual Mode Operation**:
  - HTTP Server: REST API endpoints for frontend
  - MCP Server: Model Context Protocol for AI clients
- **Smart Chat System**:
  - Rule-based responses (fast, always available)
  - OpenAI GPT integration (intelligent, contextual question answering)
- **Multi-provider Email**: SendGrid/MailerSend/Brevo/SMTP support
- **Resume Parsing**: Structured data extraction

### Service Integration 🔗
```
Frontend (3000) → API Proxy → Backend (3001) → External Services
                                     ↓
                               [OpenAI GPT] [Email APIs]
```

## Quick Start 🚀

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/mcp-cv-assistant.git
cd mcp-cv-assistant

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Configure your services:

#### Required: Email Provider (choose one)

**Option A: SendGrid (Recommended - 100 emails/day free)**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Complete sender authentication (verify your domain or single sender email)
3. Get your API key from Settings → API Keys
4. Update `.env`:
```env
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_email@domain.com
EMAIL_FROM_NAME=CV Assistant
```

📘 **Need help with SendGrid setup?** See the detailed [SendGrid Setup Guide](SENDGRID_SETUP.md)

**Option B: MailerSend (3,000 emails/month free)**
1. Sign up at [MailerSend](https://www.mailersend.com/)
2. Verify your domain or use their sandbox
3. Get your API key from Settings → API Tokens
4. Update `.env`:
```env
MAILERSEND_API_KEY=your_mailersend_api_key
EMAIL_FROM=your_verified_email@domain.com
EMAIL_FROM_NAME=CV Assistant
```

**Option C: Brevo (300 emails/day free)**
1. Sign up at [Brevo](https://www.brevo.com/)
2. Get your API key from Account → SMTP & API
3. Update `.env`:
```env
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_email@domain.com
EMAIL_FROM_NAME=CV Assistant
```

#### Optional: OpenAI GPT (Enhanced Chat)
1. Sign up at [OpenAI Platform](https://platform.openai.com/) - **$5 Free Credits**
2. Get your API key from [API Keys](https://platform.openai.com/api-keys)
3. Update `.env`:
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. Run Development Servers

```bash
# Terminal 1: Backend (MUST start first)
cd backend
npm run dev
# Backend runs on http://localhost:3001

# Terminal 2: Frontend
cd frontend  
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Test Connection

```bash
# Test backend directly
cd backend
node test-connection.js

# Test frontend-to-backend
curl http://localhost:3000/api/chat -X POST \
  -H "Content-Type: application/json" \
  -d '{"parsedJson":{"skills":["JavaScript"]},"question":"What skills do I have?"}'
```

Visit `http://localhost:3000` to use the application!

## Usage Guide 📖

### 1. Upload Your Resume
1. Visit `http://localhost:3000`
2. Drag & drop or click to upload your CV (PDF, DOCX, or TXT)
3. Wait for client-side parsing to complete
4. Review the extracted information displayed

### 2. Chat About Your Resume
**Two Response Modes:**

**📋 Rule-based (Default - Fast)**
- Instant responses using pattern matching
- Always available, no API key needed
- Good for basic questions

**🤖 AI-powered (Toggle ON for smarter responses)**
- Uses OpenAI GPT-3.5/GPT-4 for contextual question answering
- Requires `OPENAI_API_KEY` in environment
- Better for complex or nuanced questions

**Sample Questions:**
- "What role did I have at my last position?"
- "What are my key programming skills?"
- "Tell me about my education background"
- "How many years of experience do I have?"
- "What projects have I worked on?"

### 3. Send Professional Emails
1. Use built-in templates (introduction, follow-up, thank you)
2. Customize recipient, subject, and message
3. Click send (requires email service configuration)

### 4. Technical Flow
```
1. Upload Resume → Client-side parsing (frontend)
2. Ask Question → Frontend /api/chat → Backend chat API → Response
3. Send Email → Frontend /api/send-email → Backend email API → Email Service
```

## Connection Architecture 🔗

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│  External APIs  │
│   (Port 3000)   │     │   (Port 3001)   │     │                 │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • UI/UX         │     │ • REST API      │     │ • OpenAI GPT    │
│ • File parsing  │     │ • MCP Server    │     │ • SendGrid      │
│ • API proxy     │     │ • Business Logic│     │ • MailerSend    │
│                 │     │                 │     │ • Brevo         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**API Endpoints:**
- `POST /api/chat` - Chat about resume (with optional OpenAI GPT)
- `POST /api/send-email` - Send email notifications  
- `POST /api/parse` - Parse resume text (proxied to backend)
- `GET /health` - Backend health check

## Deployment 🌐

### Frontend (Vercel - Free)

1. Push your code to GitHub
2. Connect to [Vercel](https://vercel.com/)
3. Deploy with these settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Backend (Railway - Free Tier)

1. Connect to [Railway](https://railway.app/)
2. Deploy from GitHub
3. Add environment variables
4. Set start command: `npm start`

### Alternative: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or individual services
docker build -t mcp-frontend ./frontend
docker build -t mcp-backend ./backend
```

## API Reference 📚

### REST Endpoints

#### Parse Resume
```http
POST /api/parse
Content-Type: application/json

{
  "text": "resume text content..."
}
```

#### Chat with Resume
```http
POST /api/chat
Content-Type: application/json

{
  "parsedJson": { /* parsed resume object */ },
  "question": "What role did I have at my last position?"
}
```

#### Send Email
```http
POST /api/send-email
Content-Type: application/json
x-api-key: your_api_key

{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "Email content"
}
```

### MCP Tools

When running as an MCP server (`npm start -- --mcp`):

- `parse_resume`: Parse resume text into structured data
- `chat_about_resume`: Answer questions about parsed resume
- `send_email`: Send email notifications

## Configuration ⚙️

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SENDGRID_API_KEY` | SendGrid API key | One email provider |
| `MAILERSEND_API_KEY` | MailerSend API key | One email provider |
| `BREVO_API_KEY` | Brevo API key | One email provider |
| `EMAIL_FROM` | Verified sender email | Yes |
| `EMAIL_FROM_NAME` | Sender name | No |
| `API_KEY` | Security key for emails | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | No |

### Email Provider Setup

#### MailerSend Setup
1. Create account at [MailerSend](https://www.mailersend.com/)
2. Add and verify your domain
3. Create API token with "Email" permission
4. Set `EMAIL_FROM` to verified email address

#### Brevo Setup
1. Create account at [Brevo](https://www.brevo.com/)
2. Go to SMTP & API settings
3. Create API key
4. Verify sender email address

## File Structure 📁

```
mcp-cv-assistant/
├── frontend/                 # Next.js application
│   ├── components/          # React components
│   ├── lib/                # Utilities and helpers
│   ├── pages/              # Next.js pages and API routes
│   │   ├── api/           # API endpoints
│   │   └── index.js       # Main page
│   └── styles/            # CSS styles
├── backend/                # MCP server
│   ├── src/               # Source code
│   │   ├── routes/        # Route handlers
│   │   └── index.js       # Main server file
│   └── package.json       # Dependencies
├── docker-compose.yml     # Docker configuration
└── README.md             # This file
```

## Troubleshooting 🔧

### Common Issues

#### Resume Parsing Fails
- Ensure file is under 10MB
- Try PDF format for best results
- Check browser console for errors

#### Email Not Sending
- Verify email provider setup
- Check API key and sender email
- Ensure sender email is verified
- Check rate limits (MailerSend: 3k/month, Brevo: 300/day)

#### MCP Connection Issues
- Ensure stdio transport is properly configured
- Check MCP client compatibility
- Verify tool schemas are correct

### Debug Mode

Enable verbose logging:
```bash
DEBUG=mcp:* npm run dev
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Support 💬

- Create an issue for bug reports
- Check existing issues before posting
- Include environment details and error logs

## Roadmap 🗺️

- [ ] Enhanced resume parsing with AI
- [ ] Multiple file upload support
- [ ] Email templates management
- [ ] Analytics dashboard
- [ ] Integration with job boards
- [ ] Mobile app version

---

Built with ❤️ using Model Context Protocol, Next.js, and free-tier services.