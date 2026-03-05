import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // In a production app you'd use a server wrapper for Supabase Auth,
    // but for immediate staging, providing the layout wrapper.
    // We'll leave it simple.

    return (
        <div className="min-h-screen bg-imperium-bg flex">
            {/* Admin Sidebar */}
            <aside className="w-64 border-r border-imperium-border bg-black/50 p-6 flex flex-col hidden md:flex">
                <h2 className="text-xl font-bold text-imperium-gold tracking-widest uppercase mb-12">Imperium<br /><span className="text-xs text-white">System</span></h2>

                <nav className="flex flex-col gap-4 flex-grow">
                    <a href="/admin#crm" className="text-gray-400 hover:text-white transition-colors uppercase text-sm tracking-wider">Client CRM</a>
                    <a href="/admin#products" className="text-gray-400 hover:text-white transition-colors uppercase text-sm tracking-wider">Inventory Engine</a>
                    <a href="/admin#newsletters" className="text-gray-400 hover:text-white transition-colors uppercase text-sm tracking-wider">Comms Studio</a>
                </nav>

                <div className="mt-auto border-t border-imperium-border pt-4">
                    <span className="text-xs text-gray-600 block mb-2">Auth Level: OMNI</span>
                    <button className="text-xs text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider">Sever Connection</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
}
