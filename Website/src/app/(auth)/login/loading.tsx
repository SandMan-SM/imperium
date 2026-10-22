export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-gray-800" />
          <div className="mx-auto mt-4 h-8 w-32 animate-pulse rounded bg-gray-800" />
        </div>
        <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-[#0f131a] p-6">
          <div className="h-12 animate-pulse rounded-xl bg-gray-800" />
          <div className="h-12 animate-pulse rounded-xl bg-gray-800" />
          <div className="h-12 animate-pulse rounded-xl bg-[#d4af37]" />
        </div>
      </div>
    </div>
  );
}
