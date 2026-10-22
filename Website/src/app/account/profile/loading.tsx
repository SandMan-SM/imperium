export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#030712] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[#0d1117]" />
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f131a] p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#0d1117]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-[#0d1117]" />
                  <div className="h-5 w-48 animate-pulse rounded bg-[#0d1117]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
