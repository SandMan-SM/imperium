export default function ResourceLoading() {
    // A resource detail page is the same dark module as /resources — the
    // article element itself carries the #030712 surface. A paper skeleton
    // here would flash light behind the title before the dark page lands.
    return (
        <div style={{ background: "#030712", color: "#F4F0E7", padding: "28px 0 0", minHeight: "100vh" }}>
            <div className="mx-auto w-[min(1160px,calc(100%-64px))]">
                <div className="flex items-center gap-3 py-2">
                    <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="grid items-center gap-10 py-10 md:grid-cols-[1.06fr_.94fr] md:gap-12">
                    <div>
                        <div className="h-3 w-36 rounded bg-[#F0C85A]/40 animate-pulse" />
                        <div className="mt-5 h-12 w-full max-w-[520px] rounded bg-white/10 animate-pulse" />
                        <div className="mt-4 h-4 w-full max-w-[520px] rounded bg-white/[0.07] animate-pulse" />
                        <div className="mt-2 h-4 w-3/4 max-w-[520px] rounded bg-white/[0.07] animate-pulse" />
                        <div className="mt-6 flex gap-3">
                            <div className="h-12 w-40 rounded bg-[#F0C85A]/50 animate-pulse" />
                            <div className="h-12 w-40 rounded border border-[#F0C85A]/40 animate-pulse" />
                        </div>
                    </div>
                    <div className="aspect-square w-full rounded-full border border-[#F0C85A]/30 bg-[#0F131A] animate-pulse" />
                </div>
                <div className="space-y-[18px] py-10">
                    <div className="rounded-2xl border border-white/10 bg-[#0F131A] p-7 animate-pulse">
                        <div className="h-3 w-32 rounded bg-[#F0C85A]/40" />
                        <div className="mt-5 h-5 w-3/4 rounded bg-white/10" />
                        <div className="mt-4 h-3 w-full rounded bg-white/[0.07]" />
                        <div className="mt-2 h-3 w-5/6 rounded bg-white/[0.07]" />
                        <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.07]" />
                    </div>
                    <div className="grid gap-[18px] sm:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-[#F0C85A]/20 bg-[#0F131A] p-7 animate-pulse">
                                <div className="h-3 w-10 rounded bg-[#F0C85A]/40" />
                                <div className="mt-5 h-5 w-4/5 rounded bg-white/10" />
                                <div className="mt-3 h-3 w-full rounded bg-white/[0.07]" />
                                <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.07]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
