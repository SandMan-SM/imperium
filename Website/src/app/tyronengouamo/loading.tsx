export default function TyroneLoading() {
    return (
        <div className="archive-site">
            <div className="coaching-hero">
                <div className="archive-wrap coaching-hero-inner">
                    <div>
                        <div className="h-3 w-48 rounded bg-white/10 animate-pulse" />
                        <div className="mt-6 h-14 w-3/4 rounded bg-white/10 animate-pulse" />
                        <div className="mt-5 h-4 w-2/3 rounded bg-white/[0.07] animate-pulse" />
                        <div className="mt-3 h-4 w-1/2 rounded bg-white/[0.07] animate-pulse" />
                        <div className="mt-8 h-12 w-56 rounded bg-white/10 animate-pulse" />
                    </div>
                    <div className="coaching-hero-portrait animate-pulse" />
                </div>
            </div>
            <div className="archive-wrap coaching-section">
                <div className="h-3 w-32 rounded bg-black/[0.06] animate-pulse" />
                <div className="mt-5 h-9 w-2/3 rounded bg-black/[0.06] animate-pulse" />
                <div className="coaching-offers">
                    {[0, 1, 2].map((index) => (
                        <div key={index} className="coaching-offer p-6 animate-pulse">
                            <div className="h-8 w-24 rounded bg-black/[0.06]" />
                            <div className="mt-4 h-5 w-4/5 rounded bg-black/[0.06]" />
                            <div className="mt-3 h-3 w-full rounded bg-black/[0.05]" />
                            <div className="mt-2 h-3 w-3/5 rounded bg-black/[0.05]" />
                            <div className="mt-8 h-12 w-full rounded bg-black/[0.06]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
