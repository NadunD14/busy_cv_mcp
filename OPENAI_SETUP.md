# OpenAI GPT Setup Guide

This guide will help you set up OpenAI's GPT models for enhanced question answering in the MCP CV Assistant.

## Why OpenAI GPT?

- **🚀 Powerful and Versatile** - GPT-3.5-turbo and GPT-4 provide excellent natural language understanding
- **🎯 Superior Context Understanding** - Better at understanding complex questions and providing relevant answers
- **🆓 Free Tier Available** - OpenAI provides free credits for new users
- **📚 Well-documented** - Extensive documentation and community support
- **🔒 Reliable** - Industry-standard API with high uptime

## Setup Steps

### 1. Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Click "Sign up" and create your account
3. Verify your email address
4. Complete phone number verification

### 2. Get Free Credits

New users receive $5 in free API credits that expire after 3 months. This is usually sufficient for testing and light usage.

### 3. Generate API Key

1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Give it a name like "MCP CV Assistant"
4. **Copy the API key** (you won't see it again!)

### 4. Configure Environment

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Add your OpenAI API key to the `.env` file:
   ```env
   OPENAI_API_KEY=sk-your_api_key_here
   ```

### 5. Install Dependencies

Install the OpenAI package:

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

You should see OpenAI GPT responses in the output.

## Usage and Costs

### Free Tier
- **$5 free credits** for new users
- Credits expire after 3 months
- Perfect for testing and development

### GPT-3.5-turbo Pricing (After free credits)
- **$0.0015** per 1K input tokens
- **$0.002** per 1K output tokens
- Very affordable for resume chat use cases

### Rate Limits
- **Free tier**: 3 requests per minute, 200 requests per day
- **Pay-as-you-go**: 3,500 requests per minute

## Tips for Cost Management

1. **Start with Free Credits** - Use the free $5 credits for development
2. **Monitor Usage** - Check your usage at [platform.openai.com/usage](https://platform.openai.com/usage)
3. **Set Usage Limits** - Configure monthly spending limits in your OpenAI account
4. **Optimize Prompts** - Shorter, more specific prompts use fewer tokens

## Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Ensure you copied the full API key
   - Check that the key starts with `sk-`
   - Make sure the key is in your `.env` file

2. **Rate Limit Exceeded**
   - Wait a minute and try again
   - Consider upgrading to a paid plan for higher limits

3. **Insufficient Credits**
   - Check your usage and add billing information if needed
   - Free credits expire after 3 months

### Testing Without API Key

The system will automatically fall back to rule-based responses if no API key is provided, so you can still test the basic functionality.

## Security Best Practices

1. **Never commit API keys** - Keep `.env` file out of version control
2. **Use environment variables** - Never hardcode API keys in source code
3. **Rotate keys regularly** - Generate new API keys periodically
4. **Monitor usage** - Watch for unexpected API calls

## Support

- [OpenAI Documentation](https://platform.openai.com/docs)
- [OpenAI Community Forum](https://community.openai.com/)
- [API Status Page](https://status.openai.com/)
