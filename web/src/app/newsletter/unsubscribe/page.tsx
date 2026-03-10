import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default async function UnsubscribePage({ searchParams }: { searchParams: { email?: string } }) {
    const email = searchParams.email;

    if (!email) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-light text-white mb-2">Invalid Request</h1>
                    <p className="text-white/40">No email provided for unsubscription.</p>
                </div>
            </div>
        );
    }

    // Unsubscribe the user
    const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('email', email.toLowerCase());

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-light text-white mb-2">Error</h1>
                    <p className="text-white/40 mb-4">Failed to unsubscribe. Please try again.</p>
                    <a href="/newsletter" className="text-imperium-gold hover:text-white transition-colors">
                        Return to Newsletter
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h1 className="text-3xl font-light text-white mb-4">Successfully Unsubscribed</h1>
                <p className="text-white/40 mb-8">
                    You have been unsubscribed from the Imperium Intelligence Brief.
                    You will no longer receive emails from us.
                </p>

                <div className="space-y-4">
                    <a
                        href="/newsletter"
                        className="block w-full bg-imperium-gold text-imperium-bg py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider text-center hover:bg-white transition-all"
                    >
                        Return to Newsletter
                    </a>

                    <a
                        href="/"
                        className="block w-full border border-imperium-gold/30 text-imperium-gold py-3 px-6 rounded-lg font-bold text-sm uppercase tracking-wider text-center hover:border-imperium-gold/50 hover:text-white transition-all"
                    >
                        Return to Home
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-imperium-border/50">
                    <p className="text-white/20 text-xs">
                        Imperium Strategic Intelligence<br />
                        <span className="text-white/40">Building sovereign minds, one brief at a time.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}