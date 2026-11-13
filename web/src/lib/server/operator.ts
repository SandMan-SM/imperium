/**
 * The operator's own details — server-side only.
 *
 * The admin console used to hold the operator's personal address in the
 * browser, as the recipient of a newsletter test send. The admin page is a
 * client component, so that address was written into the page's JavaScript
 * bundle and was downloadable by anybody who asked the site for
 * `/admin`'s chunks. A private address does not belong in a public file.
 *
 * The server is the only place that needs it: it is the server that chooses
 * where a test send goes, and it is the server that decides where a reply
 * goes. This module is imported by server code alone and never by a
 * component, so it stays out of the browser bundle.
 */
export const OPERATOR = {
    /**
     * The operator's own mailbox.
     *
     * It receives the test send of the weekly letter, and it is where a
     * reply to any mail the site sends is delivered. The site sends from
     * `newsletter@secretimperium.com`, a domain that publishes no MX, so a
     * reply to the letter the subscriber received has nowhere to go unless
     * the mail carries a reply address of its own.
     */
    email: 'sitanim8@gmail.com',
} as const;
