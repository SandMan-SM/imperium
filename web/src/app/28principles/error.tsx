"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PrinciplesError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("28 Principles error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 pt-[84px]">
            <div className="text-center max-w-md">
                <h2 className="text-xl font-light text-white uppercase tracking-widest mb-4">
                    Failed to load Principles
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                    There was an issue loading the 28 Principles. Please try again.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-imperium-gold text-black text-xs font-bold tracking-widest uppercase rounded-full hover:bg-white transition-all"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 border border-imperium-gold/30 text-imperium-gold text-xs font-bold tracking-widest uppercase rounded-full hover:bg-imperium-gold/10 transition-all"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
