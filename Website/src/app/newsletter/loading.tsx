export default function NewsletterLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="text-center mb-12">
                    <div className="h-14 w-80 bg-white/5 rounded-2xl mx-auto mb-4 animate-pulse" />
                    <div className="h-4 w-96 bg-white/5 rounded mx-auto animate-pulse" />
                </div>
                <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-8 animate-pulse">
                            <div className="h-5 bg-white/5 rounded mb-3 w-2/3" />
                            <div className="h-3 bg-white/5 rounded mb-6 w-full" />
                            <div className="aspect-video bg-white/5 rounded-xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
