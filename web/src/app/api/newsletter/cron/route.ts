export const dynamic = 'force-static';

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
    created_at: string;
}

async function sendNewsletter(newsletter: NewsletterData): Promise<{ success: boolean; recipientCount: number; error?: string }> {
    const { data: subs, error: subsErr } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('is_subscribed', true);

    if (subsErr || !subs || subs.length === 0) {
        return { success: false, recipientCount: 0, error: 'No subscribers found' };
    }

    const recipients = subs.map((s: { email: string }) => s.email).filter(Boolean);
    const subject = newsletter.title;
    const content = newsletter.content;

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

    const result = await resendService.sendNewsletter(recipients, subject, html, text);

    if (!result.success) {
        return { success: false, recipientCount: 0, error: result.error?.message || 'Failed to send' };
    }

    await supabaseAdmin
        .from('newsletters')
        .update({
            published: true,
            sent_at: new Date().toISOString(),
            resend_batch_id: result.data?.id || null,
            recipient_count: recipients.length
        })
        .eq('id', newsletter.id);

    return { success: true, recipientCount: recipients.length };
}

export async function GET(req: Request) {
    const cronSecret = req.headers.get('x-vercel-cron-token');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (expectedSecret && cronSecret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: unsentNewsletters, error } = await supabaseAdmin
            .from('newsletters')
            .select('*')
            .eq('published', false)
            .is('sent_at', null)
            .order('created_at', { ascending: true })
            .limit(1);

        if (error) {
            console.error('Cron: Error fetching newsletters:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (!unsentNewsletters || unsentNewsletters.length === 0) {
            return NextResponse.json({ 
                message: 'No newsletters to send',
                processed: 0
            });
        }

        const newsletter = unsentNewsletters[0];
        
        console.log(`Cron: Sending newsletter "${newsletter.title}" (ID: ${newsletter.id})`);

        const result = await sendNewsletter(newsletter);

        if (result.success) {
            console.log(`Cron: Successfully sent to ${result.recipientCount} recipients`);
            return NextResponse.json({
                success: true,
                message: 'Newsletter sent',
                newsletterId: newsletter.id,
                recipientCount: result.recipientCount
            });
        } else {
            console.error(`Cron: Failed to send newsletter: ${result.error}`);
            return NextResponse.json({ 
                error: result.error || 'Failed to send newsletter' 
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return GET(req);
}
