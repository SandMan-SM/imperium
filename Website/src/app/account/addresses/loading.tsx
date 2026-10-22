export default function AddressesLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="text-center mb-12">
                    <div className="h-10 w-48 bg-white/5 rounded-2xl mx-auto mb-4 animate-pulse" />
                    <div className="h-4 w-64 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
                <div className="space-y-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/[0.06]" />
                    ))}
                </div>
            </div>
        </div>
    );
}
