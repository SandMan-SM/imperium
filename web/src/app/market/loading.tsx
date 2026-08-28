export default function MarketLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-6xl py-16">
                <div className="text-center mb-12">
                    <div className="h-14 w-64 bg-white/5 rounded-2xl mx-auto mb-4 animate-pulse" />
                    <div className="h-4 w-80 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 animate-pulse">
                            <div className="h-4 bg-white/5 rounded mb-3" />
                            <div className="h-3 bg-white/5 rounded w-3/4 mb-4" />
                            <div className="h-8 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
