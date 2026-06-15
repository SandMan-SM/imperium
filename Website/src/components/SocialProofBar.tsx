"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

const METRICS = [
    { value: 200, label: "ROI", icon: DollarSign, suffix: "%" },
    { value: 2800, label: "Subscribers", icon: Users, suffix: "+" },
    { value: 99, label: "Efficiency", icon: TrendingUp, suffix: "%" },
];

export function SocialProofBar() {
    return (
        <section className="py-16 bg-imperium-bg">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {METRICS.map((metric, i) => (
                        <MetricCard key={i} metric={metric} delay={i * 0.2} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function SocialProofStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {METRICS.map((metric, i) => (
                <MetricCard key={i} metric={metric} delay={i * 0.2} />
            ))}
        </div>
    );
}

function MetricCard({ metric, delay }: { metric: any; delay: number }) {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-50px" });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isInView) {
            const start = Date.now();
            const duration = 2000; // 2 seconds

            const animateCount = () => {
                const now = Date.now();
                const progress = Math.min((now - start) / duration, 1);

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);

                const current = Math.floor(easeOutQuart * metric.value);
                setCount(current);

                if (progress < 1) {
                    requestAnimationFrame(animateCount);
                } else {
                    setCount(metric.value);
                }
            };

            const timer = setTimeout(animateCount, 100); // Small delay before starting
            return () => clearTimeout(timer);
        }
    }, [isInView, metric.value]);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className="relative group"
        >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent rounded-2xl blur-xl scale-150 group-hover:scale-100 transition-transform duration-1000" />

            {/* Main card */}
            <div className="relative glass-card rounded-2xl p-8 border border-white/[0.08] hover:border-imperium-gold/20 transition-all duration-500 group-hover:shadow-[0_16px_60px_-12px_rgba(212,175,55,0.25)]">
                {/* Circular progress indicator */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto relative">
                        {/* Background circle */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                                fill="none"
                            />
                            {/* Progress circle */}
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="#d4af37"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                                animate={isInView ? { strokeDashoffset: "0" } : {}}
                                transition={{ duration: 2, delay: delay + 0.3, ease: "easeOut" }}
                            />
                        </svg>

                        {/* Icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-imperium-gold/10 border border-imperium-gold/20 rounded-full flex items-center justify-center group-hover:bg-imperium-gold/20 transition-colors">
                                <metric.icon className="w-5 h-5 text-imperium-gold" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Value with counting animation */}
                <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {count.toLocaleString()}{metric.suffix}
                    </div>
                    <div className="text-xs text-white/40 uppercase tracking-[0.2em] font-bold">
                        {metric.label}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StaticClockIcon({ className = "" }: { className?: string }) {
    return (
        <div className={`w-4 h-4 ${className}`}>
            <Clock className="w-full h-full text-imperium-gold" />
        </div>
    );
}

export function UrgencyBanner() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isClient, setIsClient] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const getTimeUntilNext11AM = () => {
        const now = new Date();
        const target = new Date(now);
        target.setHours(11, 0, 0, 0);
        
        if (now >= target) {
            target.setDate(target.getDate() + 1);
        }
        
        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return { hours, minutes, seconds };
    };

    useEffect(() => {
        setIsClient(true);
        setTimeLeft(getTimeUntilNext11AM());

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    // Reset timer to 24 hours until next 11 AM
                    return getTimeUntilNext11AM();
                }
            });
        }, 1000);

        // Handle scroll events to change border opacity
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(timer);
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    const formatTime = (hours: number, minutes: number, seconds: number) => {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Don't render until client-side to avoid hydration mismatch
    if (!isClient) {
        return null;
    }

    return (
        <div className={`fixed top-[72px] left-0 right-0 backdrop-blur-sm z-40 shadow-lg transition-all duration-300 ${isScrolling
            ? 'bg-black/40'
            : 'bg-black/50 hover:bg-black/60'
            }`}>
            <div className="container mx-auto px-2 sm:px-4 py-1.5 sm:py-2">
                <div className="flex items-center justify-center gap-1.5 sm:gap-4 text-[9px] sm:text-xs text-imperium-gold font-bold tracking-wider uppercase">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <StaticClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-imperium-gold hidden sm:inline">New update in:</span>
                        <span className="text-imperium-gold sm:hidden">Update in:</span>
                    </div>
                    <div className="bg-imperium-gold/10 border border-imperium-gold/30 rounded px-1.5 sm:px-2 py-0.5 sm:py-1">
                        <div className="text-imperium-gold font-mono text-[10px] sm:text-xs tracking-wider font-bold">
                            {formatTime(timeLeft.hours, timeLeft.minutes, timeLeft.seconds)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

