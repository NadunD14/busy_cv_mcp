#!/bin/bash

echo "🚀 Deploying to Fly.io..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if required environment variables are set
if [ -z "$SENDGRID_API_KEY" ] || [ -z "$COHERE_API_KEY" ] || [ -z "$EMAIL_FROM" ]; then
    echo "❌ Error: Please set the following environment variables:"
    echo "   SENDGRID_API_KEY"
    echo "   COHERE_API_KEY" 
    echo "   EMAIL_FROM"
    echo ""
    echo "Example:"
    echo "   export SENDGRID_API_KEY=your_sendgrid_key"
    echo "   export COHERE_API_KEY=your_cohere_key"
    echo "   export EMAIL_FROM=your_email@domain.com"
    exit 1
fi

# Set environment variables
echo "📝 Setting environment variables..."
flyctl secrets set \
  NODE_ENV=production \
  SENDGRID_API_KEY="$SENDGRID_API_KEY" \
  COHERE_API_KEY="$COHERE_API_KEY" \
  EMAIL_FROM="$EMAIL_FROM" \
  EMAIL_FROM_NAME="CV Assistant Bot"

# Deploy the app
echo "🛠️ Building and deploying..."
flyctl deploy

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://busy-cv-backend.fly.dev"
echo "🔍 Health check: https://busy-cv-backend.fly.dev/health"
