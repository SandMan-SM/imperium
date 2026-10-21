import { NextResponse } from 'next/server';
import { unsubscribeEmail } from '@/lib/server/unsubscribe';

export const dynamic = 'force-dynamic';

/**
 * RFC 8058 one-click unsubscribe endpoint.
 *
 * Mail clients that support the `List-Unsubscribe-Post:
 * List-Unsubscribe=One-Click` header POST to this URL with no session and no
 * confirmation page. It performs exactly the same suppression writes as the
 * landing page, so an address that unsubscribes through the native button
 * stops receiving mail exactly like one that clicks the link in the footer.
 *
 * The address travels as a query parameter because the header URL is built
 * per recipient — there is no other way to identify who is unsubscribing
 * when the request carries no body.
 */
async function handle(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email) {
    return new NextResponse('Missing email', { status: 400 });
  }

  const result = await unsubscribeEmail(email);
  if (!result.ok) {
    console.error('[unsubscribe] one-click unsubscribe failed:', result.error);
    return new NextResponse('Unsubscribe failed', { status: 500 });
  }

  return new NextResponse('Unsubscribed', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export const POST = handle;

/**
 * A GET here is a mail client or a human following the header URL
 * directly. Show the landing page instead of a bare string.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email') ?? '';
  const target = new URL('/newsletter/unsubscribe', url.origin);
  if (email) target.searchParams.set('email', email);
  return NextResponse.redirect(target);
}
