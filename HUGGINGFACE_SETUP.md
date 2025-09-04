# Hugging Face DistilBERT Setup Guide

This guide will help you set up Hugging Face's DistilBERT model for enhanced question answering in the MCP CV Assistant.

## Why DistilBERT?

- **🚀 Fast and Efficient** - Distilled version of BERT, 60% smaller and 60% faster
- **🎯 Specialized for Q&A** - Pre-trained on SQuAD dataset for question answering
- **🆓 Free API** - Hugging Face provides free inference API
- **📚 Well-documented** - Extensive documentation and community support
- **🔒 Privacy-friendly** - Open source model with transparent operations

## Setup Steps

### 1. Create Hugging Face Account

1. Go to [huggingface.co](https://huggingface.co/)
2. Click "Sign Up" in the top right
3. Create your account with email or GitHub
4. Verify your email address

### 2. Generate API Token

1. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Give it a name like "MCP CV Assistant"
4. Select "Read" permissions (sufficient for inference)
5. Click "Generate a token"
6. **Copy the token** (you won't see it again!)

### 3. Configure Environment

1. Open your `.env` file in the project root
2. Add the Hugging Face API token:

```env
HUGGINGFACE_API_TOKEN=hf_your_token_here
```

### 4. Test the Configuration

Run the chat test with AI enabled:

```bash
cd backend
npm run test:chat
```

You should see DistilBERT AI responses in the output.

## How DistilBERT Works

### Question Answering Process

1. **Context Building**: The system creates a context from your parsed resume data
2. **Question Processing**: Your question is sent to DistilBERT along with the context
3. **Answer Extraction**: DistilBERT finds the most relevant answer span in the context
4. **Confidence Scoring**: The model provides a confidence score for the answer
5. **Fallback Logic**: If confidence is low, it falls back to rule-based responses

### Example Interaction

```
Context: "Name: John Doe. Skills: Python, JavaScript, React..."
Question: "What programming languages does John know?"
DistilBERT Response: "Python, JavaScript" (confidence: 0.89)
```

## Model Specifications

- **Model**: `distilbert-base-uncased-distilled-squad`
- **Architecture**: Transformer-based, distilled from BERT-base
- **Training Data**: SQuAD 1.1 (Stanford Question Answering Dataset)
- **Input Limit**: ~512 tokens (automatically handled by context builder)
- **Languages**: English (primary), limited multilingual support

## API Usage & Limits

### Free Tier
- **Rate Limit**: 1,000 requests/month
- **Model Access**: All public models
- **Response Time**: ~1-3 seconds per request
- **No Credit Card**: Required only for paid tiers

### Rate Limiting
The system automatically handles rate limits by:
- Falling back to rule-based responses when rate limited
- Caching common question patterns
- Smart context building to minimize token usage

## Troubleshooting

### 🔑 Invalid API Token
**Error**: "Invalid API token"
**Solution**: Regenerate your token with Read permissions

### 🚫 Rate Limit Exceeded
**Error**: "Rate limit exceeded"
**Solution**: Wait for reset or upgrade to paid tier. System will use rule-based responses.

### 📡 Network/Connection Issues
**Error**: "Network error" or "Timeout"
**Solution**: Check internet connection. System will fallback to rule-based responses.

### 🤖 Poor Answer Quality
**Issue**: DistilBERT gives irrelevant answers
**Solution**: 
- Ensure resume data is well-structured
- Try rephrasing questions to be more specific
- Check if answer confidence is low (system may fallback automatically)

## Advanced Configuration

### Custom Context Building
You can modify how context is built in `buildResumeContext()` function:
- Adjust context length limits
- Change information prioritization
- Add custom formatting

### Confidence Thresholds
Adjust when to fallback to rule-based responses:
```javascript
// In generateDistilBERTAnswer()
if (response.score < 0.3) { // Lower = more fallbacks
    return this.generateRuleBasedAnswer(parsed, question);
}
```

## Comparison: DistilBERT vs Rule-Based

| Feature | DistilBERT | Rule-Based |
|---------|------------|------------|
| **Speed** | 1-3 seconds | Instant |
| **Accuracy** | High for complex questions | Good for simple patterns |
| **Flexibility** | Handles varied question styles | Limited to predefined patterns |
| **Reliability** | Depends on API availability | Always available |
| **Context Understanding** | Excellent | Basic |
| **Cost** | Free tier limits | No cost |

## Best Practices

### Question Types That Work Well
- ✅ "What is the person's name?"
- ✅ "What programming languages does he know?"
- ✅ "Where did she study?"
- ✅ "What work experience does he have?"

### Question Types to Avoid
- ❌ Very abstract questions: "What kind of person is this?"
- ❌ Comparative questions: "Is this better than that?"
- ❌ Questions requiring external knowledge: "Is Python better than Java?"

### Optimize Your Resume Data
- Use clear, structured text
- Include keywords relevant to common questions
- Organize information logically
- Avoid excessive jargon or abbreviations

## Need Help?

- [Hugging Face Documentation](https://huggingface.co/docs)
- [DistilBERT Model Card](https://huggingface.co/distilbert-base-uncased-distilled-squad)
- [Hugging Face Community](https://discuss.huggingface.co/)
- [API Reference](https://huggingface.co/docs/api-inference/index)

## Security Notes

- Never commit your API token to version control
- Use environment variables for all credentials
- Rotate tokens regularly for security
- Monitor your API usage in Hugging Face dashboard
