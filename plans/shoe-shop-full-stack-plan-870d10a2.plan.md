<!-- 870d10a2-5ea9-4b26-9c73-646cb4f48343 a366a603-be07-4d27-b3d3-4918f18d7eb7 -->
# Modern Full-Stack Shoe Shop Website - Implementation Plan

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for cart/auth state
- **Forms**: React Hook Form + Zod validation
- **Image Optimization**: Next.js Image component with Cloudinary
- **Charts**: Recharts for admin analytics
- **Theme**: Dark/Light mode with ThemeProvider

### Backend

- **API**: Next.js API Routes
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: NextAuth.js v5 with Prisma Adapter
- **File Storage**: Cloudinary for product images
- **Email**: Resend for transactional emails (configured)

### Infrastructure

- **Hosting**: Vercel (frontend) + Railway/Render (backend/DB)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics / Google Analytics

## Design System

### Typography

- **Primary Font**: Inter or Poppins (clean, modern)
- **Headings**: Bold, 24px-48px range
- **Body**: Regular, 16px base with 1.6 line-height
- **Product Names**: Semi-bold, 18-20px

### Color Palette

- **Light Mode**: White, black, red accents with clean minimalist design
- **Dark Mode**: Full dark theme support with proper contrast
- **Primary**: Deep navy/black for elegance
- **Accent**: Red (#DC2626) for highlights and CTAs
- **Background**: White (#FFFFFF) / Dark (#1e1e1e) based on theme
- **Text**: High contrast for accessibility

### Layout Principles

- Clean, minimalist design
- Large product images with zoom and multiple view types (front, side, top, back)
- Mobile-first responsive design with floating island navigation
- Grid-based product listings
- Floating bottom navigation (desktop and mobile)
- Theme switcher for dark/light mode
- Loading spinners and toast notifications throughout

## Core Features & MVP

### Phase 1: MVP (Weeks 1-3)

#### Customer-Facing Features

1. **Product Catalog** ✅ **COMPLETED**

   - ✅ Browse shoes by category (hierarchical categories with parent/child relationships)
   - ✅ Product listing page with responsive grid view
   - ✅ Advanced search with real-time filtering
   - ✅ Filter by category, price range (min/max), featured products
   - ✅ Smart pagination that preserves filters
   - ✅ Product detail page with:
     - ✅ Multiple image views (front, side, top, back, general) with view switcher
     - ✅ Dynamic product details (admin-configurable)
     - ✅ Size selection with stock availability per size
     - ✅ Price display
     - ✅ Stock status indicators
     - ✅ Product description and information
     - ✅ Quick add to cart from product cards
   - ✅ Breadcrumb navigation
   - ✅ Featured product badges

2. **Shopping Cart** ✅ **COMPLETED**

   - ✅ Add/remove items with loading states
   - ✅ Update quantities with increment/decrement buttons
   - ✅ Size selection per item (set when adding)
   - ✅ Cart persistence via Zustand with localStorage
   - ✅ Cart icon with item count badge in navigation
   - ✅ Product links from cart items to product details
   - ✅ Admin restrictions (admins see warning banner)
   - ✅ Empty cart state with "Browse Products" CTA

3. **Checkout Process** ✅ **COMPLETED**

   - ✅ Redirects guests to login with callback URL
   - ✅ Pre-fills user profile data (name, phone)
   - ✅ Saved addresses dropdown (select from saved addresses)
   - ✅ Option to use new address
   - ✅ Shipping address form with validation
   - ✅ Order summary with cart items
   - ✅ Payment method selection (Cash on Delivery + M-Pesa)
   - ✅ Order confirmation/tracking page after checkout
   - ✅ Admin restrictions (admins cannot place orders)
   - ✅ Loading states on submit button

4. **User Accounts** ✅ **COMPLETED**

   - ✅ Registration/Login with form validation
   - ✅ Redirects logged-in users away from auth pages
   - ✅ Profile management with name and phone
   - ✅ Order history with status tracking
   - ✅ Address book with CRUD operations
   - ✅ Set default address
   - ✅ Admin profile with dashboard stats (instead of orders/addresses)
   - ✅ Smart navigation (hides login/register when logged in)

#### Admin Features

1. **Dashboard** ✅ **COMPLETED & ENHANCED**

   - ✅ Overview stats (total revenue, orders, customers, products)
   - ✅ Revenue breakdown (today, this week, this month)
   - ✅ Interactive revenue chart (last 7 days) with Recharts
   - ✅ Order status breakdown (pending, processing, shipped, delivered)
   - ✅ Recent orders list (last 10) with status badges
   - ✅ Stock alerts (low stock and out of stock warnings)
   - ✅ Pending orders notification
   - ✅ Quick action buttons
   - ✅ Modern, professional UI with icons and color coding

2. **Product Management** ✅ **COMPLETED & ENHANCED**

   - ✅ Full CRUD operations for products
   - ✅ Multiple image uploads with Cloudinary
   - ✅ Image view types (front, side, top, back, general)
   - ✅ Image reordering and deletion
   - ✅ Dynamic product details (admin can add/remove custom specs)
   - ✅ Size management with individual stock per size
   - ✅ Bulk add common sizes
   - ✅ Category management (hierarchical CRUD)
   - ✅ Stock validation and warnings
   - ✅ Product deletion protection (prevents deletion of products with orders)
   - ✅ SKU uniqueness validation
   - ✅ Featured product toggle

3. **Order Management** ✅ **COMPLETED**

   - ✅ View all orders with pagination
   - ✅ Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
   - ✅ Order details view with customer info
   - ✅ Filter by status (dropdown)
   - ✅ Search by order number, user email, or name
   - ✅ Order status badges with color coding
   - ✅ Revenue calculation (excludes pending orders)
   - ✅ Payment information display

#### Payment Integration ✅ **COMPLETED**

- ✅ **Cash on Delivery**: Implemented as default option with order creation
- ✅ **M-Pesa Integration**: 
  - ✅ Lipa na M-Pesa Online API structure
  - ✅ STK Push initiation endpoint (`/api/payments/mpesa/initiate`)
  - ✅ Payment callback webhook endpoint (`/api/payments/mpesa/callback`)
  - ✅ Transaction status tracking in database
  - ⚠️ **Note**: Requires M-Pesa API credentials in environment variables for production

### Phase 2: Enhancements (Weeks 4-6)

1. **Enhanced Product Features**

   - Product reviews and ratings
   - Wishlist/favorites
   - Recently viewed products
   - Related/recommended products
   - Product variants (colors)
   - Advanced filtering (brand, color, material)

2. **Improved UX**

   - Loading states and skeletons
   - Error boundaries
   - Toast notifications
   - Empty states
   - Optimistic UI updates

3. **Order Enhancements**

   - Order tracking page
   - Email notifications (order confirmation, shipping updates)
   - Order cancellation by customer
   - Return/refund requests

4. **Admin Enhancements**

   - Bulk product operations
   - Inventory alerts (low stock)
   - Sales reports and analytics
   - Customer management
   - Coupon/discount codes

### Phase 3: Advanced Features (Weeks 7-8)

1. **Marketing Features**

   - Newsletter subscription
   - Promotional banners
   - Flash sales countdown
   - Product badges (New, Sale, Popular)

2. **Performance & SEO**

   - Server-side rendering for product pages
   - Meta tags and Open Graph
   - Sitemap generation
   - Image optimization
   - Lazy loading

3. **Advanced Admin**

   - Multi-user admin with roles
   - Activity logs
   - Export orders/reports
   - Stock movement history

## Database Schema (MongoDB with Prisma) ✅ **IMPLEMENTED**

```
- Users (id, email, password_hash, name, phone, role, created_at, updated_at)
- Products (id, name, description, price, category_id, brand, images[], stock, sku, featured, created_at, updated_at)
- ProductImages (id, product_id, url, view_type, alt, sort_order, created_at) ✅ NEW
- ProductDetails (id, product_id, label, value, sort_order, created_at, updated_at) ✅ NEW
- Categories (id, name, slug, parent_id, image_url, created_at) - Hierarchical
- ProductSizes (id, product_id, size, stock, created_at)
- CartItems (id, user_id, product_id, size, quantity, created_at, updated_at)
- Orders (id, user_id, order_number, status, total, subtotal, shipping_cost, payment_method, shipping_address, phone, created_at, updated_at)
- OrderItems (id, order_id, product_id, product_name, size, quantity, price, created_at)
- Payments (id, order_id, mpesa_transaction_id, mpesa_receipt_number, phone_number, amount, status, callback_data, created_at, updated_at)
- Addresses (id, user_id, label, full_name, phone, address_line1, address_line2, city, postal_code, is_default, created_at)
- Accounts & Sessions (NextAuth.js models)
```

✅ **Schema Features:**
- MongoDB with ObjectId types
- Cascade deletions for related data
- Hierarchical categories with parent/child relationships
- Multiple product images with view types
- Dynamic product details

## File Structure

```
kickszone/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (shop)/            # Public shop routes
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   ├── admin/             # Admin routes (protected)
│   ├── api/               # API routes
│   └── layout.tsx
├── components/
│   ├── ui/                # shadcn components
│   ├── product/
│   ├── cart/
│   └── admin/
├── lib/
│   ├── db/                # Prisma client
│   ├── auth/              # Auth utilities
│   ├── payments/          # M-Pesa integration
│   └── utils/
├── prisma/
│   └── schema.prisma
├── public/
│   └── images/
└── types/
```

## Key Implementation Files ✅ **IMPLEMENTED**

1. **Prisma Schema**: `prisma/schema.prisma` - MongoDB models with all relationships
2. **Product Components**: 
   - `components/product/ProductCard.tsx` - Card with quick add
   - `components/product/ProductDetailClient.tsx` - Detail page client component
   - `components/product/ProductImageViewer.tsx` - Multi-view image viewer
   - `components/product/ProductFilters.tsx` - Search and filter UI
3. **Cart Store**: `lib/stores/cart-store.ts` - Zustand cart state with persistence
4. **M-Pesa Service**: `app/api/payments/mpesa/` - Payment integration routes
5. **Admin Dashboard**: `app/admin/dashboard/page.tsx` - Enhanced with charts and analytics
6. **Admin Components**:
   - `components/admin/ProductImageUpload.tsx` - Multi-image uploader
   - `components/admin/ProductDetailsManager.tsx` - Dynamic details manager
   - `components/admin/RevenueChart.tsx` - Revenue visualization
7. **Navigation**: `components/layout/FloatingNav.tsx` - Floating island navigation
8. **Theme**: `components/theme/ThemeProvider.tsx` - Dark/Light mode
9. **Order Tracking**: `components/order/OrderTracking.tsx` - Visual timeline
10. **API Routes**: Complete CRUD APIs for all resources

## Security Considerations

- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection (React default)
- CSRF tokens for API routes
- Rate limiting on API endpoints
- Environment variables for secrets
- HTTPS enforcement
- Secure session management

## Testing Strategy

- Unit tests for utilities and services
- Integration tests for API routes
- E2E tests for critical flows (add to cart, checkout)
- Manual testing checklist for payment flows

## Deployment Checklist

- Environment variables configured
- Database migrations run
- SSL certificates
- Domain configuration
- Payment gateway testing (sandbox first)
- Monitoring and error tracking setup
- Backup strategy for database

### Completed Features ✅

#### Phase 1: MVP ✅ **COMPLETE**

- [x] Initialize Next.js 15 project with TypeScript, Tailwind CSS, and install core dependencies (Prisma, NextAuth.js v5, Zustand, shadcn/ui, Recharts)
- [x] Configure MongoDB Atlas database, create Prisma schema with all models
- [x] Implement authentication system with NextAuth.js (login, register, session management, protected routes)
- [x] Build product catalog pages (listing, detail, advanced search, filtering) with responsive design
- [x] Implement shopping cart functionality with Zustand store (add/remove items, persist cart)
- [x] Create checkout process with saved addresses, pre-filled user data, and payment method selection
- [x] Integrate M-Pesa payment API (STK Push) and implement cash on delivery option
- [x] Build enhanced admin dashboard with product management (CRUD), order management, and analytics
- [x] Implement order processing system (create orders, update status, order history for users)
- [x] Apply design system (typography, colors, spacing), add loading states, error handling, and responsive refinements

#### UI/UX Enhancements ✅ **COMPLETE**

- [x] Implement dark theme with theme switcher
- [x] Remove orange colors, use white, black, red color scheme
- [x] Create floating island navigation (desktop and mobile)
- [x] Add loading spinners for all actions
- [x] Improve icons and alignment throughout
- [x] Optimize for mobile users with responsive design
- [x] Add quick add to cart on product cards
- [x] Enhance product detail pages with multiple image views
- [x] Create interactive order tracking visualization
- [x] Smart navigation (hide login/register when logged in)
- [x] Footer with conditional links based on auth state

#### Admin Enhancements ✅ **COMPLETE**

- [x] Enriched admin dashboard with revenue charts and analytics
- [x] Product image upload with multiple views (front, side, top, back, general)
- [x] Dynamic product details management (CRUD)
- [x] Category hierarchy management
- [x] Size management with individual stock per size
- [x] Order filtering and search
- [x] Stock alerts and warnings
- [x] Admin restrictions (cannot place orders or manage customer data)
- [x] Enhanced admin profile with dashboard stats

#### Code Quality Improvements ✅ **COMPLETE**

- [x] Fix all syntax errors and JSX issues
- [x] Improve error handling throughout
- [x] Add validation for Select components (no empty values)
- [x] Fix pagination to use Next.js Link components
- [x] Add product links from cart items
- [x] Improve checkout with saved addresses integration
- [x] Enhance search and filter UI with real-time updates
- [x] Code audit and fix broken logic
- [x] Remove nested anchor tags
- [x] Fix hydration errors

### Remaining/Planned Features

#### Phase 2: Enhancements (Future)

- [ ] Product reviews and ratings
- [ ] Wishlist/favorites functionality
- [ ] Recently viewed products
- [ ] Related/recommended products
- [ ] Product variants (colors)
- [ ] Advanced filtering (brand, color, material)
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Order cancellation by customer
- [ ] Return/refund requests
- [ ] Coupon/discount codes
- [ ] Newsletter subscription

#### Phase 3: Advanced Features (Future)

- [ ] Newsletter subscription system
- [ ] Promotional banners
- [ ] Flash sales countdown
- [ ] SEO optimization (meta tags, Open Graph, sitemap)
- [ ] Multi-user admin with roles
- [ ] Activity logs
- [ ] Export orders/reports
- [ ] Stock movement history