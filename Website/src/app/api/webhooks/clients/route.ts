export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fullName, email, phone, company, notes } = body;

        // Validate
        if (!fullName || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ping Telegram
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
            const message = `🚨 *New Imperium Lead*\n\n*Name*: ${fullName}\n*Email*: ${email}\n*Phone*: ${phone || 'N/A'}\n*Company*: ${company || 'N/A'}\n\n*Notes*:\n${notes || 'None'}`;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_ADMIN_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        }

        return NextResponse.json({ success: true, message: 'Lead recorded and admin notified.' });
    } catch (error) {
        console.error('Clients Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
