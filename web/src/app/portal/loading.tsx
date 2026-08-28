export default function PortalLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="text-center mb-12">
                    <div className="h-14 w-64 bg-white/5 rounded-2xl mx-auto mb-4 animate-pulse" />
                    <div className="h-4 w-80 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
                <div className="rounded-2xl border border-imperium-gold/20 bg-white/[0.01] p-8 animate-pulse">
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-12 bg-white/5 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
