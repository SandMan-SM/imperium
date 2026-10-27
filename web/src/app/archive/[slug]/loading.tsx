export default function ArchiveEntryLoading() {
    // The archive entry is a dark reading shell around a light paper article.
    // The skeleton has to carry both: dark chrome, then the paper block the
    // body text sits on.
    return (
        <div className="editorial-reading bg-[#191c1d] text-[#eee8dc]">
            <article className="reading-article">
                <header className="reading-header mx-auto max-w-6xl px-5 pb-10 pt-5 sm:px-8 sm:pb-12 sm:pt-8">
                    <div className="mb-8 flex items-center gap-2 sm:mb-10">
                        <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                        <div className="h-3 w-3 rounded bg-white/10 animate-pulse" />
                        <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
                    </div>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
                        <div className="h-3 w-16 rounded bg-white/[0.07] animate-pulse" />
                    </div>
                    <div className="h-12 w-3/4 rounded bg-white/10 animate-pulse" />
                    <div className="mt-6 h-5 w-full max-w-3xl rounded bg-white/[0.07] animate-pulse" />
                    <div className="mt-2 h-5 w-5/6 max-w-3xl rounded bg-white/[0.07] animate-pulse" />
                </header>

                <div className="reading-artwork mx-auto max-w-6xl px-5 pb-9 sm:px-8 sm:pb-12">
                    <div className="aspect-[20/11] w-full rounded-sm bg-[#292d2c] animate-pulse" />
                </div>

                <div className="reading-paper mx-auto max-w-[800px] bg-[#f7f5ef] px-5 pb-12 pt-9 text-[#252820] sm:px-10 sm:pb-16 sm:pt-12">
                    <div className="mb-9 border-l-2 border-[#a5a184] py-1 pl-5 sm:mb-11 sm:pl-7">
                        <div className="h-8 w-4/5 rounded bg-black/[0.07] animate-pulse" />
                        <div className="mt-4 h-3 w-32 rounded bg-black/[0.05] animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        {[100, 96, 88, 99, 92, 74].map((width, index) => (
                            <div key={index} className="h-4 rounded bg-black/[0.07] animate-pulse" style={{ width: `${width}%` }} />
                        ))}
                    </div>
                    <div className="mt-10 rounded-lg border border-[#d7d7cd] bg-[#eeeee4] p-6 sm:mt-12 sm:p-8">
                        <div className="h-7 w-52 rounded bg-black/[0.08] animate-pulse" />
                        <div className="mt-4 h-4 w-full rounded bg-black/[0.06] animate-pulse" />
                        <div className="mt-2 h-4 w-4/5 rounded bg-black/[0.06] animate-pulse" />
                    </div>
                </div>
            </article>
        </div>
    );
}
