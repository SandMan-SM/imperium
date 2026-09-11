export default function UnsubscribeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-gray-800" />
        <div className="mx-auto h-8 w-64 animate-pulse rounded bg-gray-800" />
        <div className="mx-auto h-5 w-96 animate-pulse rounded bg-gray-800" />
      </div>
    </div>
  );
}
