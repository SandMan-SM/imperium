# Imperium - Strategic Intelligence Platform

A sophisticated Next.js application built with TypeScript, Supabase, and Stripe for delivering premium strategic intelligence and educational content.

## 🚀 Deployment Ready for Vercel

This project is fully configured for Vercel deployment with:

- **Next.js 16.1.6** with TypeScript
- **Node.js 20.x** runtime
- **Vercel configuration** (`vercel.json`) with optimized settings
- **Environment variable validation** for production safety
- **Comprehensive error handling** and monitoring
- **Intelligent caching** for optimal performance

## 📋 Prerequisites

### Environment Variables

Create a `.env.local` file in the `web/` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Authentication
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### Database Setup

1. **Supabase Setup**: 
   - Create a Supabase project
   - Run the migration scripts in `supabase/migrations/`
   - Set up authentication with email/password
   - Configure storage buckets for product images

2. **Stripe Setup**:
   - Create Stripe account
   - Set up products and prices
   - Configure webhooks for payment events

## 🏗️ Project Structure

```
Imperium/
├── web/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities and configuration
│   │   └── styles/       # Global styles
│   ├── public/           # Static assets
│   └── vercel.json       # Vercel configuration
├── supabase/             # Database migrations
├── telegram-bot/         # Telegram integration
└── docs/                # Documentation
```

## 🚀 Deployment Steps

### 1. Local Development

```bash
# Install dependencies
cd web
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 2. Vercel Deployment

1. **Connect to Vercel**:
   - Push to GitHub/GitLab
   - Connect repository to Vercel
   - Vercel will auto-detect Next.js configuration

2. **Environment Variables**:
   - Add all required environment variables in Vercel dashboard
   - Ensure `NEXT_PUBLIC_*` variables are marked as public

3. **Build Settings**:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Post-Deployment

1. **Database Migrations**:
   - Run migrations in Supabase SQL editor
   - Verify tables are created

2. **Stripe Webhooks**:
   - Update webhook URLs to point to your Vercel deployment
   - Test webhook endpoints

3. **Monitoring**:
   - Configure Sentry for error tracking (optional)
   - Set up analytics

## 🔧 Key Features

### ✅ Completed Features

- **Authentication System**: Email/password with Supabase
- **Subscription Management**: Stripe integration with webhooks
- **Admin Dashboard**: Full-featured admin interface
- **Newsletter System**: Automated email campaigns
- **Product Management**: Inventory and Stripe sync
- **Analytics**: Real-time metrics and reporting
- **Error Handling**: Comprehensive error boundaries and logging
- **Caching**: Intelligent caching for optimal performance
- **Security**: Environment validation and input sanitization

### 🎯 Admin Features

- **Analytics Dashboard**: User metrics, revenue tracking
- **CRM System**: User management and search
- **Inventory Management**: Product catalog with Stripe sync
- **Newsletter Studio**: Content creation and scheduling
- **Settings**: System configuration and user management

## 📊 Performance Optimizations

- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Dynamic imports for better loading
- **Caching Strategy**: Multi-layer caching system
- **Bundle Optimization**: Tree shaking and minification
- **Database Optimization**: Efficient queries and indexing

## 🔒 Security Features

- **Environment Validation**: Runtime environment checks
- **Input Sanitization**: Comprehensive data validation
- **Authentication**: Secure session management
- **CORS**: Proper CORS configuration
- **Rate Limiting**: API protection

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (must be 20.x)
   - Verify environment variables are set
   - Ensure TypeScript compilation passes

2. **Database Issues**:
   - Verify Supabase connection
   - Check migration scripts
   - Ensure proper permissions

3. **Stripe Integration**:
   - Verify webhook endpoints
   - Check API keys
   - Test in development mode first

### Monitoring

- **Error Tracking**: Use Sentry for production error monitoring
- **Performance**: Monitor with Vercel Analytics
- **Database**: Use Supabase monitoring tools

## 📞 Support

For deployment issues or questions:

1. Check the [Implementation Guide](web/src/lib/IMPLEMENTATION_GUIDE.md)
2. Review error logs in Vercel dashboard
3. Verify all environment variables are correctly set
4. Test locally before deploying

## 🔄 Maintenance

- **Regular Updates**: Keep dependencies updated
- **Database Backups**: Configure Supabase backups
- **Security Audits**: Regular security reviews
- **Performance Monitoring**: Monitor and optimize performance

---

**Note**: This project is production-ready and optimized for Vercel deployment. All configurations follow best practices for security, performance, and maintainability.