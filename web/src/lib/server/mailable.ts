/**
 * Can this address receive mail?
 *
 * RFC 2606 reserves `example.com`, `example.org`, `example.net` and
 * `example.edu` for documentation, and RFC 6761 reserves `.invalid`,
 * `.test` and `.localhost`. None of them has an MX record, so every message
 * sent to one is a guaranteed hard bounce.
 *
 * That matters here because the subscriber list is written by every capture
 * form on the site — including the automated probes that test those forms.
 * Five such probe addresses were sitting on the Imperium list when this was
 * written, all of them active, all of them undeliverable. The first send of
 * the weekly brief would have been six bounces out of eight recipients, and
 * bounces are counted against the sending domain's reputation: one poisoned
 * list can stop the real subscribers from receiving the letter at all.
 *
 * The rule is simple, and it is enforced in one place so every mailing path
 * — the brief, the test send, the welcome email — cannot drift apart:
 *
 *   A capture is still recorded. Only the sending of mail is refused.
 *
 * A probe address is still worth knowing about: the operator wants to see
 * that the form worked.
 */

/** Domains that are reserved for documentation and cannot receive mail. */
const RESERVED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.edu',
  'invalid',
  'test',
  'localhost',
  'local',
  'example',
]);

/** Suffixes reserved for documentation and testing. */
const RESERVED_SUFFIXES = ['.invalid', '.test', '.localhost', '.local', '.example'];

/**
 * Whether the domain of an address can receive mail.
 *
 * Exported for tests and for the capture pipeline, which asks the question
 * before it asks the hub to deliver a welcome email.
 */
export function isMailableDomain(domain: string): boolean {
  const host = domain.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  if (RESERVED_DOMAINS.has(host)) return false;
  if (RESERVED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return false;
  return true;
}

/**
 * Whether an address can receive mail.
 *
 * The domain is checked, not the whole address: a real mailbox at a reserved
 * domain is still undeliverable, and the local part is not what decides it.
 */
export function isMailableAddress(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at <= 0 || at === trimmed.length - 1) return false;
  return isMailableDomain(trimmed.slice(at + 1));
}
