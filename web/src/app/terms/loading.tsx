export default function TermsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-3xl py-16">
                <div className="h-14 w-64 bg-white/5 rounded-2xl mx-auto mb-8 animate-pulse" />
                <div className="space-y-4 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${Math.random() * 30 + 70}%` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
