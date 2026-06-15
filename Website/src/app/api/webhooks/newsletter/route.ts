export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { gmailService } from '@/lib/gmail-service';

/**
 * Expected to be called by n8n or an admin dash trigger
 * Dispatches active campaigns to all active subscribers via Gmail API
 */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        // Simple protection - in prod use proper service role JWT validation or a secure secret
        if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { campaignId } = body;

        if (!campaignId) {
            return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
        }

        // 1. Fetch Campaign
        const { data: campaign, error: cErr } = await supabaseAdmin
            .from('newsletter_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single();

        if (cErr || !campaign) throw new Error('Campaign not found');

        // 2. Fetch Active Subs
        const { data: subs, error: sErr } = await supabaseAdmin
            .from('newsletter_subscribers')
            .select('email')
            .eq('status', 'active');

        if (sErr || !subs) throw new Error('Failed to fetch subscribers');

        // 3. Dispatch Emails via Gmail API
        console.log(`Dispatching [${campaign.subject}] to ${subs.length} subscribers...`);

        // Use Gmail service to send the newsletter
        const result = await gmailService.sendNewsletterToSubscribers(campaignId);

        // 4. Mark Sent
        await supabaseAdmin
            .from('newsletter_campaigns')
            .update({
                sent_status: 'sent',
                updated_at: new Date(),
                sent_count: result.success,
                failed_count: result.failed
            })
            .eq('id', campaignId);

        return NextResponse.json({
            success: true,
            dispatchedTo: subs.length,
            sent: result.success,
            failed: result.failed
        });
    } catch (error: any) {
        console.error('Newsletter Dispatch Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
