# MCP CV Assistant 🤖📄

A Model Context Protocol (MCP) server that provides AI-powered resume chat functionality and email notifications, built entirely on free tiers.

## Features ✨

- **📄 Resume Chat**: Parse your CV/resume and chat about your experience
- **📧 Email Notifications**: Send professional emails with templates
- **🎨 Next.js Playground**: Modern web interface for easy interaction
- **🔒 Free Deployment**: Designed to work with free tiers only
- **⚡ Real-time**: Instant resume parsing and responses

## Architecture 🏗️

### Frontend (Next.js)
- Client-side resume parsing (PDF, DOCX, TXT)
- Real-time chat interface
- Email composition with templates
- Responsive design with Tailwind CSS

### Backend (MCP Server)
- Model Context Protocol implementation
- Rule-based CV question answering
- Multi-provider email sending (MailerSend/Brevo/SMTP)
- RESTful API endpoints

### Free Services Used 💰
- **Hosting**: Vercel (Frontend) / Railway (Backend)
- **Email**: MailerSend (3,000/month) or Brevo (300/day)
- **Database**: Supabase (optional, 500MB free)
- **Parsing**: Client-side libraries (pdfjs-dist, mammoth)

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

Configure your email provider (choose one):

#### Option A: MailerSend (3,000 emails/month free)
1. Sign up at [MailerSend](https://www.mailersend.com/)
2. Verify your domain or use their sandbox
3. Get your API key
4. Update `.env`:
```env
MAILERSEND_API_KEY=your_mailersend_api_key
EMAIL_FROM=your_verified_email@domain.com
```

#### Option B: Brevo (300 emails/day free)
1. Sign up at [Brevo](https://www.brevo.com/)
2. Get your API key
3. Update `.env`:
```env
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_email@domain.com
```

### 3. Run Development Servers

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

Visit `http://localhost:3000` to use the application!

## Usage Guide 📖

### Uploading a Resume
1. Drag & drop or click to upload your CV (PDF, DOCX, or TXT)
2. Wait for parsing to complete
3. Review the extracted information

### Chatting About Your Resume
Ask questions like:
- "What role did I have at my last position?"
- "What are my key skills?"
- "Tell me about my work experience"
- "What's my contact information?"

### Sending Emails
1. Choose a template or write custom content
2. Fill in recipient, subject, and message
3. Click send (requires email service setup)

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