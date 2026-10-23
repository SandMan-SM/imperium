export default function ArchiveLoading() {
    return (
        <div className="archive-site archive-dedicated">
            <div className="archive-wrap py-16">
                <div className="h-12 w-2/3 bg-black/[0.06] rounded mb-6 animate-pulse" />
                <div className="h-4 w-1/2 bg-black/[0.05] rounded mb-12 animate-pulse" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border border-black/[0.08] rounded p-5 animate-pulse">
                            <div className="h-32 w-full bg-black/[0.05] rounded mb-4" />
                            <div className="h-4 w-4/5 bg-black/[0.06] rounded mb-2" />
                            <div className="h-3 w-3/5 bg-black/[0.05] rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
