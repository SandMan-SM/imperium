export default function AdminLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-[84px]">
            <div className="container mx-auto px-4 max-w-6xl py-16">
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-white/5 rounded-xl shrink-0" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.01]" />
                    ))}
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 animate-pulse">
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {[...Array(4)].map((_, i) => (
                                        <th key={i} className="pb-3"><div className="h-4 bg-white/5 rounded w-20" /></th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-white/[0.04]">
                                        {[...Array(4)].map((_, j) => (
                                            <td key={j} className="py-3"><div className="h-4 bg-white/5 rounded w-full" /></td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
