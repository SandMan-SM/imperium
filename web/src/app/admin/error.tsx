"use client";

import { useEffect } from "react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px] flex items-center justify-center">
            <div className="text-center max-w-md px-4">
                <div className="text-6xl font-serif text-imperium-gold mb-6">!</div>
                <h2 className="text-2xl font-serif text-white mb-4">Admin Error</h2>
                <p className="text-gray-400 mb-8">Something went wrong in the admin dashboard. Please try again.</p>
                <button
                    onClick={reset}
                    className="bg-imperium-gold text-imperium-bg px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
