export default function ArchetypeLoading() {
    return (
        <div className="min-h-screen bg-imperium-bg pt-[84px]">
            <div className="container mx-auto px-4 max-w-4xl py-16">
                <div className="h-12 w-64 bg-white/5 rounded-2xl mx-auto mb-8 animate-pulse" />
                <div className="space-y-4 animate-pulse">
                    [
                    <div key={0} className="h-4 bg-white/5 rounded w-full" />
                    <div key={1} className="h-4 bg-white/5 rounded w-11/12" />
                    <div key={2} className="h-4 bg-white/5 rounded w-4/5" />
                    <div key={3} className="h-4 bg-white/5 rounded w-3/5" />
                    <div key={4} className="h-4 bg-white/5 rounded w-5/6" />
                    ]
                </div>
            </div>
        </div>
    );
}
