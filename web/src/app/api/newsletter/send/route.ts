export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { resendService } from '@/lib/resend';

interface NewsletterData {
    id: string;
    title: string;
    content: string;
    is_public: boolean;
    published: boolean;
    sent_at: string | null;
    resend_batch_id: string | null;
    recipient_count: number | null;
}

export async function POST(req: Request) {
    try {
        // Allow requests with service role key OR from internal admin (no auth header = internal)
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { newsletterId, testMode, testEmail } = body;

        if (!newsletterId && !testMode) {
            return NextResponse.json({ error: 'newsletterId is required' }, { status: 400 });
        }

        if (testMode && !testEmail) {
            return NextResponse.json({ error: 'testEmail is required for test mode' }, { status: 400 });
        }

        let newsletter: NewsletterData | null = null;
        let recipients: string[] = [];

        if (testMode) {
            recipients = [testEmail];
        } else {
            const { data: nl, error: nlErr } = await supabaseAdmin
                .from('newsletters')
                .select('*')
                .eq('id', newsletterId)
                .single();

            if (nlErr || !nl) {
                return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
            }

            newsletter = nl;

            if (!newsletter || newsletter.sent_at) {
                return NextResponse.json({ error: 'Newsletter not found or already sent' }, { status: 400 });
            }

            const { data: subs, error: subsErr } = await supabaseAdmin
                .from('profiles')
                .select('email')
                .eq('is_subscribed', true);

            if (subsErr || !subs) {
                return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
            }

            recipients = subs.map((s: { email: string }) => s.email).filter(Boolean);
        }

        if (recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
        }

        const subject = newsletter?.title || 'Imperium Newsletter';
        const content = newsletter?.content || '';
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #222222;">
                            <h1 style="margin: 0; color: #d4af37; font-size: 24px; font-weight: 600;">IMPERIUM</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 20px; font-weight: 500;">${subject}</h2>
                            <div style="color: #a0a0a0; font-size: 15px; line-height: 1.6;">
                                ${content}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #222222;">
                            <p style="margin: 0; color: #666666; font-size: 12px; text-align: center;">
                                You're receiving this because you subscribed to Imperium newsletters.<br>
                                <a href="{{{unsubscribe}}}" style="color: #d4af37; text-decoration: none;">Unsubscribe</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `.trim();

        const text = `${subject}\n\n${content}\n\n---\nYou're receiving this because you subscribed to Imperium newsletters.`;

        let result;
        
        if (testMode) {
            result = await resendService.sendTestEmail(
                testEmail,
                subject,
                html,
                text
            );
        } else {
            result = await resendService.sendNewsletter(
                recipients,
                subject,
                html,
                text
            );
        }

        if (!result.success) {
            return NextResponse.json({ 
                error: 'Failed to send newsletter',
                details: result.error 
            }, { status: 500 });
        }

        if (!testMode && newsletter) {
            await supabaseAdmin
                .from('newsletters')
                .update({
                    published: true,
                    sent_at: new Date().toISOString(),
                    resend_batch_id: result.data?.id || null,
                    recipient_count: recipients.length
                })
                .eq('id', newsletterId);
        }

        return NextResponse.json({
            success: true,
            message: testMode ? 'Test email sent' : 'Newsletter sent',
            recipientCount: recipients.length,
            emailId: result.data?.id
        });

    } catch (error: any) {
        console.error('Newsletter Send Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const newsletterId = searchParams.get('newsletterId');

        if (!newsletterId) {
            const { data: newsletters, error } = await supabaseAdmin
                .from('newsletters')
                .select('id, title, created_at, sent_at, recipient_count, resend_batch_id')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            return NextResponse.json({ newsletters: newsletters || [] });
        }

        const { data: newsletter, error } = await supabaseAdmin
            .from('newsletters')
            .select('*')
            .eq('id', newsletterId)
            .single();

        if (error) throw error;

        let stats = null;
        if (newsletter?.resend_batch_id) {
            stats = await resendService.getEmailStats(newsletter.resend_batch_id);
        }

        return NextResponse.json({ newsletter, stats });

    } catch (error: any) {
        console.error('Newsletter GET Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
