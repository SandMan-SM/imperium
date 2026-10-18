import Link from "next/link";
import { archiveCategories } from "@/lib/archive";

export function ArchiveFooter() {
    return (
        <footer className="editorial-footer border-t border-[#d7d7cd] bg-[#f0eee6] text-[#252820]">
            <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-10 py-12 sm:py-14 md:grid-cols-[1.5fr_1fr_0.7fr] md:gap-14">
                    <div>
                        <Link href="/" className="font-serif text-[28px] font-semibold uppercase leading-none tracking-[0.035em]">Imperium</Link>
                        <p className="mt-5 max-w-sm text-[14px] leading-7 text-[#565c50]">
                            A free library of principles, quotes, and practical ideas for thinking, working, and living well.
                        </p>
                    </div>
                    <div>
                        <h2 className="mb-3 text-[14px] font-semibold text-[#252820]">Archive topics</h2>
                        <nav aria-label="Archive collections" className="grid grid-cols-2 gap-x-5 gap-y-1">
                            {archiveCategories.map((category) => (
                                <Link key={category} href={`/archive/?category=${encodeURIComponent(category)}`} className="flex min-h-11 w-fit items-center py-2 text-[14px] text-[#565c50] transition-colors hover:text-[#343f25] hover:underline hover:underline-offset-4">
                                    {category}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div>
                        <h2 className="mb-3 text-[14px] font-semibold text-[#252820]">Explore</h2>
                        <nav aria-label="Footer navigation" className="flex flex-col items-start gap-1">
                            <Link href="/archive/" className="flex min-h-11 items-center py-2 text-[14px] text-[#565c50] transition-colors hover:text-[#343f25] hover:underline hover:underline-offset-4">The Archive</Link>
                            <Link href="/newsletter/" className="flex min-h-11 items-center py-2 text-[14px] text-[#565c50] transition-colors hover:text-[#343f25] hover:underline hover:underline-offset-4">Newsletter</Link>
                            <Link href="/partners/" className="flex min-h-11 items-center py-2 text-[14px] text-[#565c50] transition-colors hover:text-[#343f25] hover:underline hover:underline-offset-4">Partners</Link>
                            <Link href="/mission-statement/" className="flex min-h-11 items-center py-2 text-[14px] text-[#565c50] transition-colors hover:text-[#343f25] hover:underline hover:underline-offset-4">About Imperium</Link>
                        </nav>
                    </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-[#d7d7cd] py-6 text-[14px] leading-6 text-[#62675b] sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Imperium.</p>
                    <p>Free to read. No account required.</p>
                    <nav aria-label="Legal" className="flex items-center gap-5">
                        <Link href="/privacy/" className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">Privacy</Link>
                        <Link href="/terms/" className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">Terms</Link>
                    </nav>
                </div>
                <nav aria-label="Website partners" className="flex flex-wrap gap-x-6 gap-y-2 pb-6 text-[13px] text-[#62675b]">
                    <Link href="/resources/lead-franchise/" className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">Website by Lead Franchise</Link>
                    <Link href="/resources/ais-empire/" className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">AI partner AIS Empire</Link>
                    <Link href="/resources/lead-franchise-ais-empire/" className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">Lead Franchise × AIS Empire</Link>
                    <Link href="/resources/" className="inline-flex min-h-11 items-center hover:underline hover:underline-offset-4">Project resources</Link>
                </nav>
            </div>
        </footer>
    );
}
