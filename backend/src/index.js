import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { chatHandler } from './routes/chat.js';
import { emailHandler } from './routes/email.js';
import { parseHandler } from './routes/parse.js';
import mailerService from './services/mailer.js';

dotenv.config();

// MCP Server Setup
class CVServer {
    constructor() {
        this.server = new Server(
            {
                name: 'cv-assistant',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();
        this.setupErrorHandling();
    }

    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'parse_resume',
                        description: 'Parse a resume from text and extract structured information',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                text: {
                                    type: 'string',
                                    description: 'Raw resume text to parse',
                                },
                            },
                            required: ['text'],
                        },
                    },
                    {
                        name: 'chat_about_resume',
                        description: 'Answer questions about a parsed resume',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                parsedResume: {
                                    type: 'object',
                                    description: 'Parsed resume data',
                                },
                                question: {
                                    type: 'string',
                                    description: 'Question about the resume',
                                },
                                useGroq: {
                                    type: 'boolean',
                                    description: 'Use Groq AI for more intelligent responses (requires GROQ_API_KEY)',
                                    default: false
                                }
                            },
                            required: ['parsedResume', 'question'],
                        },
                    },
                    {
                        name: 'send_email',
                        description: 'Send an email notification',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                to: {
                                    type: 'string',
                                    description: 'Recipient email address',
                                },
                                subject: {
                                    type: 'string',
                                    description: 'Email subject',
                                },
                                body: {
                                    type: 'string',
                                    description: 'Email body',
                                },
                            },
                            required: ['to', 'subject', 'body'],
                        },
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'parse_resume':
                        return await this.handleParseResume(args);
                    case 'chat_about_resume':
                        return await this.handleChatAboutResume(args);
                    case 'send_email':
                        return await this.handleSendEmail(args);
                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Unknown tool: ${name}`
                        );
                }
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(
                    ErrorCode.InternalError,
                    `Tool execution failed: ${error.message}`
                );
            }
        });
    }

    async handleParseResume(args) {
        const { text } = args;
        const parsed = parseHandler.parseResumeText(text);

        return {
            content: [
                {
                    type: 'text',
                    text: `Resume parsed successfully!\n\nExtracted Information:\n- Name: ${parsed.name || 'Not found'}\n- Email: ${parsed.email || 'Not found'}\n- Phone: ${parsed.phone || 'Not found'}\n- Skills: ${parsed.skills?.length || 0} found\n- Work Experience: ${parsed.jobs?.length || 0} positions found\n- Education: ${parsed.education?.length || 0} entries found`,
                },
                {
                    type: 'text',
                    text: JSON.stringify(parsed, null, 2),
                },
            ],
        };
    }

    async handleChatAboutResume(args) {
        const { parsedResume, question, useGroq = false } = args;
        const response = await chatHandler.generateAnswer(parsedResume, question, useGroq);

        return {
            content: [
                {
                    type: 'text',
                    text: response.text,
                },
            ],
        };
    }

    async handleSendEmail(args) {
        const { to, subject, body } = args;

        try {
            const result = await emailHandler.sendEmail(to, subject, body);

            return {
                content: [
                    {
                        type: 'text',
                        text: `Email sent successfully to ${to}!\nSubject: ${subject}\nMessage ID: ${result.messageId || 'N/A'}`,
                    },
                ],
            };
        } catch (error) {
            throw new McpError(
                ErrorCode.InternalError,
                `Failed to send email: ${error.message}`
            );
        }
    }

    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };

        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('CV Assistant MCP server running on stdio');
    }
}

// Express Server (for HTTP endpoints)
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'CV Assistant MCP Server',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.post('/api/parse', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const parsed = parseHandler.parseResumeText(text);
        res.json(parsed);
    } catch (error) {
        console.error('Parse error:', error);
        res.status(500).json({ error: 'Failed to parse resume' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        console.log('Chat request received');
        const { parsedJson, question, useGroq = false } = req.body;
        if (!parsedJson || !question) {
            return res.status(400).json({ error: 'parsedJson and question are required' });
        }

        const response = await chatHandler.generateAnswer(parsedJson, question, useGroq);
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to process chat request' });
    }
});

app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        if (!to || !subject || !body) {
            return res.status(400).json({ error: 'to, subject, and body are required' });
        }

        // Simple API key protection
        if (process.env.API_KEY && req.headers['x-api-key'] !== process.env.API_KEY) {
            return res.status(403).json({ error: 'Forbidden - Invalid API key' });
        }

        // Use the new mailer service
        const result = await mailerService.sendTextEmail(to, subject, body);
        res.json({
            success: result.success,
            messageId: result.messageId,
            provider: result.provider
        });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
});

// Start servers
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--mcp')) {
        // Run as MCP server
        const mcpServer = new CVServer();
        await mcpServer.run();
    } else {
        // Run as HTTP server
        app.listen(port, () => {
            console.log(`CV Assistant HTTP server running on port ${port}`);
            console.log(`Health check: http://localhost:${port}/health`);
        });
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

main().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});