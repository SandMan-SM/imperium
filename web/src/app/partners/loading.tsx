export default function PartnersLoading() {
    return (
        <div className="ip-partner-page">
            {/* The hero is a dark photograph with a shade over it, so the
                skeleton stands in as a dark band — not as a light panel. */}
            <div className="ip-partner-page-hero" style={{ background: "#252c28" }}>
                <div className="archive-wrap ip-partner-page-hero-inner">
                    <div className="h-3 w-40 rounded bg-white/15 animate-pulse" />
                    <div className="mt-4 h-12 w-2/3 rounded bg-white/15 animate-pulse" />
                    <div className="mt-5 h-4 w-full max-w-[560px] rounded bg-white/10 animate-pulse" />
                    <div className="mt-2 h-4 w-4/5 max-w-[560px] rounded bg-white/10 animate-pulse" />
                </div>
            </div>
            <div className="archive-wrap ip-partner-page-directory">
                <div className="ip-partner-page-directory-heading">
                    <div className="h-7 w-64 rounded bg-black/[0.07] animate-pulse" />
                    <div className="h-3 w-40 rounded bg-black/[0.05] animate-pulse" />
                </div>
                <div className="ip-partner-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="ip-partner-card animate-pulse">
                            <div className="absolute inset-0 bg-white/[0.05]" />
                            <div className="ip-partner-card-top">
                                <div>
                                    <div className="h-5 w-32 rounded bg-white/20" />
                                    <div className="mt-2 h-3 w-24 rounded bg-white/15" />
                                </div>
                                <div className="h-10 w-10 rounded bg-white/15" />
                            </div>
                            <div className="ip-partner-card-bottom">
                                <div className="h-3 w-full rounded bg-white/10" />
                                <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
