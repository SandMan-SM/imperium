export default function ShopLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="border-b border-imperium-gold/20 py-14 text-center">
                <div className="h-6 w-32 bg-white/5 rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-64 bg-white/5 rounded-lg mx-auto mb-4 animate-pulse" />
                <div className="h-4 w-80 bg-white/5 rounded mx-auto animate-pulse" />
            </div>
            <div className="container mx-auto px-4 max-w-6xl py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.06] animate-pulse">
                            <div className="aspect-[4/5] bg-white/5" />
                            <div className="p-6">
                                <div className="h-4 bg-white/5 rounded mb-2" />
                                <div className="h-3 bg-white/5 rounded w-3/4 mb-4" />
                                <div className="h-10 bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
