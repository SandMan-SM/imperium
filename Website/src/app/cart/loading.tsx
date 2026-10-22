export default function CartLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="h-12 w-48 bg-white/5 rounded-2xl mx-auto mb-12 animate-pulse" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 animate-pulse">
                            <div className="w-20 h-20 bg-white/5 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-white/5 rounded w-1/2" />
                                <div className="h-3 bg-white/5 rounded w-1/3" />
                            </div>
                            <div className="h-8 w-24 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
                <div className="mt-8 rounded-2xl border border-imperium-gold/20 bg-white/[0.01] p-6 animate-pulse">
                    <div className="h-5 w-32 bg-white/5 rounded mb-4" />
                    <div className="h-4 w-full bg-white/5 rounded mb-2" />
                    <div className="h-12 bg-white/5 rounded-xl mt-4" />
                </div>
            </div>
        </div>
    );
}
