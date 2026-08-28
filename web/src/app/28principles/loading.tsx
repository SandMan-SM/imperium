export default function PrinciplesLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-5xl py-16">
                <div className="text-center mb-16">
                    <div className="h-4 w-20 bg-white/5 rounded-full mx-auto mb-6 animate-pulse" />
                    <div className="h-14 w-full max-w-2xl bg-white/5 rounded-2xl mx-auto mb-6 animate-pulse" />
                    <div className="h-5 w-full max-w-xl bg-white/5 rounded-lg mx-auto mb-4 animate-pulse" />
                    <div className="h-5 w-3/4 bg-white/5 rounded-lg mx-auto animate-pulse" />
                </div>
                <div className="space-y-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-imperium-gold/20 bg-white/[0.01] p-8 animate-pulse">
                            <div className="h-5 w-40 bg-white/5 rounded mb-4" />
                            <div className="h-4 w-full bg-white/5 rounded mb-2" />
                            <div className="h-4 w-5/6 bg-white/5 rounded mb-2" />
                            <div className="h-4 w-4/6 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
