export default function CheckoutLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="h-12 w-64 bg-white/5 rounded-2xl mx-auto mb-12 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-white/5 rounded-xl" />
                        ))}
                        <div className="h-32 bg-white/5 rounded-xl mt-4" />
                    </div>
                    <div className="rounded-2xl border border-imperium-gold/20 bg-white/[0.01] p-8 animate-pulse">
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-4 bg-white/5 rounded w-1/3" />
                                    <div className="h-4 bg-white/5 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                        <div className="h-14 bg-white/5 rounded-xl mt-6" />
                    </div>
                </div>
            </div>
        </div>
    );
}
