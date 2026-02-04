# Electronics & Juakali Appliances Shop 🚀

A modern, full-stack e-commerce platform for selling electronics and juakali (artisan) appliances, built with Next.js 15, MongoDB, and modern web technologies. Features PayPal payment integration and cash on delivery options.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog**: Browse electronics, appliances, and juakali tools with advanced filtering by category/price/brand
- 🖼️ **Technical Specifications**: Detailed product specs including voltage, wattage, dimensions, and warranty
- 🛒 **Shopping Cart**: Persistent cart with Zustand, dynamic shipping calculation
- 💳 **Checkout**: Multiple payment options (PayPal & Cash on Delivery), saved addresses
- 📦 **Order Tracking**: Interactive visual timeline for order status, order cancellation
- 👤 **User Accounts**: Profile management, order history, address book
- ❤️ **Wishlist**: Save products for later
- ⭐ **Product Reviews**: Write and view product reviews with ratings
- 🌓 **Dark Mode**: Full dark/light theme support
- 📱 **Responsive Design**: Mobile-first design with optimized navigation

### Admin Features
- 📊 **Enhanced Dashboard**: Revenue analytics, interactive charts, order status overview
- 📈 **Revenue Visualization**: Daily revenue charts, order status pie charts
- 📦 **Product Management**: Full CRUD with multi-image uploads, technical specifications editor
- 📋 **Order Management**: Filter, search, status updates, stock management
- 🏷️ **Category Management**: Hierarchical categories for electronics/appliances/tools
- 💬 **Review Management**: View and manage all product reviews
- ⚠️ **Stock Alerts**: Low stock and out-of-stock warnings
- 🚚 **Smart Shipping**: Per-product shipping fees

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Images**: Next.js Image with Cloudinary
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: MongoDB Atlas with Prisma ORM
- **Authentication**: NextAuth.js v5 with Prisma Adapter
- **File Storage**: Cloudinary
- **Email**: Resend (configured)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- (Optional) PayPal sandbox account for payment integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd KicksZone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/electronics_shop?retryWrites=true&w=majority"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # PayPal (Sandbox)
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
   PAYPAL_WEBHOOK_ID="your-webhook-id"
   PAYPAL_MODE="sandbox"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with sample electronics products
   npm run db:seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create a migration
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

## 📁 Project Structure

```
electronics-shop/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/            # Public shop routes
│   │   ├── products/      # Product listing & details
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout process
│   │   ├── orders/        # Order tracking
│   │   └── profile/       # User profile
│   ├── admin/             # Admin routes (protected)
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order management
│   │   └── categories/    # Category management
│   └── api/               # API routes
│       ├── auth/          # Authentication APIs
│       ├── products/      # Product APIs
│       ├── orders/        # Order APIs
│       ├── admin/         # Admin APIs
│       └── payments/      # Payment APIs (PayPal)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── product/           # Product components
│   ├── admin/             # Admin components
│   ├── layout/            # Layout components
│   └── theme/             # Theme provider
├── lib/
│   ├── db/                # Database (Prisma)
│   ├── auth/              # Authentication config
│   ├── stores/            # Zustand stores
│   ├── payments/          # PayPal integration
│   └── utils/             # Utility functions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
└── public/                # Static assets
```

## 🔐 Authentication

The app uses NextAuth.js v5 with:
- **Credentials Provider**: Email/password authentication
- **Session Management**: JWT-based sessions
- **Protected Routes**: Middleware-based route protection
- **Role-Based Access**: USER and ADMIN roles

### Creating an Admin User

Admin users must be created directly in the database. Set the `role` field to `ADMIN` in the `users` collection.

Alternatively, you can update the role in Prisma Studio:
```bash
npm run db:studio
```

## 🗄️ Database Schema

The application uses MongoDB with the following key models:

- **Users**: Customer and admin accounts
- **Products**: Electronics/appliances with technical specifications (voltage, wattage, dimensions, warranty, condition)
- **ProductImages**: Multiple images per product
- **ProductDetails**: Dynamic product specifications
- **ProductSizes**: Variant options (storage capacity, etc.) - optional for most products
- **Categories**: Electronics, appliances, juakali tools, audio equipment
- **Orders**: Customer orders with status tracking and shipping costs
- **OrderItems**: Individual items in orders
- **Addresses**: Saved shipping addresses
- **Payments**: PayPal payment records
- **ProductReview**: Product reviews and ratings
- **WishlistItem**: User wishlist items
- **RecentlyViewed**: Track recently viewed products

See `prisma/schema.prisma` for the complete schema.

## 💳 Payment Integration

### Cash on Delivery
- Default payment option
- No additional setup required

### PayPal Integration
- Sandbox and production support
- Secure payment processing
- Order creation and capture flow
- Webhook handling for payment events
- Transaction status tracking

**Setup**: Add your PayPal credentials to the `.env` file. For sandbox testing, get credentials from https://developer.paypal.com

## 🎨 Theming

The app supports both light and dark themes:
- Theme switcher in navigation
- Automatic system theme detection
- Smooth theme transitions
- Full accessibility support

## 📱 Responsive Design

- Mobile-first approach
- Floating island navigation (desktop and mobile)
- Touch-optimized interactions
- Responsive grid layouts
- Optimized images with Next.js Image

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` (generate a strong secret)
- `NEXTAUTH_URL` (your production URL)
- `CLOUDINARY_*` variables
- (Optional) M-Pesa and Resend variables

## 📝 Development Notes

### Admin Restrictions
- Admins cannot place orders (enforced in API and UI)
- Admins don't see orders/addresses in their profile
- Admin profile shows dashboard statistics instead

### Smart Navigation
- Login/Register links hidden when logged in
- Footer links adapt based on authentication state
- Admin dashboard link visible only to ADMIN users

### Image Management
- Product images stored on Cloudinary
- Multiple views per product (front, side, top, back, general)
- Legacy support for simple images array
- Image optimization with Next.js Image component

### Product Features (Admin Configurable)
- **Delivery Time**: Set per product (e.g., "1-3 Days", "5-7 Days")
- **Warranty**: Set per product (e.g., "1 Year", "2 Years")
- **Quality**: Set per product (e.g., "Premium", "Standard")
- **Shipping Fee**: Set per product (defaults to free if not set)

### Shipping Calculation
- Per-product shipping fees set by admin
- Automatic calculation based on products in cart
- Free shipping when admin doesn't set a fee
- Ready for location-based calculation with maps integration

### Wishlist & Reviews
- Smart wishlist button with contextual feedback
- "Add to Wishlist" / "Remove from Wishlist" with success messages
- Product reviews with star ratings
- Admin review management
- Recently viewed products tracking

## 🤝 Contributing

This is a private project. For questions or contributions, please contact the project maintainer.

## 📄 License

Private - All rights reserved

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using Next.js 15, MongoDB, and modern web technologies**
