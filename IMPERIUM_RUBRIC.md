# IMPERIUM E-COMMERCE CUSTOM RUBRIC

## Buildout Standards

This document defines the comprehensive rubric for all Imperium e-commerce pages.

---

## SHOP PAGE (/shop)

### Minimum Requirements (Must Have)
- [ ] Page loads without errors
- [ ] All product cards render with image, name, price
- [ ] Filter sidebar works (category, size, color, price)
- [ ] Search functionality returns results
- [ ] Pagination or infinite scroll works
- [ ] Add to cart button works for all products
- [ ] Product cards link to detail pages

### Responsive Design
- [ ] Mobile (320px+): Grid adapts to 1-2 columns
- [ ] Tablet (768px+): Grid shows 2-3 columns
- [ ] Desktop (1024px+): Grid shows 3-4 columns
- [ ] Filter drawer on mobile, sidebar on desktop

### Visual Requirements
- [ ] Consistent dark theme with accent colors
- [ ] Product hover effects (scale, shadow)
- [ ] Loading skeletons during data fetch
- [ ] Empty state when no products match filters
- [ ] Smooth filter transitions

### Accessibility
- [ ] All images have descriptive alt text
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast WCAG AA

### Performance
- [ ] Images lazy loaded
- [ ] No render-blocking resources
- [ ] Lighthouse score > 80
- [ ] First contentful paint < 1.5s

### SEO
- [ ] Meta title: "Shop Premium Apparel | Imperium"
- [ ] Meta description: "Browse hoodies, shirts, sweats, and accessories"
- [ ] Open Graph tags
- [ ] Structured data for products

---

## PRODUCT DETAIL PAGE (/shop/[slug])

### Minimum Requirements
- [ ] Product images display (main + gallery)
- [ ] Product name, description, price visible
- [ ] Size selector works (S, M, L, XL, XXL)
- [ ] Color selector works (if variants exist)
- [ ] Quantity selector works
- [ ] Add to cart button functional
- [ ] Buy now button redirects to checkout
- [ ] Size guide modal opens

### Product Information
- [ ] Material/fabric details
- [ ] Care instructions
- [ ] Shipping information
- [ ] Return policy link

### Social Proof
- [ ] Customer reviews display
- [ ] Average rating visible
- [ ] Write review button
- [ ] Photo reviews show

### Related Products
- [ ] "You may also like" section
- [ ] "Complete the look" section

### Visual Requirements
- [ ] Image zoom on hover
- [ ] Size guide tooltip
- [ ] Stock indicator (low stock warning)
- [ ] Discount badge if on sale

### Accessibility
- [ ] Image alt text
- [ ] Form labels for selectors
- [ ] Error messages for validation
- [ ] ARIA labels for icons

---

## CART PAGE (/cart)

### Minimum Requirements
- [ ] All cart items display with correct info
- [ ] Quantity can be updated
- [ ] Items can be removed
- [ ] Subtotal calculates correctly
- [ ] Shipping estimate displays
- [ ] Tax calculates correctly
- [ ] Total displays correctly
- [ ] Proceed to checkout button works

### Promo Codes
- [ ] Promo code input field
- [ ] Apply button functional
- [ ] Invalid code shows error
- [ ] Valid code shows discount
- [ ] Code removal works

### Guest Checkout
- [ ] "Continue as guest" option
- [ ] Email prompt for guest

### Visual Requirements
- [ ] Empty cart state (illustration + CTA)
- [ ] Item image thumbnail
- [ ] Remove button (X icon)
- [ ] Update quantity with +/- buttons

---

## CHECKOUT PAGE (/checkout)

### Minimum Requirements
- [ ] Shipping address form validates
- [ ] Shipping method selection works
- [ ] Payment form (Stripe Elements)
- [ ] Order summary sidebar
- [ ] Place order button processes payment
- [ ] Success page after payment

### Shipping Options
- [ ] Standard shipping (5-7 days)
- [ ] Express shipping (2-3 days)
- [ ] Free shipping threshold notice

### Payment (Stripe)
- [ ] Card number input (Stripe Element)
- [ ] Expiry date input
- [ ] CVC input
- [ ] Billing address (same as shipping toggle)
- [ ] Payment security badges

### Order Summary
- [ ] Item list with images
- [ ] Subtotal
- [ ] Shipping cost
- [ ] Tax
- [ ] Discount applied
- [ ] Total

### Validation
- [ ] Required field validation
- [ ] Email format validation
- [ ] Phone format validation
- [ ] Address validation
- [ ] Payment validation

---

## ACCOUNT PAGES (/account)

### Dashboard (/account)
- [ ] Welcome message with name
- [ ] Quick stats (orders, wishlist items)
- [ ] Recent orders summary
- [ ] Account navigation menu

### Order History (/account/orders)
- [ ] List of past orders
- [ ] Order status badges
- [ ] Order date, number, total
- [ ] View order details button
- [ ] Reorder button
- [ ] Download invoice

### Order Details (/account/orders/[id])
- [ ] Full order information
- [ ] Shipping address
- [ ] Payment method
- [ ] Order timeline
- [ ] Track shipment button

### Wishlist (/account/wishlist)
- [ ] Saved products grid
- [ ] Remove from wishlist
- [ ] Add to cart from wishlist
- [ ] Share wishlist
- [ ] Empty wishlist state

### Addresses (/account/addresses)
- [ ] List of saved addresses
- [ ] Add new address form
- [ ] Edit address
- [ ] Delete address
- [ ] Set default address

### Profile (/account/profile)
- [ ] Edit name, email
- [ ] Change password
- [ ] Phone number
- [ ] Avatar upload

### Email Preferences (/account/emails)
- [ ] Newsletter subscription toggle
- [ ] Order updates toggle
- [ ] Marketing emails toggle

---

## ADMIN PAGES (/admin)

### Dashboard (/admin)
- [ ] Today's orders count
- [ ] Revenue today/week/month
- [ ] Low stock alerts
- [ ] Recent orders list
- [ ] Quick action buttons

### Product Management (/admin/products)
- [ ] Product list table
- [ ] Search products
- [ ] Filter by category
- [ ] Add new product button
- [ ] Edit product
- [ ] Delete product
- [ ] Bulk actions (activate, deactivate)
- [ ] Stock level indicators

### Add/Edit Product (/admin/products/[id])
- [ ] Product name input
- [ ] Description (rich text)
- [ ] Price input
- [ ] Compare-at price (for sales)
- [ ] Category selector
- [ ] Size variants (S-XXL)
- [ ] Color variants
- [ ] Image upload (drag & drop)
- [ ] Inventory quantity
- [ ] Printify ID mapping
- [ ] SEO fields (title, description)
- [ ] Save/Publish buttons

### Order Management (/admin/orders)
- [ ] Orders table with filters
- [ ] Status filters (all, pending, processing, shipped, delivered)
- [ ] Date range filter
- [ ] Search by order number/email
- [ ] View order details
- [ ] Update order status
- [ ] Print packing slip
- [ ] Refund processing

### Customer Management (/admin/customers)
- [ ] Customer list
- [ ] Search by name/email
- [ ] View customer profile
- [ ] Order history per customer
- [ ] Add to newsletter
- [ ] Notes/tags

### Analytics (/admin/analytics)
- [ ] Revenue chart (daily/weekly/monthly)
- [ ] Top products
- [ ] Conversion rate
- [ ] Traffic sources
- [ ] Export reports

### Inventory (/admin/inventory)
- [ ] Stock levels overview
- [ ] Low stock alerts
- [ ] Sync with Printify
- [ ] Bulk update stock

---

## NEWSLETTER PAGES

### Subscribe (/newsletter)
- [ ] Email input
- [ ] First name input (optional)
- [ ] Subscribe button
- [ ] Success message
- [ ] Already subscribed state

### Unsubscribe (/newsletter/unsubscribe)
- [ ] Pre-checked checkbox for confirmation
- [ ] Unsubscribe button
- [ ] Success message

---

## AUTH PAGES

### Login (/login)
- [ ] Email input
- [ ] Password input
- [ ] Remember me checkbox
- [ ] Login button
- [ ] Forgot password link
- [ ] Sign up link
- [ ] Social login (Google)

### Signup (/signup)
- [ ] First name input
- [ ] Last name input
- [ ] Email input
- [ ] Password input
- [ ] Confirm password
- [ ] Terms acceptance checkbox
- [ ] Sign up button
- [ ] Login link

---

## TECHNICAL REQUIREMENTS

### Database (Supabase)
- [ ] All tables created with proper indexes
- [ ] Row level security policies
- [ ] Triggers for updated_at
- [ ] Foreign key relationships
- [ ] Seed data for testing

### API Routes
- [ ] /api/products - CRUD
- [ ] /api/orders - CRUD
- [ ] /api/checkout - Create session
- [ ] /api/customers - CRUD
- [ ] /api/newsletter - Subscribe
- [ ] /api/discounts - Validate

### Integrations
- [ ] Stripe Checkout working
- [ ] Stripe Webhooks handling
- [ ] Supabase Auth working
- [ ] Resend transactional emails

### Performance
- [ ] Images optimized (WebP)
- [ ] CDN configured
- [ ] Caching headers
- [ ] API response < 200ms

---

## DEPLOYMENT CHECKLIST

### Vercel
- [ ] Project created
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL working
- [ ] Analytics enabled

### Production
- [ ] All pages load without errors
- [ ] Checkout flow works end-to-end
- [ ] Stripe payments process
- [ ] Emails send
- [ ] Admin can manage products/orders
