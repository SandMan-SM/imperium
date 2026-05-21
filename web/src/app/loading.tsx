export default function GlobalLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-2 border-imperium-gold/30 border-t-imperium-gold rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-xs uppercase tracking-widest">Loading...</p>
            </div>
        </div>
    );
}
