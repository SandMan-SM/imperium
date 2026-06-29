"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { STRIPE_CHECKOUT_URL } from "@/lib/brand";

type NewsletterPost = {
    id: string;
    title: string;
    content?: string | null;
    created_at?: string | null;
    is_public?: boolean | null;
};

function formatDate(value?: string | null) {
    if (!value) return "New";
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function excerpt(content?: string | null, max = 190) {
    const text = (content || "No content available.").replace(/\s+/g, " ").trim();
    if (text.length <= max) return text;
    return `${text.slice(0, max).trim()}...`;
}

function AccessPill({ isPublic }: { isPublic?: boolean | null }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-imperium-gold/20 bg-imperium-gold/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gradient-gold">
            <span className="h-1.5 w-1.5 rounded-full gradient-gold" />
            {isPublic ? "Public Brief" : "Premium Brief"}
        </span>
    );
}

function PostCard({ post, featured = false }: { post: NewsletterPost; featured?: boolean }) {
    if (featured) {
        return (
            <article className="relative overflow-hidden rounded-2xl border border-imperium-gold/20 bg-white/[0.035] p-6 sm:p-8 md:p-10 text-left shadow-[0_18px_70px_rgba(0,0,0,0.32)]">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#fff2a6]/55 to-transparent" />
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                        <CalendarDays className="h-4 w-4 text-imperium-gold/70" />
                        {formatDate(post.created_at)}
                    </div>
                    <AccessPill isPublic={post.is_public} />
                </div>

                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-gradient-gold">Latest Dispatch</p>
                <h2 className="mb-5 text-2xl sm:text-3xl md:text-4xl font-light leading-tight text-white">
                    {post.title}
                </h2>
                <p className="max-w-2xl text-sm sm:text-base font-light leading-relaxed text-white/55">
                    {excerpt(post.content, 320)}
                </p>
            </article>
        );
    }

    return (
        <article className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 text-left transition-all duration-300 hover:border-imperium-gold/25 hover:bg-white/[0.04]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                    {formatDate(post.created_at)}
                </span>
                <span className="h-1.5 w-1.5 rounded-full gradient-gold opacity-70" />
            </div>
            <h3 className="mb-3 text-lg font-semibold leading-snug text-white group-hover:text-imperium-gold transition-colors">
                {post.title}
            </h3>
            <p className="text-sm font-light leading-relaxed text-white/45">
                {excerpt(post.content)}
            </p>
        </article>
    );
}

export function NewsletterPosts({
    isPremium,
    isLoggedIn,
    limit = 5,
    archive = false,
}: {
    isPremium: boolean;
    isLoggedIn: boolean;
    limit?: number;
    archive?: boolean;
}) {
    const [posts, setPosts] = useState<NewsletterPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from("newsletters")
                    .select("*")
                    .eq("published", true)
                    .order("created_at", { ascending: false })
                    .limit(limit);

                setPosts(data || []);
            } catch (error) {
                console.error("Error fetching newsletters:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, [limit]);

    const [featured, rest] = useMemo(() => [posts[0], posts.slice(1)], [posts]);

    if (loading) {
        return (
            <div className="py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-imperium-gold" />
                <p className="mt-4 text-sm font-light text-white/35">Loading intelligence...</p>
            </div>
        );
    }

    if (!posts.length) {
        return (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 text-center">
                <h2 className="mb-3 text-2xl text-white">No Briefs Published Yet</h2>
                <p className="text-sm font-light text-white/40">The archive will populate as dispatches are published.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {!archive && featured && <PostCard post={featured} featured />}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gradient-gold">
                        {archive ? "Complete Archive" : "Recent Briefs"}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-light text-white">
                        {archive ? "The Last 10 Dispatches" : "Five Signals Worth Reading"}
                    </h2>
                </div>
                {!archive && (
                    <Link href="/newsletter/archive" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/45 hover:text-white transition-colors">
                        Full Archive <ArrowRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {(archive ? posts : rest).map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {!isPremium && isLoggedIn && posts.some((post) => !post.is_public) && (
                <div className="rounded-2xl border border-imperium-gold/20 bg-imperium-gold/5 p-6 text-center">
                    <Crown className="mx-auto mb-4 h-8 w-8 text-imperium-gold" />
                    <h3 className="mb-3 text-xl text-white">Unlock Premium Dispatches</h3>
                    <p className="mx-auto mb-5 max-w-lg text-sm font-light text-white/45">
                        Some archive entries are reserved for premium members with full access to the 28 Principles.
                    </p>
                    <a
                        href={STRIPE_CHECKOUT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex rounded-full px-6 py-3 text-[11px]"
                    >
                        Upgrade to Premium
                    </a>
                </div>
            )}
        </div>
    );
}
