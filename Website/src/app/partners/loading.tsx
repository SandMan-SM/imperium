export default function PartnersLoading() {
    return (
        <div className="editorial-reading bg-[#191c1d] text-[#eee8dc]">
            <div className="reading-article mx-auto max-w-3xl px-5 py-12 sm:px-8">
                <div className="h-10 w-3/4 bg-white/10 rounded mb-6 animate-pulse" />
                <div className="h-4 w-full bg-white/[0.07] rounded mb-3 animate-pulse" />
                <div className="h-4 w-5/6 bg-white/[0.07] rounded mb-10 animate-pulse" />
                <div className="space-y-3 animate-pulse">
                    [
                    <div key={0} className="h-3 bg-white/[0.06] rounded w-full" />
                    <div key={1} className="h-3 bg-white/[0.06] rounded w-11/12" />
                    <div key={2} className="h-3 bg-white/[0.06] rounded w-4/5" />
                    <div key={3} className="h-3 bg-white/[0.06] rounded w-3/5" />
                    <div key={4} className="h-3 bg-white/[0.06] rounded w-5/6" />
                    <div key={5} className="h-3 bg-white/[0.06] rounded w-2/3" />
                    <div key={6} className="h-3 bg-white/[0.06] rounded w-9/10" />
                    <div key={7} className="h-3 bg-white/[0.06] rounded w-10/12" />
                    ]
                </div>
            </div>
        </div>
    );
}
