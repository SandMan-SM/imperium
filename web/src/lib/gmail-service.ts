import { google, gmail_v1 } from 'googleapis';
import { supabase } from './supabase';

interface GmailCredentials {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken?: string;
}

interface EmailData {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

class GmailService {
    private auth: any;
    private gmail: gmail_v1.Gmail;

    constructor() {
        this.initializeAuth();
    }

    private initializeAuth() {
        const credentials = this.getCredentials();
        if (!credentials) {
            throw new Error('Gmail credentials not configured');
        }

        this.auth = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            'https://developers.google.com/oauthplayground'
        );

        this.auth.setCredentials({
            refresh_token: credentials.refreshToken,
            access_token: credentials.accessToken
        });

        this.gmail = google.gmail({ version: 'v1', auth: this.auth });
    }

    private getCredentials(): GmailCredentials | null {
        const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_GMAIL_CLIENT_SECRET;
        const refreshToken = process.env.NEXT_PUBLIC_GMAIL_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            return null;
        }

        return {
            clientId,
            clientSecret,
            refreshToken
        };
    }

    private async ensureAccessToken(): Promise<void> {
        try {
            const tokenInfo = await this.auth.getAccessToken();
            if (!tokenInfo.token) {
                throw new Error('Failed to get access token');
            }
        } catch (error) {
            console.error('Gmail auth error:', error);
            throw new Error('Gmail authentication failed');
        }
    }

    private createEmailMessage(data: EmailData): string {
        const from = data.from || process.env.NEXT_PUBLIC_GMAIL_FROM_EMAIL || 'noreply@imperium.com';
        const text = data.text || this.htmlToText(data.html);

        const emailContent = [
            `From: ${from}`,
            `To: ${data.to}`,
            `Subject: ${data.subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: quoted-printable',
            '',
            data.html
        ].join('\n');

        return Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    }

    private htmlToText(html: string): string {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .trim();
    }

    async sendEmail(data: EmailData): Promise<boolean> {
        try {
            await this.ensureAccessToken();

            const rawMessage = this.createEmailMessage(data);

            const response = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: rawMessage
                }
            });

            return !!response.data.id;
        } catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    }

    async sendNewsletterToSubscribers(newsletterId: string): Promise<{ success: number; failed: number }> {
        try {
            await this.ensureAccessToken();

            // Get newsletter content
            const { data: newsletter } = await supabase
                .from('newsletters')
                .select('*')
                .eq('id', newsletterId)
                .single();

            if (!newsletter) {
                throw new Error('Newsletter not found');
            }

            // Get active subscribers
            const { data: subscribers } = await supabase
                .from('newsletter_subscribers')
                .select('email')
                .eq('status', 'active');

            if (!subscribers || subscribers.length === 0) {
                return { success: 0, failed: 0 };
            }

            let successCount = 0;
            let failedCount = 0;

            // Send emails in batches to avoid rate limits
            const batchSize = 50;
            for (let i = 0; i < subscribers.length; i += batchSize) {
                const batch = subscribers.slice(i, i + batchSize);

                await Promise.all(batch.map(async (subscriber) => {
                    try {
                        const emailData: EmailData = {
                            to: subscriber.email,
                            subject: newsletter.title,
                            html: this.createNewsletterTemplate(newsletter.title, newsletter.content, subscriber.email)
                        };

                        const success = await this.sendEmail(emailData);
                        if (success) {
                            successCount++;
                        } else {
                            failedCount++;
                        }
                    } catch (error) {
                        console.error(`Failed to send to ${subscriber.email}:`, error);
                        failedCount++;
                    }
                }));

                // Add delay between batches to respect Gmail limits
                if (i + batchSize < subscribers.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return { success: successCount, failed: failedCount };
        } catch (error) {
            console.error('Newsletter dispatch error:', error);
            return { success: 0, failed: subscribers?.length || 0 };
        }
    }

    private createNewsletterTemplate(title: string, content: string, email: string): string {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 2px solid #d4af37; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; color: #d4af37; margin: 0; }
          .content { font-size: 16px; line-height: 1.8; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          .unsubscribe { color: #999; font-size: 11px; }
          a { color: #d4af37; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Imperium Intelligence Brief</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Strategic Analysis for the Sovereign Mind</p>
        </div>

        <div class="content">
          <h2>${title}</h2>
          <div>${content}</div>
        </div>

        <div class="footer">
          <p>Imperium Strategic Intelligence</p>
          <p class="unsubscribe">
            You are receiving this email because you subscribed to the Imperium Intelligence Brief.<br>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;
    }

    async getSubscriptionStatus(email: string): Promise<'subscribed' | 'unsubscribed' | 'not_found'> {
        try {
            const { data } = await supabase
                .from('newsletter_subscribers')
                .select('status')
                .eq('email', email.toLowerCase())
                .single();

            if (!data) return 'not_found';
            return data.status === 'active' ? 'subscribed' : 'unsubscribed';
        } catch (error) {
            return 'not_found';
        }
    }

    async subscribeEmail(email: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .upsert({
                    email: email.toLowerCase(),
                    status: 'active',
                    subscribed_at: new Date().toISOString()
                }, { onConflict: 'email' });

            return !error;
        } catch (error) {
            console.error('Subscription error:', error);
            return false;
        }
    }

    async unsubscribeEmail(email: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .update({ status: 'unsubscribed' })
                .eq('email', email.toLowerCase());

            return !error;
        } catch (error) {
            console.error('Unsubscription error:', error);
            return false;
        }
    }
}

export const gmailService = new GmailService();