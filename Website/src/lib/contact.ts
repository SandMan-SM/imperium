import { SUCCESS_EMPIRE } from "@/lib/success-empire";

/**
 * The channels the site publishes for a reader who wants to reach a person.
 *
 * The privacy policy named an address on a domain that is parked for sale
 * and cannot receive mail — imperium.ai publishes a null MX and answers on
 * an Aftermarket parking page — and the terms policy named no channel at
 * all, only the words "contact us at". A contact promise the site cannot
 * keep is worse than no promise, and these are the two pages where a
 * promise has to be kept.
 *
 * The number itself is owned by `src/lib/success-empire.ts` and is read
 * from there, so the number still has exactly one home. When the operator
 * names a mailbox she watches, it goes here — and nowhere else.
 */
export const CONTACT = {
    organisation: "Imperium Strategic Intelligence",
    /** The number the links dial. */
    phone: SUCCESS_EMPIRE.phone,
    /** The number a reader reads. */
    displayPhone: SUCCESS_EMPIRE.displayPhone,
    /** The link that opens a dialer. */
    tel: `tel:${SUCCESS_EMPIRE.phone}`,
} as const;
