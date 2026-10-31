import type { Metadata } from 'next';
import AnalyticsAdminClient from './AnalyticsAdminClient';

export const metadata: Metadata = {
    title: 'Analytics - Imperium Admin',
    description: 'Comprehensive analytics and tracking dashboard',
    robots: { index: false, follow: false },
};

/**
 * The analytics dashboard is a client component.
 *
 * The data it renders comes from `/api/admin/analytics`, which checks the
 * operator's session before it reads anything. It used to be a server
 * component that read the tables itself and rendered them into the HTML for
 * anyone who asked — revenue, subscriber counts and affiliate earnings, at a
 * guessable URL, with no account.
 */
export default function AnalyticsPage() {
    return <AnalyticsAdminClient />;
}
