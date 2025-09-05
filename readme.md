# CV Assistant - Smart Resume Parser & Chat 🤖📄

A modern web application that provides AI-powered resume parsing, intelligent chat functionality, and email notifications. Built with **Next.js frontend** and **Express.js backend** with **Cohere Command integration** for enhanced conversations!

## Features ✨

- **📄 Smart Resume Parsing**: Upload and parse CV/resume files (PDF, DOCX, TXT)
- **🤖 AI-Powered Chat**: Chat about your resume with Cohere Command integration
- **📧 Email Notifications**: Send professional emails with SendGrid
- **🎨 Modern UI**: Clean Next.js interface with Tailwind CSS
- **⚡ Real-time**: Instant parsing and chat responses
- **📱 Responsive**: Works on desktop, tablet, and mobile

## Architecture 🏗️

### Frontend (Next.js) - Port 3000
- **Client-side Parsing**: PDF, DOCX, TXT file support using browser APIs
- **Resume Chat Interface**: Interactive chat about your CV content
- **Email Composition**: Professional email templates and sending
- **Modern UI**: Tailwind CSS with responsive design

### Backend (Express.js) - Port 5000
- **REST API**: Endpoints for chat and email functionality
- **AI Integration**: Cohere Command for intelligent resume discussions
- **Email Service**: SendGrid integration for professional emails
- **Resume Processing**: Advanced text analysis and structured data extraction

### Service Integration 🔗
```
Frontend (3000) → API Routes → Backend (5000) → External Services
                                      ↓
                               [Cohere Command] [SendGrid Email]
```

## Quick Start 🚀

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/cv-assistant.git
cd cv-assistant

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

Create environment files with your API keys:

**Backend Environment** (`backend/.env`):
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
EMAIL_FROM=your_verified_email@gmail.com
EMAIL_FROM_NAME=CV Assistant Bot
PORT=5000
```

> **🔒 Security Note**: Never commit real API keys to GitHub. Keep your actual `.env` files in `.gitignore`.

**Frontend Environment** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Servers

```bash
# Terminal 1: Backend (MUST start first)
cd backend
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2: Frontend
cd frontend  
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Test the Application

Visit `http://localhost:3000` and:
1. Upload a resume file
2. Wait for parsing to complete
3. Start chatting about your CV!

## Usage Guide 📖

### 1. Upload Your Resume
1. Visit `http://localhost:3000`
2. Drag & drop or click to upload your CV (PDF, DOCX, or TXT)
3. The system will parse your resume using client-side libraries
4. Review the extracted information displayed

### 2. Chat About Your Resume
**AI-Powered Conversations with Cohere Command:**
- Ask questions about your experience, skills, education
- Get intelligent responses based on your resume content
- Natural language processing for better understanding

**Sample Questions:**
- "What role did I have at my last position?"
- "What are my key programming skills?"
- "Tell me about my education background"
- "How many years of experience do I have?"
- "What projects have I worked on?"
- "Summarize my work experience"

### 3. Send Professional Emails
1. Use the email interface to compose messages
2. Choose from built-in templates (introduction, follow-up, thank you)
3. Customize recipient, subject, and message
4. Send directly through SendGrid integration

### 4. Application Flow
```
1. Upload Resume → Client-side parsing (PDF.js, Mammoth.js)
2. Ask Question → Frontend → Backend /api/chat → Cohere Command → AI Response
3. Send Email → Frontend → Backend /api/email → SendGrid → Email Delivered
```

## API Endpoints 🔗

### Backend Routes (Port 5000)

#### Chat with Resume
```http
POST /api/chat
Content-Type: application/json

{
  "resume_text": "parsed resume content...",
  "question": "What skills do I have?"
}
```

#### Send Email
```http
POST /api/email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "message": "Email content",
  "template": "professional" // optional
}
```

#### Health Check
```http
GET /health
```

### Frontend API Routes (Port 3000)

#### Proxy to Backend Chat
```http
POST /api/chat
```

#### Proxy to Backend Email
```http
POST /api/send-email
```

## Configuration ⚙️

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes | `SG.xxx...` |
| `COHERE_API_KEY` | Cohere Command API key | Yes | `OrKO3...` |
| `EMAIL_FROM` | Verified sender email | Yes | `your@email.com` |
| `EMAIL_FROM_NAME` | Sender display name | No | `CV Assistant Bot` |
| `PORT` | Backend server port | No | `5000` |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend | Yes | `http://localhost:5000` |

### Service Setup

#### SendGrid Email Service
- ✅ **Already configured** with your API key
- Sender email: Use your verified email address
- Make sure this email is verified in your SendGrid account

#### Cohere Command AI
- ✅ **Already configured** with your API key
- Provides intelligent chat responses about resume content
- Free tier: 1000 API calls per month

## File Structure 📁

```
cv-assistant/
├── frontend/                 # Next.js application
│   ├── components/          # React components
│   ├── lib/                # Resume parsing utilities
│   ├── pages/              # Next.js pages
│   │   ├── api/           # API proxy routes
│   │   └── index.js       # Main application page
│   ├── styles/            # Tailwind CSS
│   └── package.json       # Frontend dependencies
├── backend/                # Express.js server
│   ├── src/               # Source code
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Email and AI services
│   │   └── index.js       # Main server file
│   └── package.json       # Backend dependencies
├── docker-compose.yml     # Docker configuration
└── README.md             # This file
```

## Deployment 🌐

### Frontend Deployment (Vercel - Free)

1. Push code to GitHub
2. Connect to [Vercel](https://vercel.com/)
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

### Backend Deployment (Railway/Render - Free)

1. Connect to [Railway](https://railway.app/) or [Render](https://render.com/)
2. Set environment variables (all the ones from backend/.env)
3. Deploy from GitHub

### Docker Deployment

```bash
# Build and run both services
docker-compose up --build

# Frontend will be on port 3000
# Backend will be on port 5000
```

## Tech Stack 🛠️

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **PDF.js** - PDF parsing
- **Mammoth.js** - DOCX parsing
- **React Hook Form** - Form handling

### Backend
- **Express.js** - Node.js server
- **Cohere SDK** - AI chat integration
- **SendGrid** - Email service
- **CORS** - Cross-origin requests
- **Multer** - File upload handling

### External Services
- **Cohere Command** - AI language model
- **SendGrid** - Email delivery platform

## Troubleshooting 🔧

### Common Issues

#### Resume Upload Fails
- Check file size (should be under 10MB)
- Ensure file format is supported (PDF, DOCX, TXT)
- Try using PDF format for best results

#### Chat Not Working
- Verify Cohere API key is set correctly
- Check backend console for error messages
- Ensure backend is running on port 5000

#### Email Not Sending
- Verify SendGrid API key
- Ensure sender email is verified in SendGrid
- Check SendGrid dashboard for delivery status

#### CORS Errors
- Make sure backend is running before frontend
- Check NEXT_PUBLIC_API_URL is set correctly

### Debug Tips

```bash
# Check backend logs
cd backend
npm run dev

# Check frontend logs
cd frontend
npm run dev

# Test backend directly
curl http://localhost:5000/health
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Submit a pull request

## License 📄

MIT License - see [LICENSE](LICENSE) file for details.

## Support 💬

- Create an issue for bug reports
- Include error logs and environment details
- Check existing issues before posting new ones

## Future Enhancements 🚀

- [ ] Multiple file upload support
- [ ] Resume comparison features
- [ ] Job matching suggestions
- [ ] Export parsed data to JSON/CSV
- [ ] Resume optimization recommendations
- [ ] Integration with job boards
- [ ] Mobile app version

---

Built with using Next.js, Express.js, Cohere Command, and SendGrid.