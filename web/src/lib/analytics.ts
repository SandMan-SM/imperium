'use client';

import { createClient } from '@supabase/supabase-js';

// Create a separate client for analytics to avoid conflicts
const analyticsClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface UserInteraction {
    user_id?: string;
    session_id: string;
    page_url: string;
    event_type: 'page_view' | 'click' | 'form_submit' | 'newsletter_subscribe' | 'newsletter_unsubscribe' | 'product_view' | 'product_purchase' | 'affiliate_signup' | 'newsletter_open' | 'newsletter_read';
    event_data: Record<string, any>;
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
}

export interface NewsletterEngagement {
    user_id?: string;
    newsletter_id: string;
    opened_at?: string;
    read_duration_seconds?: number;
    clicked_links?: string[];
    feedback?: string;
}

export interface ProductAnalytics {
    product_id: string;
    views_count: number;
    add_to_cart_count: number;
    purchase_count: number;
    revenue_generated: number;
    conversion_rate: number;
}

export interface AffiliateTracking {
    affiliate_id: string;
    referral_count: number;
    conversion_count: number;
    total_commissions: number;
    pending_commissions: number;
}

class AnalyticsService {
    private supabase = analyticsClient;

    /**
     * Track any user interaction on the website
     */
    async trackInteraction(interaction: UserInteraction): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('user_interactions')
                .insert([{
                    ...interaction,
                    event_data: JSON.stringify(interaction.event_data)
                }]);

            if (error) {
                console.error('Failed to track interaction:', error);
            }
        } catch (error) {
            console.error('Analytics tracking error:', error);
        }
    }

    /**
     * Track newsletter subscription
     */
    async trackNewsletterSubscribe(email: string, source: string, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'newsletter_subscribe',
            event_data: {
                email,
                source,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track newsletter unsubscription
     */
    async trackNewsletterUnsubscribe(email: string, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'newsletter_unsubscribe',
            event_data: {
                email,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track newsletter engagement
     */
    async trackNewsletterEngagement(newsletterId: string, engagement: Partial<NewsletterEngagement>): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('newsletter_engagement')
                .insert([{
                    user_id: engagement.user_id,
                    newsletter_id: newsletterId,
                    opened_at: engagement.opened_at,
                    read_duration_seconds: engagement.read_duration_seconds,
                    clicked_links: engagement.clicked_links || [],
                    feedback: engagement.feedback
                }]);

            if (error) {
                console.error('Failed to track newsletter engagement:', error);
            }
        } catch (error) {
            console.error('Newsletter engagement tracking error:', error);
        }
    }

    /**
     * Track product view
     */
    async trackProductView(productId: string, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'product_view',
            event_data: {
                product_id: productId,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

        // Update product analytics
        await this.updateProductAnalytics(productId, { views_count: 1 });
    }

    /**
     * Track product purchase
     */
    async trackProductPurchase(productId: string, amount: number, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'product_purchase',
            event_data: {
                product_id: productId,
                amount,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });

        // Update product analytics
        await this.updateProductAnalytics(productId, {
            purchase_count: 1,
            revenue_generated: amount
        });
    }

    /**
     * Track affiliate signup
     */
    async trackAffiliateSignup(affiliateCode: string, email: string, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'affiliate_signup',
            event_data: {
                affiliate_code: affiliateCode,
                email,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track form submissions
     */
    async trackFormSubmit(formType: string, formData: Record<string, any>, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'form_submit',
            event_data: {
                form_type: formType,
                form_data: formData,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track page views
     */
    async trackPageView(user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'page_view',
            event_data: {
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track clicks on specific elements
     */
    async trackClick(elementId: string, elementText?: string, user_id?: string): Promise<void> {
        await this.trackInteraction({
            user_id,
            session_id: this.getSessionId(),
            page_url: window.location.href,
            event_type: 'click',
            event_data: {
                element_id: elementId,
                element_text: elementText,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Update product analytics
     */
    private async updateProductAnalytics(productId: string, updates: Partial<ProductAnalytics>): Promise<void> {
        try {
            const { data: currentProduct, error: fetchError } = await this.supabase
                .from('products')
                .select('views_count, purchase_count, revenue_generated')
                .eq('id', productId)
                .single();

            if (fetchError || !currentProduct) {
                console.error('Failed to fetch current product data:', fetchError);
                return;
            }

            const updatedProduct = {
                views_count: (currentProduct.views_count || 0) + (updates.views_count || 0),
                purchase_count: (currentProduct.purchase_count || 0) + (updates.purchase_count || 0),
                revenue_generated: (currentProduct.revenue_generated || 0) + (updates.revenue_generated || 0),
                updated_at: new Date().toISOString()
            };

            const { error: updateError } = await this.supabase
                .from('products')
                .update(updatedProduct)
                .eq('id', productId);

            if (updateError) {
                console.error('Failed to update product analytics:', updateError);
            }
        } catch (error) {
            console.error('Product analytics update error:', error);
        }
    }

    /**
     * Update affiliate tracking
     */
    async updateAffiliateTracking(affiliateId: string, updates: Partial<AffiliateTracking>): Promise<void> {
        try {
            const { data: currentAffiliate, error: fetchError } = await this.supabase
                .from('affiliates')
                .select('total_commissions, total_earnings')
                .eq('id', affiliateId)
                .single();

            if (fetchError || !currentAffiliate) {
                console.error('Failed to fetch current affiliate data:', fetchError);
                return;
            }

            const updatedAffiliate = {
                total_commissions: (currentAffiliate.total_commissions || 0) + (updates.total_commissions || 0),
                total_earnings: (currentAffiliate.total_earnings || 0) + (updates.total_commissions || 0),
                updated_at: new Date().toISOString()
            };

            const { error: updateError } = await this.supabase
                .from('affiliates')
                .update(updatedAffiliate)
                .eq('id', affiliateId);

            if (updateError) {
                console.error('Failed to update affiliate tracking:', updateError);
            }
        } catch (error) {
            console.error('Affiliate tracking update error:', error);
        }
    }

    /**
     * Get session ID for tracking
     */
    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId ?? `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize automatic tracking
     */
    initAutoTracking(user_id?: string): void {
        // Track initial page view
        this.trackPageView(user_id);

        // Track clicks on buttons and links
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const elementId = target.id || target.closest('[id]')?.id;
            const elementText = target.textContent?.trim() || target.getAttribute('aria-label');

            if (elementId) {
                this.trackClick(elementId, elementText || undefined, user_id);
            }
        });

        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target as HTMLFormElement;
            const formData = new FormData(form);
            const formObject: Record<string, any> = {};

            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            this.trackFormSubmit(form.id || 'unknown_form', formObject, user_id);
        });

        // Track newsletter subscriptions
        const newsletterForms = document.querySelectorAll('form[action*="newsletter"]');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', (event) => {
                const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                if (emailInput) {
                    this.trackNewsletterSubscribe(emailInput.value, form.id || 'unknown_form', user_id);
                }
            });
        });

        // Track affiliate signups
        const affiliateForms = document.querySelectorAll('form[action*="affiliate"]');
        affiliateForms.forEach(form => {
            form.addEventListener('submit', (event) => {
                const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                const codeInput = form.querySelector('input[name="affiliate_code"]') as HTMLInputElement;
                if (emailInput && codeInput) {
                    this.trackAffiliateSignup(codeInput.value, emailInput.value, user_id);
                }
            });
        });
    }

    /**
     * Get user interaction history
     */
    async getUserInteractions(userId: string): Promise<UserInteraction[]> {
        try {
            const { data, error } = await this.supabase
                .from('user_interactions')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Failed to fetch user interactions:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('User interactions fetch error:', error);
            return [];
        }
    }

    /**
     * Get newsletter engagement for a user
     */
    async getUserNewsletterEngagement(userId: string): Promise<NewsletterEngagement[]> {
        try {
            const { data, error } = await this.supabase
                .from('newsletter_engagement')
                .select('*')
                .eq('user_id', userId)
                .order('opened_at', { ascending: false });

            if (error) {
                console.error('Failed to fetch newsletter engagement:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Newsletter engagement fetch error:', error);
            return [];
        }
    }

    /**
     * Get product analytics
     */
    async getProductAnalytics(productId: string): Promise<ProductAnalytics | null> {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('views_count, purchase_count, revenue_generated')
                .eq('id', productId)
                .single();

            if (error || !data) {
                console.error('Failed to fetch product analytics:', error);
                return null;
            }

            const conversionRate = data.views_count > 0
                ? (data.purchase_count / data.views_count) * 100
                : 0;

            return {
                product_id: productId,
                views_count: data.views_count || 0,
                add_to_cart_count: 0, // Would need separate tracking
                purchase_count: data.purchase_count || 0,
                revenue_generated: data.revenue_generated || 0,
                conversion_rate: parseFloat(conversionRate.toFixed(2))
            };
        } catch (error) {
            console.error('Product analytics fetch error:', error);
            return null;
        }
    }
}

export const analytics = new AnalyticsService();