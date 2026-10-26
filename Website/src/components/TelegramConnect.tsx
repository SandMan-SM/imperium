"use client";

import { useState } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Connects a member's Telegram account to their membership.
 *
 * The bot cannot ask Supabase who somebody is, so the website issues a code.
 * The member sends that code to the bot with `/link`, and the bot trades it
 * for an answer from the website. The code is the proof — the address itself
 * is never the credential, and it never reaches the bot.
 */

type LinkState = {
    status: "idle" | "loading" | "ready" | "error";
    token?: string;
    telegramUrl?: string | null;
    message?: string;
};

export function TelegramConnect() {
    const [state, setState] = useState<LinkState>({ status: "idle" });
    const [copied, setCopied] = useState(false);

    const requestCode = async () => {
        setState({ status: "loading" });

        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) {
                setState({ status: "error", message: "Sign in to connect Telegram." });
                return;
            }

            // The button must never hang: the request is given a deadline and
            // the button returns to its resting state when it passes.
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 15000);

            let response: Response;
            try {
                response = await fetch("/api/telegram/link-code", {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                    signal: controller.signal,
                });
            } finally {
                window.clearTimeout(timeout);
            }

            if (response.status === 402) {
                setState({ status: "error", message: "This address does not have an active membership." });
                return;
            }

            if (!response.ok) {
                setState({ status: "error", message: "The access code could not be created. Try again in a moment." });
                return;
            }

            const body = (await response.json()) as { token?: string; telegramUrl?: string | null };
            if (!body.token) {
                setState({ status: "error", message: "The access code could not be created. Try again in a moment." });
                return;
            }

            setState({ status: "ready", token: body.token, telegramUrl: body.telegramUrl ?? null });
        } catch {
            setState({ status: "error", message: "The access code could not be created. Try again in a moment." });
        }
    };

    const copy = async () => {
        if (!state.token) return;
        try {
            await navigator.clipboard.writeText(state.token);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="member-gate">
            <div>
                <p className="editorial-kicker">TELEGRAM</p>
                <p>
                    Read the sequence in Telegram. The bot opens every phase for a
                    member — send it the access code below with
                    <strong> /link</strong>.
                </p>
            </div>
            <div className="member-gate-actions">
                {state.status === "ready" && state.token && (
                    <>
                        <code className="member-code">{state.token}</code>
                        <button type="button" className="editorial-button editorial-button-outline" onClick={() => void copy()}>
                            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                            {copied ? "Copied" : "Copy the code"}
                        </button>
                    </>
                )}

                {state.status === "ready" && state.telegramUrl && (
                    <a className="editorial-button" href={state.telegramUrl} target="_blank" rel="noopener noreferrer">
                        <Send size={16} aria-hidden="true" />
                        Open the bot
                    </a>
                )}

                {state.status !== "ready" && (
                    <button
                        type="button"
                        className="editorial-button"
                        onClick={() => void requestCode()}
                        disabled={state.status === "loading"}
                    >
                        {state.status === "loading" && <Loader2 size={16} aria-hidden="true" className="animate-spin" />}
                        {state.status === "loading" ? "Creating the code" : "Connect Telegram"}
                    </button>
                )}

                {state.status === "error" && (
                    <span className="member-gate-note">{state.message}</span>
                )}

                {state.status === "ready" && (
                    <span className="member-gate-note">
                        {state.telegramUrl
                            ? "Open the bot and the code is passed for you. Or send it to the bot with /link."
                            : "Send the code to the bot with /link."}
                    </span>
                )}
            </div>
        </div>
    );
}
