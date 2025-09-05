# ⚠️ DEPRECATED: OpenAI GPT Setup Guide

**This setup guide is no longer valid. The project has been migrated to use Cohere Command.**

## Migration Notice

This project previously used OpenAI's GPT models but has been **migrated to Cohere Command** for better cost efficiency and generous free tiers.

### What Changed?
- ❌ **Removed**: OpenAI GPT integration
- ✅ **Added**: Cohere Command integration
- ✅ **Improved**: More generous free tier (1000 calls/month vs $5 credits)
- ✅ **Enhanced**: Cost-effective pricing for production use

### New Setup Guide

Please refer to the new **[COHERE_SETUP.md](./COHERE_SETUP.md)** file for current setup instructions.

### Key Differences

| Feature | Old (OpenAI GPT) | New (Cohere Command) |
|---------|------------------|---------------------|
| Provider | OpenAI | Cohere |
| Model | GPT-3.5-turbo / GPT-4 | Command Light / Command |
| API Key | `OPENAI_API_KEY` | `COHERE_API_KEY` |
| Free Tier | $5 credits (expires) | 1000 calls/month (renewable) |
| Cost | $0.002/1K tokens | $0.15/1M tokens |
| Response Quality | Excellent | Excellent |
| Context Understanding | Advanced | Advanced |

### Migration Steps

If you were using the old OpenAI setup:

1. **Remove old environment variable**:
   ```env
   # Remove this line from your .env file
   OPENAI_API_KEY=sk-your_openai_key_here
   ```

2. **Add new Cohere API key**:
   ```env
   # Add this line to your .env file
   COHERE_API_KEY=your_cohere_api_key_here
   ```

3. **Get Cohere API Key**:
   - Sign up at [dashboard.cohere.com](https://dashboard.cohere.com/)
   - Get 1000 free API calls per month
   - Generate API key from [API Keys page](https://dashboard.cohere.com/api-keys)

4. **Update dependencies** (if installing manually):
   ```bash
   cd backend
   npm uninstall openai
   npm install cohere-ai
   ```

The chat functionality will work exactly the same way - just with more cost-effective AI!

### Questions?

- Check the new [COHERE_SETUP.md](./COHERE_SETUP.md) guide
- See the main [README.md](./readme.md) for updated instructions
- The rule-based fallback system still works without any API key
