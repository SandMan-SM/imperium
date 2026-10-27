export default function LoginLoading() {
  // The sign-in and sign-up pages are part of the paper archive, not the old
  // dark storefront. A member arriving from a Stripe receipt signs in here,
  // so the skeleton has to be the light surface the card sits on.
  return (
    <div className="auth-shell flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full border border-black/[0.08] bg-black/[0.04]" />
          <div className="mx-auto mt-4 h-8 w-32 animate-pulse rounded bg-black/[0.06]" />
        </div>
        <div className="space-y-4 rounded-2xl border border-black/[0.08] bg-white/70 p-6">
          <div className="h-12 animate-pulse rounded-xl bg-black/[0.05]" />
          <div className="h-12 animate-pulse rounded-xl bg-black/[0.05]" />
          <div className="h-12 animate-pulse rounded-xl bg-black/[0.1]" />
        </div>
      </div>
    </div>
  );
}
