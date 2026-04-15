export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { resendService } from '@/lib/resend';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

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
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%;">
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #222222;">
                            <h1 style="margin: 0; color: #d4af37; font-size: 24px; font-weight: 600; letter-spacing: 0.2em;">IMPERIUM</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 22px; font-weight: 500;">Welcome to the Network</h2>
                            <p style="color: #a0a0a0; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
                                Your directive has been received. You are now connected to the Imperium Intelligence Brief — strategic analysis and the 28 Principles delivered directly to your inbox.
                            </p>
                            <p style="color: #a0a0a0; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0;">
                                No noise. No marketing. Just leverage.
                            </p>
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color: #d4af37; border-radius: 8px; padding: 14px 28px;">
                                        <a href="https://imperiumhq.com/28principles" style="color: #0a0a0a; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 0.1em; text-transform: uppercase;">Explore the 28 Principles</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 40px; background-color: #0a0a0a; border-top: 1px solid #222222;">
                            <p style="margin: 0; color: #555555; font-size: 12px; text-align: center;">
                                You're receiving this because you joined the Imperium intelligence network.
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

        const text = `Welcome to the Network\n\nYour directive has been received. You are now connected to the Imperium Intelligence Brief.\n\nNo noise. No marketing. Just leverage.\n\nhttps://imperiumhq.com/28principles`;

        const result = await resendService.sendEmail({
            to: email.toLowerCase(),
            subject: 'Welcome to Imperium — Directive Received',
            html,
            text,
        });

        if (!result.success) {
            console.error('Welcome email failed:', result.error);
            // Don't fail the request — subscriber is already saved to DB
            return NextResponse.json({ success: true, emailSent: false });
        }

        return NextResponse.json({ success: true, emailSent: true });
    } catch (error: any) {
        console.error('Newsletter Welcome Error:', error);
        // Don't fail — subscriber is already saved
        return NextResponse.json({ success: true, emailSent: false });
    }
}
