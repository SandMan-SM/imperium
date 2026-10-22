export default function ShopProductLoading() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image skeleton */}
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-[#0d1117]" />

          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="h-4 w-24 animate-pulse rounded-full bg-[#0d1117]" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-[#0d1117]" />
            <div className="h-6 w-24 animate-pulse rounded bg-[#0d1117]" />
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-[#0d1117]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#0d1117]" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-[#0d1117]" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-xl bg-[#0d1117]" />
          </div>
        </div>
      </div>
    </div>
  );
}
