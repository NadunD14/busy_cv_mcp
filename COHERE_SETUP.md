# Cohere Command Setup Guide

This guide will help you set up Cohere's Command models for enhanced question answering in the MCP CV Assistant.

## Why Cohere Command?

- **🚀 Fast and Reliable** - Command models are optimized for chat and conversational AI
- **🎯 Excellent for Q&A** - Specialized in understanding context and providing relevant answers
- **🆓 Generous Free Tier** - Cohere provides substantial free usage limits
- **📚 Well-documented** - Clear API documentation and examples
- **🔒 Privacy-focused** - Strong data privacy and security practices
- **💰 Cost-effective** - Competitive pricing with free tier for development

## Setup Steps

### 1. Create Cohere Account

1. Go to [dashboard.cohere.com](https://dashboard.cohere.com/)
2. Click "Sign Up" and create your account
3. Verify your email address
4. Complete the account setup

### 2. Get Free Credits

New users receive generous free usage limits:
- **1000 free API calls per month** for Command Light
- **100 free API calls per month** for Command (standard)
- Perfect for development and testing

### 3. Generate API Key

1. Go to [API Keys](https://dashboard.cohere.com/api-keys)
2. Click "Create API Key"
3. Give it a name like "MCP CV Assistant"
4. **Copy the API key** (keep it secure!)

### 4. Configure Environment

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Add your Cohere API key to the `.env` file:
   ```env
   COHERE_API_KEY=your_cohere_api_key_here
   ```

### 5. Install Dependencies

Install the Cohere package:

```bash
cd backend
npm install
```

### 6. Test the Configuration

Run the chat test with AI enabled:

```bash
cd backend
npm run test:chat
```

You should see Cohere Command responses in the output.

## Usage and Costs

### Free Tier
- **1000 API calls/month** for Command Light
- **100 API calls/month** for Command (standard)
- No credit card required
- Perfect for development and testing

### Command Light Pricing (After free tier)
- **$0.15** per 1M input tokens
- **$0.60** per 1M output tokens
- Most cost-effective option for resume chat

### Command (Standard) Pricing
- **$3.00** per 1M input tokens
- **$15.00** per 1M output tokens
- Higher quality responses

### Rate Limits
- **Free tier**: 20 requests per minute
- **Production**: 10,000 requests per minute

## Model Comparison

| Model | Use Case | Cost | Quality |
|-------|----------|------|---------|
| **Command Light** | Resume chat, Q&A | Lower | Good |
| **Command** | Complex reasoning | Higher | Excellent |

*The system uses Command Light by default for cost efficiency.*

## Tips for Optimization

1. **Use Command Light** - Perfect for resume Q&A use cases
2. **Monitor Usage** - Check your usage at [dashboard.cohere.com](https://dashboard.cohere.com/)
3. **Optimize Prompts** - Clear, specific questions get better answers
4. **Free Tier Monitoring** - Track monthly usage to stay within limits

## Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Ensure you copied the full API key correctly
   - Check that the key is active in your dashboard
   - Make sure the key is in your `.env` file

2. **Rate Limit Exceeded**
   - Wait a minute and try again
   - Consider upgrading to a paid plan for higher limits

3. **Monthly Limit Reached**
   - Check your usage in the dashboard
   - Either wait for next month or upgrade to paid plan

### Testing Without API Key

The system will automatically fall back to rule-based responses if no API key is provided, so you can still test the basic functionality.

## Security Best Practices

1. **Never commit API keys** - Keep `.env` file out of version control
2. **Use environment variables** - Never hardcode API keys in source code
3. **Rotate keys regularly** - Generate new API keys periodically
4. **Monitor usage** - Watch for unexpected API calls

## Features Used

- **Chat API**: For conversational question answering
- **Command Light Model**: Cost-effective choice for resume Q&A
- **Temperature Control**: Set to 0.3 for consistent responses
- **Token Limits**: Maximum 150 tokens per response

## API Response Format

Cohere returns responses in this format:
```json
{
  "text": "Your answer here",
  "generation_id": "unique-id",
  "citations": [],
  "meta": {
    "api_version": {
      "version": "1"
    }
  }
}
```

## Support

- [Cohere Documentation](https://docs.cohere.com/)
- [Cohere Discord Community](https://discord.gg/co-mmunity)
- [API Status Page](https://status.cohere.com/)
- [Dashboard Support](https://dashboard.cohere.com/)
