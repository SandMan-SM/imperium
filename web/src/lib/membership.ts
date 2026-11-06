/**
 * The membership and the referral commission, in one place.
 *
 * The site states two numbers in words — the membership costs twenty a
 * month, and a referral pays thirty per cent of it — and the referral
 * programme pays that commission out of the money that actually arrives.
 * Those numbers used to be written out in a dozen places: the module that
 * does the arithmetic, the brand facts, the coaching copy, the referral
 * page, the member's portal and every "join now" button.
 *
 * They all agreed. **Nothing kept them agreeing.** One price edited in one
 * place and not the other puts the defect straight back, and the buyer
 * finds out at the checkout — or, worse, the site promises a commission of
 * one amount and pays another.
 *
 * So the arithmetic lives here and every surface derives its words from it.
 * The rate is a decimal, the price is in cents, and every label is derived
 * from those two — never typed out.
 *
 * Two traps are closed here on purpose:
 *
 *   - `0.3 * 100` is `30.000000000000004` in binary floating point, so the
 *     percentage is rounded before it is written on a page.
 *   - `2000 * 0.3` is not exactly `600` either, so the commission is
 *     rounded in cents — which is the unit the ledger stores it in.
 *
 * This module holds no secrets and imports nothing, so it is safe to
 * import from a client component as well as from a server one.
 */

/** What the Imperium Elite membership costs a month, in cents. */
export const MEMBERSHIP_PRICE_CENTS = 2000;

/** The share of a referred membership that the referrer earns. */
export const REFERRAL_COMMISSION_RATE = 0.3;

/** The commission one referred membership earns, in cents. */
export const REFERRAL_COMMISSION_CENTS = Math.round(
    MEMBERSHIP_PRICE_CENTS * REFERRAL_COMMISSION_RATE,
);

/** The rate as it is written on a page: "30%". */
export const REFERRAL_COMMISSION_LABEL = `${Math.round(REFERRAL_COMMISSION_RATE * 100)}%`;

/** The commission as it is written on a page: "$6.00". */
export const REFERRAL_COMMISSION_AMOUNT = `$${(REFERRAL_COMMISSION_CENTS / 100).toFixed(2)}`;

/** A dollar figure without noise on it: "20", or "20.50" when it has cents. */
function dollars(cents: number): string {
    const value = cents / 100;
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/** The membership price as a dollar amount, to the cent: "$20.00". */
export const MEMBERSHIP_PRICE_AMOUNT = `$${(MEMBERSHIP_PRICE_CENTS / 100).toFixed(2)}`;

/** The membership price as a bare amount, for a sentence that names it: "$20". */
export const MEMBERSHIP_PRICE = `$${dollars(MEMBERSHIP_PRICE_CENTS)}`;

/** The membership price as a monthly rate: "$20/month". */
export const MEMBERSHIP_PRICE_MONTHLY = `$${dollars(MEMBERSHIP_PRICE_CENTS)}/month`;

/** The membership price as a monthly rate, spaced for display: "$20 / month". */
export const MEMBERSHIP_PRICE_MONTHLY_SPACED = `$${dollars(MEMBERSHIP_PRICE_CENTS)} / month`;

/**
 * The sentence that states what a referral pays.
 *
 * It is here, beside the numbers it is made of, because a promise made of
 * numbers is only true while the numbers hold — and this one holds by
 * construction rather than by remembering.
 */
export const REFERRAL_COMMISSION_NOTE = `${REFERRAL_COMMISSION_LABEL} of the membership — ${REFERRAL_COMMISSION_AMOUNT} on a ${MEMBERSHIP_PRICE_AMOUNT} membership — paid once that membership's payment clears.`;
