import { Resend } from 'resend';

interface EmailData {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    /** Extra headers, e.g. the RFC 8058 List-Unsubscribe pair. */
    headers?: Record<string, string>;
}

interface BatchEmailData extends EmailData {
    batchId?: string;
}

interface ResendResponse {
    success: boolean;
    data?: {
        id: string;
    };
    error?: {
        message: string;
        name: string;
    };
}

class ResendService {
    private resend: Resend | null = null;
    private isInitialized = false;

    private initialize() {
        if (this.isInitialized) return;

        const apiKey = process.env.RESEND_API_KEY;
        
        if (!apiKey) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        this.resend = new Resend(apiKey);
        this.isInitialized = true;
    }

    private getFromEmail(): string {
        // secretimperium.com is the verified sending domain; imperium.com is
        // not verified on the account, so an unconfigured sender would fail
        // delivery outright.
        return process.env.RESEND_FROM_EMAIL || 'Imperium <newsletter@secretimperium.com>';
    }

    async sendEmail(data: EmailData): Promise<ResendResponse> {
        this.initialize();

        if (!this.resend) {
            return {
                success: false,
                error: {
                    message: 'Resend client not initialized',
                    name: 'InitializationError'
                }
            };
        }

        try {
            const recipients = Array.isArray(data.to) ? data.to : [data.to];
            
            const result = await this.resend.emails.send({
                from: data.from || this.getFromEmail(),
                to: recipients,
                subject: data.subject,
                html: data.html,
                text: data.text,
                ...(data.headers ? { headers: data.headers } : {}),
            });

            if (result.error) {
                return {
                    success: false,
                    error: {
                        message: result.error.message,
                        name: result.error.name
                    }
                };
            }

            return {
                success: true,
                data: result.data ? {
                    id: result.data.id
                } : undefined
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send email';
            const name = error instanceof Error ? error.name : 'Error';
            return {
                success: false,
                error: {
                    message,
                    name
                }
            };
        }
    }

    async sendNewsletter(
        recipients: string[],
        subject: string,
        html: string,
        text?: string
    ): Promise<ResendResponse> {
        return this.sendEmail({
            to: recipients,
            subject,
            html,
            text
        });
    }

    async sendTestEmail(
        to: string,
        subject: string,
        html: string,
        text?: string
    ): Promise<ResendResponse> {
        const testSubject = `[TEST] ${subject}`;
        return this.sendEmail({
            to,
            subject: testSubject,
            html,
            text
        });
    }

    async sendBulkEmails(
        emails: Array<{ to: string; subject: string; html: string; text?: string }>
    ): Promise<{ success: number; failed: number; results: ResendResponse[] }> {
        this.initialize();

        const results: ResendResponse[] = [];
        let success = 0;
        let failed = 0;

        for (const email of emails) {
            const result = await this.sendEmail({
                to: email.to,
                subject: email.subject,
                html: email.html,
                text: email.text
            });

            results.push(result);

            if (result.success) {
                success++;
            } else {
                failed++;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return { success, failed, results };
    }

    async getEmailStats(emailId: string): Promise<{
        id: string;
        status: string;
    } | null> {
        return {
            id: emailId,
            status: 'sent'
        };
    }

    isConfigured(): boolean {
        return !!process.env.RESEND_API_KEY;
    }
}

export const resendService = new ResendService();
export type { EmailData, ResendResponse, BatchEmailData };
