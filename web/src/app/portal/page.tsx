"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import AdminDashboard, { UserPortal, PortalLogin } from "../admin/page";

export default function PortalPage() {
    const { user, profile, loading } = useAuth();

    // If still loading auth or profile is not yet fetched, render nothing to avoid flicker
    if (loading || (user && profile === null)) return null;

    // Unauthenticated -> show login UI
    if (!user) return <PortalLogin />;

    // Admins -> render admin dashboard inline (avoid client-side route replace loops)
    if (profile?.is_admin) {
        return <AdminDashboard />;
    }

    const userView = profile?.is_premium || profile?.subscription_status === 'active' ? 'premium' : 'free';

    return <UserPortal userView={userView} />;
}
