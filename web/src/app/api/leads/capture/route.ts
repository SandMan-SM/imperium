export const dynamic = 'force-static';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { email, source, principle_accessed, firstName, lastName } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        // Check if lead already exists
        const { data: existingLead, error: checkError } = await supabase
            .from('leads')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (existingLead) {
            return NextResponse.json({
                message: "Email already captured",
                success: true
            });
        }

        // Create lead record
        const { data: lead, error: insertError } = await supabase
            .from('leads')
            .insert({
                email: email.toLowerCase(),
                source,
                principle_accessed,
                first_name: firstName || null,
                last_name: lastName || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error('Database error creating lead:', insertError);
            return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
        }

        // Send welcome email with principle access (you would integrate with your email service)
        try {
            // This would integrate with your email service (SendGrid, Mailgun, etc.)
            // For now, we'll just log it
            console.log(`Welcome email would be sent to ${email} for principle ${principle_accessed}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            message: "Lead captured successfully",
            lead,
            success: true
        });

    } catch (error) {
        console.error('Lead capture error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
        }

        const { data: lead, error } = await supabase
            .from('leads')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
        }

        return NextResponse.json({ lead });

    } catch (error) {
        console.error('Fetch lead error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}