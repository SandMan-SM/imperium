"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Mail } from "lucide-react";

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        let mouseOutTimer: NodeJS.Timeout;

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger if mouse is leaving the top of the window (likely to close tab)
            if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                mouseOutTimer = setTimeout(() => {
                    setIsVisible(true);
                }, 100);
            }
        };

        const handleScroll = () => {
            // Also trigger on scroll up (trying to leave page)
            if (window.scrollY < 100) {
                mouseOutTimer = setTimeout(() => {
                    setIsVisible(true);
                }, 100);
            }
        };

        // Add event listeners
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', () => clearTimeout(mouseOutTimer));
        window.addEventListener('scroll', handleScroll);

        // Also trigger after 60 seconds of inactivity
        const inactivityTimer = setTimeout(() => {
            setIsVisible(true);
        }, 60000);

        return () => {
            clearTimeout(mouseOutTimer);
            clearTimeout(inactivityTimer);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', () => { });
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/leads/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    source: 'exit_intent',
                    principle_accessed: '01' // Give access to first principle
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                // Set cookie to prevent showing again for 30 days
                document.cookie = "exit_intent_shown=true; max-age=" + 60 * 60 * 24 * 30;
            }
        } catch (error) {
            console.error('Error capturing lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't show if already shown recently
    if (document.cookie.includes('exit_intent_shown=true') || submitted) {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsVisible(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-imperium-bg border border-white/[0.1] rounded-2xl p-6 md:p-8 max-w-md w-full relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-imperium-gold/20 border border-imperium-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Download className="w-8 h-8 text-imperium-gold" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Before You Go...
                            </h2>

                            <p className="text-gray-400 mb-6 leading-relaxed">
                                Get <span className="text-imperium-gold font-bold">FREE access</span> to Principle #1:
                                <span className="text-white block mt-2">"The Law of Deliberate Action"</span>
                            </p>

                            {!submitted ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-imperium-gold focus:ring-1 focus:ring-imperium-gold/50"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-imperium-gold text-black font-bold py-3 px-6 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Get Free Access'}
                                    </button>

                                    <p className="text-xs text-gray-500 text-center">
                                        We respect your privacy. Unsubscribe at any time.
                                    </p>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                        <p className="text-green-400 text-sm">
                                            ✅ Success! Check your email for access to Principle #1.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:scale-105 transition-all"
                                    >
                                        Continue Browsing
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function EmailCaptureWidget() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Show widget after 10 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/leads/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    source: 'widget',
                    principle_accessed: '01'
                }),
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Error capturing lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible || submitted) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-imperium-bg border border-white/[0.1] rounded-lg p-4 shadow-2xl max-w-sm"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-imperium-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-imperium-gold" />
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-1">Get Free Access</h3>
                    <p className="text-xs text-gray-400 mb-4">Sign up for Principle #1 and weekly insights</p>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-imperium-gold"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-imperium-gold text-black text-sm font-bold py-2 px-3 rounded hover:scale-105 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending...' : 'Send'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-xs text-green-400">✅ Check your email!</div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}