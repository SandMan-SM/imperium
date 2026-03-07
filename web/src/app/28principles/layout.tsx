import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
    title: "The 28 Principles — Imperium Elite",
    description: "The complete Imperium operating system. 28 laws forged for the disciplined sovereign.",
};

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
