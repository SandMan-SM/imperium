"use client";

import dynamic from "next/dynamic";

const ExitIntentPopup = dynamic(() => import("./ExitIntentPopup").then(mod => mod.ExitIntentPopup), { ssr: false });
const EmailCaptureWidget = dynamic(() => import("./ExitIntentPopup").then(mod => mod.EmailCaptureWidget), { ssr: false });

export function ExitIntentWrapper() {
    return (
        <>
            <ExitIntentPopup />
            <EmailCaptureWidget />
        </>
    );
}
