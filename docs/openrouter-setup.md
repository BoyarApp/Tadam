# OpenRouter Setup for Tamil Editorial AI

This guide will help you set up OpenRouter as your AI provider for Tamil language support in the editorial workbench.

## Why OpenRouter?

OpenRouter provides access to multiple AI models through a single API, making it ideal for Tamil language tasks:

- **Best Tamil Support**: Google Gemini models have excellent Tamil language capabilities
- **Free Tier Available**: Free models with reasonable rate limits
- **Single API**: Access to 400+ models from different providers
- **Cost Effective**: Pay-as-you-go pricing, no subscriptions

## Step 1: Create OpenRouter Account

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Click "Sign Up" (top right)
3. Sign up with Google, GitHub, or email
4. Verify your email if required

## Step 2: Get Your API Key

1. After signing in, go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Click "Create Key"
3. Give it a name like "Tadam Editorial"
4. Copy the API key (starts with `sk-or-v1-...`)
5. **Important**: Save this key somewhere safe - you won't see it again!

## Step 3: Add Credits (Optional but Recommended)

Free models have strict rate limits:
- **Without credits**: 50 requests/day total across all free models
- **With $10+ credits**: 1,000 requests/day for free models

To add credits:
1. Go to [https://openrouter.ai/credits](https://openrouter.ai/credits)
2. Click "Add Credits"
3. Minimum is $5, recommended $10 for better limits
4. Even with credits, you can still use `:free` models at no cost

## Step 4: Configure Your Environment

Edit `cms/.env` and add:

```bash
# OpenRouter Configuration
EDITORIAL_AI_BASE_URL=https://openrouter.ai/api/v1
EDITORIAL_AI_API_KEY=sk-or-v1-YOUR-KEY-HERE
EDITORIAL_AI_MODEL=google/gemini-flash-1.5:free
EDITORIAL_AI_TIMEOUT_MS=30000

# Use same for compliance/quality checks
EDITORIAL_COMPLIANCE_BASE_URL=https://openrouter.ai/api/v1
EDITORIAL_COMPLIANCE_API_KEY=sk-or-v1-YOUR-KEY-HERE
EDITORIAL_COMPLIANCE_TIMEOUT_MS=30000
```

## Recommended Models for Tamil

### Free Models (`:free` suffix)

1. **google/gemini-flash-1.5:free** (Recommended)
   - Best Tamil translation quality
   - Fast responses
   - Good for spell check and entity extraction
   - Free tier: 1000 req/day with credits, 50/day without

2. **mistralai/mistral-small-3.1:free**
   - Supports Tamil and Indian languages
   - Good fallback option
   - Decent quality for Tamil tasks

3. **meta-llama/llama-3.1-8b-instruct:free**
   - General purpose, moderate Tamil support
   - Faster but less accurate for Tamil

### Paid Models (Better Quality)

If you need better quality and have added credits:

1. **google/gemini-pro-1.5** ($0.625 per 1M tokens input)
   - Best Tamil translation and grammar
   - Most accurate entity recognition
   - Recommended for production

2. **anthropic/claude-3.5-sonnet** ($3 per 1M tokens)
   - Excellent quality but has Tamil word-count issues
   - Better for English-heavy content

3. **openai/gpt-4o** ($2.50 per 1M tokens)
   - Good multilingual support
   - Reliable but more expensive

## Step 5: Test Your Setup

### Start the CMS
```bash
cd cms
pnpm develop
```

### Test Translation Endpoint

```bash
curl -X POST http://localhost:1337/api/editorial-workbench/ai/translate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "text": "வணக்கம்",
    "targetLanguage": "English"
  }'
```

Expected response:
```json
{
  "type": "translate",
  "input": "வணக்கம்",
  "output": "Hello",
  "metadata": {
    "confidence": 0.85,
    "provider": "external"
  }
}
```

### Test Quality Evaluation

```bash
curl -X POST http://localhost:1337/api/editorial-workbench/quality/evaluate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "text": "தமிழ் செய்தி உள்ளடக்கம்",
    "language": "Tamil"
  }'
```

## Model Selection Strategy

The `EDITORIAL_AI_MODEL` environment variable determines which model is used. You can change models anytime:

### For Development/Testing
```bash
EDITORIAL_AI_MODEL=google/gemini-flash-1.5:free
```

### For Production (After Testing)
```bash
EDITORIAL_AI_MODEL=google/gemini-pro-1.5
```

### For Custom Needs
Check [https://openrouter.ai/models](https://openrouter.ai/models) and filter by:
- Language support (search "Tamil" or "multilingual")
- Price range
- Response speed
- Context window

## Rate Limits & Costs

### Free Models Rate Limits
- **No credits**: 50 requests/day total
- **$10+ credits**: 1,000 requests/day per free model
- Resets daily at midnight UTC

### Paid Model Costs (Approximate)
For a typical editorial workflow processing 1000 articles/month:

| Model | Cost per 1M tokens | Estimated Monthly |
|-------|-------------------|-------------------|
| Gemini Flash 1.5 Free | $0 | $0 |
| Gemini Pro 1.5 | $0.625 | ~$5-10 |
| GPT-4o | $2.50 | ~$15-25 |
| Claude 3.5 Sonnet | $3.00 | ~$20-30 |

*Estimates assume 500-1000 tokens per article for translation/quality checks*

## Monitoring Usage

1. Go to [https://openrouter.ai/activity](https://openrouter.ai/activity)
2. View real-time request logs
3. Check spending by model
4. Set spending limits under Settings

## Troubleshooting

### "Insufficient credits" error
- Add credits at https://openrouter.ai/credits
- Or switch to a `:free` model

### "Rate limit exceeded"
- Free tier: 50 requests/day without credits
- Add $10 credits for 1000 requests/day
- Or wait for daily reset (midnight UTC)

### "Model not found"
- Check model name at https://openrouter.ai/models
- Ensure you include `:free` suffix for free models
- Model names are case-sensitive

### Timeouts
- Increase `EDITORIAL_AI_TIMEOUT_MS` to 30000 or 60000
- Some models are slower than others
- Check OpenRouter status at https://status.openrouter.ai

## Next Steps

1. **Test thoroughly** with sample Tamil content
2. **Monitor quality** - compare AI suggestions with manual edits
3. **Track costs** if using paid models
4. **Adjust prompts** in `openrouter-adapter.ts` for better results
5. **Switch models** based on quality vs. cost tradeoffs

## Security Notes

- **Never commit** your API key to git
- Keep `.env` in `.gitignore`
- Rotate keys periodically at https://openrouter.ai/keys
- Use separate keys for dev/staging/production environments

## Support

- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Discord: https://discord.gg/fVyRaUDgxW
- Model comparisons: https://openrouter.ai/rankings
