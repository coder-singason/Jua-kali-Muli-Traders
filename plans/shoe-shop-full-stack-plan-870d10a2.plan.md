<!-- 870d10a2-5ea9-4b26-9c73-646cb4f48343 a366a603-be07-4d27-b3d3-4918f18d7eb7 -->
# Modern Full-Stack Shoe Shop Website - Implementation Plan

## Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or React Context for cart/auth
- **Forms**: React Hook Form + Zod validation
- **Image Optimization**: Next.js Image component with Cloudinary/ImageKit

### Backend

- **API**: Next.js API Routes (or separate Express.js if preferred)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js or Clerk
- **File Storage**: AWS S3 / Cloudinary for product images
- **Email**: Resend or SendGrid for transactional emails

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

- **Primary**: Deep navy/black (#1a1a1a) for shoes/elegance
- **Accent**: Vibrant color (orange/red #FF6B35 or brand color)
- **Background**: White (#FFFFFF) + light gray (#F5F5F5)
- **Text**: Dark gray (#333333) + medium gray (#666666)

### Layout Principles

- Clean, minimalist design
- Large product images with zoom
- Mobile-first responsive design
- Grid-based product listings
- Sticky header with cart icon

## Core Features & MVP

### Phase 1: MVP (Weeks 1-3)

#### Customer-Facing Features

1. **Product Catalog**

   - Browse shoes by category (Men, Women, Kids, Sports, Casual, etc.)
   - Product listing page with grid/list view
   - Product detail page with:
     - Multiple images (gallery with zoom)
     - Size selection
     - Price display
     - Stock availability
     - Product description
   - Search functionality
   - Basic filtering (category, price range, size)

2. **Shopping Cart**

   - Add/remove items
   - Update quantities
   - Size selection per item
   - Cart persistence (localStorage + DB sync on login)
   - Cart icon with item count badge

3. **Checkout Process**

   - Guest checkout or login/register
   - Shipping address form
   - Order summary
   - Payment method selection (Cash on Delivery + M-Pesa)
   - Order confirmation page

4. **User Accounts** (if authentication included)

   - Registration/Login
   - Profile management
   - Order history
   - Address book

#### Admin Features

1. **Dashboard**

   - Overview stats (orders, revenue, products)
   - Recent orders list

2. **Product Management**

   - CRUD operations for products
   - Image upload (multiple per product)
   - Stock management
   - Category management
   - Size management

3. **Order Management**

   - View all orders
   - Update order status (Pending, Processing, Shipped, Delivered, Cancelled)
   - Order details view
   - Filter/search orders

#### Payment Integration

- **Cash on Delivery**: Simple checkbox/toggle (default)
- **M-Pesa Integration**: 
  - Lipa na M-Pesa Online API
   - STK Push for mobile payments
   - Payment confirmation webhook
   - Transaction status tracking

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

## Database Schema (Core Tables)

```
- Users (id, email, password_hash, name, phone, role, created_at, updated_at)
- Products (id, name, description, price, category_id, brand, cloudinary_images[], stock, sku, featured, created_at, updated_at)
- Categories (id, name, slug, parent_id, image_url, created_at)
- ProductSizes (id, product_id, size, stock, created_at)
- CartItems (id, user_id, session_id, product_id, size, quantity, created_at, updated_at)
- Orders (id, user_id, order_number, status, total, subtotal, shipping_cost, payment_method, shipping_address, phone, created_at, updated_at)
- OrderItems (id, order_id, product_id, product_name, size, quantity, price, created_at)
- Payments (id, order_id, mpesa_transaction_id, mpesa_receipt_number, phone_number, amount, status, callback_data, created_at, updated_at)
- Addresses (id, user_id, label, full_name, phone, address_line1, address_line2, city, postal_code, is_default, created_at)
```

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

## Key Implementation Files

1. **Prisma Schema**: `prisma/schema.prisma` - Database models
2. **Product Components**: `components/product/ProductCard.tsx`, `ProductDetail.tsx`
3. **Cart Store**: `lib/stores/cart-store.ts` - Zustand cart state
4. **M-Pesa Service**: `lib/payments/mpesa.ts` - Payment integration
5. **Admin Dashboard**: `app/admin/dashboard/page.tsx`
6. **API Routes**: `app/api/products/route.ts`, `app/api/orders/route.ts`

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

### To-dos

- [x] Initialize Next.js project with TypeScript, Tailwind CSS, and install core dependencies (Prisma, NextAuth, Zustand, shadcn/ui)
- [x] Configure PostgreSQL database, create Prisma schema with core models (Users, Products, Categories, Orders, CartItems, Payments)
- [x] Implement authentication system with NextAuth.js (login, register, session management)
- [x] Build product catalog pages (listing, detail, search, filtering) with responsive design
- [x] Implement shopping cart functionality with Zustand store (add/remove items, persist cart)
- [x] Create checkout process with guest/login options, address form, and payment method selection
- [x] Integrate M-Pesa payment API (STK Push) and implement cash on delivery option
- [x] Build admin dashboard with product management (CRUD), order management, and basic analytics
- [x] Implement order processing system (create orders, update status, order history for users)
- [x] Apply design system (typography, colors, spacing), add loading states, error handling, and responsive refinements