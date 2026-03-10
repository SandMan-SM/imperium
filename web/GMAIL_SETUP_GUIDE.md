# Gmail Integration Setup Guide

This guide will help you set up Gmail API integration for your newsletter system.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Desktop application" as the application type
4. Set up OAuth consent screen (if required):
   - Choose "External" for testing or "Internal" for GSuite users
   - Fill in app name, user support email, and developer contact email
   - Add scopes: `https://www.googleapis.com/auth/gmail.send`

## Step 3: Generate Refresh Token

1. Download the OAuth 2.0 Playground:
   - Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
   - Click the gear icon (⚙️) in the top right
   - Check "Use your own OAuth credentials"
   - Enter your Client ID and Client Secret

2. Generate refresh token:
   - Select the Gmail scope: `https://www.googleapis.com/auth/gmail.send`
   - Click "Authorize APIs"
   - Click "Exchange authorization code for tokens"
   - Copy the refresh token

## Step 4: Set Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Gmail API Configuration
NEXT_PUBLIC_GMAIL_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GMAIL_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GMAIL_REFRESH_TOKEN=your_refresh_token_here
NEXT_PUBLIC_GMAIL_FROM_EMAIL=your_email@gmail.com
```

## Step 5: Test the Integration

1. Start your development server
2. Try subscribing to the newsletter
3. Check the console for any authentication errors

## Troubleshooting

### Common Issues:

1. **Authentication Failed**: Check that your refresh token is valid and not expired
2. **Rate Limits**: Gmail has sending limits (500 emails/day for regular accounts)
3. **Scope Issues**: Ensure you have the correct OAuth scopes enabled

### Error Messages:

- "Invalid grant": Your refresh token may have expired. Generate a new one.
- "Daily limit exceeded": You've hit Gmail's daily sending limit.
- "User rate limit exceeded": You're sending emails too quickly. Add delays between sends.

## Security Notes

- Never commit your credentials to version control
- Use environment variables for all sensitive information
- Consider using a dedicated email address for newsletters
- Monitor your Google Cloud billing to avoid unexpected charges

## Gmail Sending Limits

- **Regular Gmail accounts**: 500 emails/day
- **Google Workspace accounts**: 2,000 emails/day
- **Rate limit**: ~100 emails/hour

## Next Steps

Once your Gmail integration is working:

1. Test with a small group of subscribers first
2. Monitor delivery rates and spam complaints
3. Consider upgrading to a professional email service when you outgrow Gmail limits
4. Set up email tracking and analytics

## Migration to Professional Service

When you're ready to scale beyond Gmail limits:

1. Sign up for Resend, SendGrid, or similar service
2. Update the `gmail-service.ts` file to use the new provider
3. Update environment variables
4. Test thoroughly before going live

## Support

For issues with Gmail API integration:
- Check Google's [Gmail API documentation](https://developers.google.com/gmail/api)
- Review Google Cloud [quota limits](https://developers.google.com/gmail/api/limits)
- Monitor your [Google Cloud Console](https://console.cloud.google.com/) for errors