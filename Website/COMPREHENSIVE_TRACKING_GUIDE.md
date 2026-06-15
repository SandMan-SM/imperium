# Comprehensive Data Tracking Integration Guide

## 🎯 Overview

This guide provides complete instructions for integrating comprehensive data tracking across your Imperium website. The system tracks all user interactions, newsletter engagement, product analytics, and affiliate performance using your updated Supabase schema.

## 📊 Schema Integration

### Your Updated Schema Includes:

**Core Tracking Tables:**
- `user_interactions` - All user interactions and events
- `newsletter_engagement` - Newsletter opens, reads, and engagement
- `live_retention_metrics` - Real-time business metrics
- `profiles` - Enhanced user tracking with revenue and subscription data
- `products` - Product analytics with views, sales, and revenue
- `affiliates` - Affiliate tracking with commissions and earnings

**Key Tracking Fields:**
- `profiles.total_spent` - User lifetime value
- `profiles.gross_revenue` - Revenue attributed to user
- `profiles.purchase_count` - Number of purchases
- `products.views_count` - Product page views
- `products.revenue_generated` - Product revenue
- `affiliates.total_earnings` - Affiliate earnings

## 🚀 Quick Start

### 1. Import Analytics Service

```typescript
import { analytics } from '../lib/analytics';
```

### 2. Initialize Tracking

```typescript
// In your main layout or app component
useEffect(() => {
  // Initialize automatic tracking
  analytics.initAutoTracking(user?.id);
}, [user?.id]);
```

### 3. Manual Tracking

```typescript
// Track newsletter subscription
analytics.trackNewsletterSubscribe('user@example.com', 'homepage_form', userId);

// Track product view
analytics.trackProductView('product-uuid', userId);

// Track affiliate signup
analytics.trackAffiliateSignup('AFF123', 'user@example.com', userId);
```

## 📈 Event Types

### Page Views
```typescript
analytics.trackPageView(userId);
```

### Clicks
```typescript
analytics.trackClick('button-id', 'Button Text', userId);
```

### Form Submissions
```typescript
analytics.trackFormSubmit('newsletter_form', {
  email: 'user@example.com',
  source: 'homepage'
}, userId);
```

### Newsletter Events
```typescript
// Subscription
analytics.trackNewsletterSubscribe('user@example.com', 'modal', userId);

// Unsubscription
analytics.trackNewsletterUnsubscribe('user@example.com', userId);

// Engagement
analytics.trackNewsletterEngagement('newsletter-uuid', {
  user_id: userId,
  opened_at: new Date().toISOString(),
  read_duration_seconds: 120,
  clicked_links: ['link1', 'link2'],
  feedback: 'Great content!'
});
```

### Product Events
```typescript
// Product view
analytics.trackProductView('product-uuid', userId);

// Product purchase
analytics.trackProductPurchase('product-uuid', 49.99, userId);
```

### Affiliate Events
```typescript
// Affiliate signup
analytics.trackAffiliateSignup('AFF123', 'user@example.com', userId);
```

## 🔧 Integration Examples

### Newsletter Component Integration

```typescript
// NewsletterOptin.tsx
import { analytics } from '../lib/analytics';

export default function NewsletterOptin() {
  const handleSubmit = async (email: string) => {
    try {
      // Track the subscription attempt
      analytics.trackNewsletterSubscribe(email, 'newsletter_optin', user?.id);
      
      // Your existing subscription logic
      const response = await subscribeToNewsletter(email);
      
      if (response.success) {
        // Track successful subscription
        analytics.trackFormSubmit('newsletter_subscription', {
          email,
          status: 'success'
        }, user?.id);
      }
    } catch (error) {
      // Track failed subscription
      analytics.trackFormSubmit('newsletter_subscription', {
        email,
        status: 'failed',
        error: error.message
      }, user?.id);
    }
  };
}
```

### Product Page Integration

```typescript
// ProductShowcase.tsx
import { analytics } from '../lib/analytics';

export default function ProductShowcase({ product }) {
  useEffect(() => {
    // Track product view when component mounts
    analytics.trackProductView(product.id, user?.id);
  }, [product.id, user?.id]);

  const handlePurchase = async () => {
    try {
      // Track purchase attempt
      analytics.trackFormSubmit('product_purchase', {
        product_id: product.id,
        product_name: product.name,
        price: product.price
      }, user?.id);

      // Your existing purchase logic
      const result = await processPurchase(product.id);
      
      if (result.success) {
        // Track successful purchase
        analytics.trackProductPurchase(product.id, product.price, user?.id);
      }
    } catch (error) {
      // Track failed purchase
      analytics.trackFormSubmit('product_purchase', {
        product_id: product.id,
        status: 'failed',
        error: error.message
      }, user?.id);
    }
  };
}
```

### Affiliate Component Integration

```typescript
// AffiliateSignup.tsx
import { analytics } from '../lib/analytics';

export default function AffiliateSignup() {
  const handleSubmit = async (formData: any) => {
    try {
      // Track affiliate signup attempt
      analytics.trackAffiliateSignup(formData.affiliateCode, formData.email, user?.id);
      
      // Your existing affiliate logic
      const response = await submitAffiliateApplication(formData);
      
      if (response.success) {
        // Track successful signup
        analytics.trackFormSubmit('affiliate_application', {
          affiliate_code: formData.affiliateCode,
          email: formData.email,
          status: 'success'
        }, user?.id);
      }
    } catch (error) {
      // Track failed signup
      analytics.trackFormSubmit('affiliate_application', {
        affiliate_code: formData.affiliateCode,
        email: formData.email,
        status: 'failed',
        error: error.message
      }, user?.id);
    }
  };
}
```

## 📊 Admin Dashboard Integration

### Analytics Dashboard Component

The `AnalyticsDashboard` component automatically displays:

- **Live Metrics**: Real-time user counts, revenue, and engagement
- **User Interactions**: Page views, clicks, form submissions
- **Product Performance**: Top products, views, sales, revenue
- **Newsletter Analytics**: Opens, engagement, read times
- **Affiliate Performance**: Earnings, commissions, signups

### Custom Analytics Queries

```typescript
// Get user interaction history
const userInteractions = await analytics.getUserInteractions(userId);

// Get newsletter engagement for a user
const newsletterEngagement = await analytics.getUserNewsletterEngagement(userId);

// Get product analytics
const productAnalytics = await analytics.getProductAnalytics(productId);
```

## 🔄 Automatic Tracking

The analytics system automatically tracks:

### Page Views
- Every page visit is tracked with referrer information

### Clicks
- All button and link clicks with element IDs and text

### Form Submissions
- All form submissions with form data (excluding sensitive information)

### Newsletter Interactions
- Subscriptions and unsubscriptions via form detection

### Affiliate Signups
- Affiliate applications via form detection

## 🛡️ Privacy & Security

### Data Protection
- No sensitive data (passwords, credit cards) is tracked
- Email addresses are only tracked for newsletter and affiliate events
- All tracking respects user privacy settings

### GDPR Compliance
- Users can unsubscribe from tracking
- Data can be deleted on request
- No third-party tracking scripts

## 📈 Advanced Analytics

### Custom Event Tracking

```typescript
// Track custom events
analytics.trackInteraction({
  user_id: userId,
  session_id: analytics.getSessionId(),
  page_url: window.location.href,
  event_type: 'custom_event',
  event_data: {
    action: 'premium_upgrade',
    plan: 'yearly',
    amount: 99.99
  },
  timestamp: new Date().toISOString()
});
```

### Session Analytics

```typescript
// Get session information
const sessionId = analytics.getSessionId();

// Track session events
analytics.trackInteraction({
  session_id: sessionId,
  event_type: 'session_start',
  event_data: {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`
  }
});
```

## 🔧 Environment Setup

### Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Migration

Run the user_interactions migration:

```bash
# Apply the migration
npm run db:migrate
```

## 📊 Reporting & Analytics

### Real-time Metrics

The system provides real-time tracking of:

- **User Behavior**: Page views, clicks, form submissions
- **Newsletter Performance**: Subscriptions, opens, engagement
- **Product Analytics**: Views, sales, revenue, conversion rates
- **Affiliate Performance**: Signups, commissions, earnings
- **Business Metrics**: Revenue, user growth, retention

### Custom Reports

Create custom analytics queries using the Supabase functions:

```sql
-- Get user interaction summary
SELECT * FROM get_user_interaction_summary('user-uuid');

-- Get session analytics
SELECT * FROM get_session_analytics('session-uuid');

-- Get website analytics summary
SELECT * FROM get_website_analytics_summary();
```

## 🚨 Troubleshooting

### Common Issues

1. **Tracking Not Working**
   - Check environment variables are set
   - Verify Supabase connection
   - Check browser console for errors

2. **Missing Data**
   - Ensure user is authenticated for user-specific tracking
   - Check form IDs for automatic tracking
   - Verify newsletter form structure

3. **Performance Issues**
   - Analytics tracking is asynchronous
   - Large form submissions are batched
   - Consider rate limiting for high-traffic pages

### Debug Mode

Enable debug logging:

```typescript
// Add to analytics.ts
const enableDebug = process.env.NODE_ENV === 'development';

if (enableDebug) {
  console.log('Tracking:', interaction);
}
```

## 📈 Future Enhancements

### Planned Features

1. **Heatmaps**: Visual click tracking
2. **User Journeys**: Path analysis
3. **A/B Testing**: Track experiment results
4. **Predictive Analytics**: User behavior prediction
5. **Integration APIs**: Connect with external analytics services

### Custom Metrics

Add custom metrics to track:

```typescript
// Track custom business metrics
analytics.trackInteraction({
  event_type: 'business_metric',
  event_data: {
    metric_name: 'customer_satisfaction',
    score: 4.5,
    feedback: 'Great service!'
  }
});
```

## 📞 Support

For questions or issues with the tracking system:

1. Check the console for error messages
2. Verify database connections
3. Review the analytics logs
4. Consult the Supabase documentation

---

**Note**: This tracking system is designed to be privacy-conscious and GDPR-compliant while providing comprehensive insights into user behavior and business performance.