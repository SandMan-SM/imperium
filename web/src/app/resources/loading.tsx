export default function ResourcesLoading() {
    // The resources surface is its own dark module (#030712 with #0F131A
    // panels), not the paper archive around it. The skeleton has to be the
    // same colour as the page it stands in for, or the reader sees a light
    // flash and then a dark page.
    return (
        <div style={{ background: "#030712", color: "#F4F0E7", padding: "28px 0 0", minHeight: "100vh" }}>
            <div className="mx-auto w-[min(1160px,calc(100%-64px))]">
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                </div>
                <div className="grid items-center gap-10 py-8 md:grid-cols-[1.06fr_.94fr] md:gap-12">
                    <div>
                        <div className="h-3 w-40 rounded bg-[#F0C85A]/40 animate-pulse" />
                        <div className="mt-5 h-12 w-full max-w-[520px] rounded bg-white/10 animate-pulse" />
                        <div className="mt-4 h-4 w-full max-w-[520px] rounded bg-white/[0.07] animate-pulse" />
                        <div className="mt-2 h-4 w-2/3 max-w-[520px] rounded bg-white/[0.07] animate-pulse" />
                        <div className="mt-6 flex gap-3">
                            <div className="h-12 w-40 rounded bg-[#F0C85A]/50 animate-pulse" />
                            <div className="h-12 w-40 rounded border border-[#F0C85A]/40 animate-pulse" />
                        </div>
                    </div>
                    <div className="aspect-square w-full rounded-full border border-[#F0C85A]/30 bg-[#0F131A] animate-pulse md:aspect-square" />
                </div>
                <div className="flex flex-wrap gap-3 border-y border-white/10 py-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 w-32 rounded-lg bg-white/[0.06] animate-pulse" />
                    ))}
                </div>
                <div className="grid gap-[18px] py-10 sm:grid-cols-3">
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
    );
}
