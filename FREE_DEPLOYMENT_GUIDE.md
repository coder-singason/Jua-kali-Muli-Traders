# 🚀 Free Deployment Guide for KicksZone

## ✅ Deployment Feasibility: **YES, 100% FREE DEPLOYMENT POSSIBLE**

Your KicksZone application can be deployed completely free using the following free-tier services. This guide provides step-by-step instructions for each service.

---

## 📋 Overview of Required Services

| Service | Purpose | Free Tier Limits | Status |
|---------|---------|------------------|--------|
| **Vercel** | Hosting (Next.js) | Unlimited projects, 100GB bandwidth/month | ✅ Free |
| **MongoDB Atlas** | Database | 512MB storage, shared cluster | ✅ Free |
| **Cloudinary** | Image storage | 25GB storage, 25GB bandwidth/month | ✅ Free |
| **Resend** | Email service | 3,000 emails/month, 100 emails/day | ✅ Free |
| **M-Pesa** | Payment (optional) | Requires API credentials | ⚠️ Optional |

---

## 🎯 Step-by-Step Deployment Guide

### 1. MongoDB Atlas Setup (Database) - FREE

#### Step 1.1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email (or use Google/GitHub)
3. Complete the registration

#### Step 1.2: Create a Free Cluster
1. After login, click **"Build a Database"**
2. Select **"M0 FREE"** tier (Free Forever)
3. Choose a cloud provider (AWS, Google Cloud, or Azure)
4. Select a region closest to your users (e.g., `us-east-1` for US, `eu-west-1` for Europe)
5. Click **"Create"** (takes 1-3 minutes)

#### Step 1.3: Configure Database Access
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and strong password (save these!)
5. Set user privileges to **"Atlas Admin"** (or read/write)
6. Click **"Add User"**

#### Step 1.4: Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Vercel deployment)
   - Or add specific IPs: `0.0.0.0/0` (allows all)
4. Click **"Confirm"**

#### Step 1.5: Get Connection String
1. Go to **"Database"** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"5.5 or later"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name at the end: `?retryWrites=true&w=majority` → `?retryWrites=true&w=majority&appName=kickszone`
   - Final format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kickszone?retryWrites=true&w=majority`

**Save this connection string - you'll need it for Vercel!**

---

### 2. Cloudinary Setup (Image Storage) - FREE

#### Step 2.1: Create Cloudinary Account
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email (or use Google/GitHub)
3. Verify your email

#### Step 2.2: Get API Credentials
1. After login, you'll see your **Dashboard**
2. Note down these values from the dashboard:
   - **Cloud Name** (e.g., `dxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Reveal" to see it)

**Save these credentials - you'll need them for Vercel!**

#### Step 2.3: Configure Upload Presets (Optional but Recommended)
1. Go to **"Settings"** → **"Upload"**
2. Scroll to **"Upload presets"**
3. Create a new preset:
   - Name: `kickszone-products`
   - Signing mode: **"Unsigned"** (for client-side uploads) or **"Signed"** (more secure)
   - Folder: `kickszone/products`
   - Click **"Save"**

**Free Tier Limits:**
- 25GB storage
- 25GB bandwidth/month
- 25 million transformations/month

---

### 3. Resend Setup (Email Service) - FREE

#### Step 3.1: Create Resend Account
1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with your email (or use Google/GitHub)
3. Verify your email

#### Step 3.2: Get API Key
1. After login, go to **"API Keys"** in the sidebar
2. Click **"Create API Key"**
3. Give it a name (e.g., `kickszone-production`)
4. Select permissions: **"Sending access"**
5. Click **"Add"**
6. **Copy the API key immediately** (you won't see it again!)

**Save this API key - you'll need it for Vercel!**

#### Step 3.3: Verify Domain (Optional - for production)
1. Go to **"Domains"** in the sidebar
2. Click **"Add Domain"**
3. Enter your domain (e.g., `kickszone.com`)
4. Follow DNS setup instructions
5. For testing, you can use the default `onboarding@resend.dev` sender

**Free Tier Limits:**
- 3,000 emails/month
- 100 emails/day
- Unlimited domains (after verification)

---

### 4. Vercel Deployment (Hosting) - FREE

#### Step 4.1: Prepare Your Code
1. Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. If not already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

#### Step 4.2: Create Vercel Account
1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub, GitLab, or Bitbucket (recommended for easy integration)
3. Authorize Vercel to access your repositories

#### Step 4.3: Import Your Project
1. After login, click **"Add New..."** → **"Project"**
2. Import your Git repository (GitHub/GitLab/Bitbucket)
3. Select your `KicksZone` repository
4. Click **"Import"**

#### Step 4.4: Configure Build Settings
Vercel should auto-detect Next.js. Verify:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

#### Step 4.5: Add Environment Variables
Before deploying, add all environment variables in Vercel:

1. In the project settings, go to **"Environment Variables"**
2. Add each variable (for Production, Preview, and Development):

   **Required Variables:**
   ```env
   DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kickszone?retryWrites=true&w=majority
   
   NEXTAUTH_SECRET=generate-a-random-secret-here-min-32-chars
   NEXTAUTH_URL=https://your-app-name.vercel.app
   
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   **Optional Variables (for email):**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=KicksZone <noreply@yourdomain.com>
   ```

   **Optional Variables (for M-Pesa - only if you have credentials):**
   ```env
   MPESA_CONSUMER_KEY=your-consumer-key
   MPESA_CONSUMER_SECRET=your-consumer-secret
   MPESA_BUSINESS_SHORTCODE=your-shortcode
   MPESA_PASSKEY=your-passkey
   MPESA_ENVIRONMENT=sandbox
   ```

3. **Generate NEXTAUTH_SECRET:**
   ```bash
   # Run this in your terminal:
   openssl rand -base64 32
   ```
   Or use an online generator: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

4. **Set NEXTAUTH_URL:**
   - Initially: `https://your-app-name.vercel.app` (Vercel will assign a name)
   - After custom domain: `https://yourdomain.com`

#### Step 4.6: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://kickszone-xxxxx.vercel.app`

#### Step 4.7: Update NEXTAUTH_URL
1. After first deployment, copy your Vercel URL
2. Go to **"Settings"** → **"Environment Variables"**
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (or it will auto-redeploy on next push)

---

### 5. Post-Deployment Setup

#### Step 5.1: Initialize Database Schema
1. You need to run Prisma migrations. You have two options:

   **Option A: Use Vercel Build Command (Recommended)**
   Add to your `package.json` scripts:
   ```json
   "postinstall": "prisma generate",
   "vercel-build": "prisma generate && prisma db push && next build"
   ```
   
   Then update your Vercel build command to: `npm run vercel-build`

   **Option B: Run Manually via Vercel CLI**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npx prisma generate
   npx prisma db push
   ```

#### Step 5.2: Seed Database (Optional)
If you want sample data:
```bash
# Locally, after pulling env vars:
npx prisma db seed
```

#### Step 5.3: Create Admin User
Admin users must be created directly in the database:

1. **Option A: Use Prisma Studio (Local)**
   ```bash
   npx prisma studio
   ```
   - Open `http://localhost:5555`
   - Go to `users` collection
   - Create a new user with `role: ADMIN`

2. **Option B: Use MongoDB Atlas UI**
   - Go to MongoDB Atlas → **"Collections"**
   - Select `users` collection
   - Click **"Insert Document"**
   - Add:
     ```json
     {
       "email": "admin@example.com",
       "password_hash": "<bcrypt-hashed-password>",
       "role": "ADMIN",
       "created_at": new Date(),
       "updated_at": new Date()
     }
     ```
   - To hash password, use: [https://bcrypt-generator.com/](https://bcrypt-generator.com/) (rounds: 10)

3. **Option C: Create via API (after deployment)**
   - Register a normal user via `/register`
   - Then update role in database to `ADMIN`

---

## 🔧 Configuration Checklist

Before going live, verify:

- [ ] MongoDB Atlas cluster is running (M0 Free tier)
- [ ] Database user created and IP whitelisted (0.0.0.0/0)
- [ ] Cloudinary account created and credentials saved
- [ ] Resend API key created (optional but recommended)
- [ ] Vercel project deployed successfully
- [ ] All environment variables added to Vercel
- [ ] Database schema pushed (`prisma db push`)
- [ ] Admin user created in database
- [ ] Test registration/login flow
- [ ] Test product upload (Cloudinary)
- [ ] Test order creation
- [ ] Test email sending (if Resend configured)

---

## 🎨 Custom Domain Setup (Optional - FREE)

Vercel allows custom domains on the free tier:

1. In Vercel project → **"Settings"** → **"Domains"**
2. Add your domain (e.g., `kickszone.com`)
3. Follow DNS instructions:
   - Add A record: `@` → `76.76.21.21`
   - Add CNAME: `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. Update `NEXTAUTH_URL` to your custom domain
6. SSL certificate is automatically provisioned (free)

---

## 📊 Free Tier Limits Summary

### MongoDB Atlas (M0 Free)
- ✅ 512MB storage
- ✅ Shared cluster (no dedicated resources)
- ✅ Unlimited databases
- ✅ Backup: 1 snapshot/day
- ⚠️ **Upgrade needed if**: >512MB data, need better performance

### Cloudinary (Free)
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ 25 million transformations/month
- ⚠️ **Upgrade needed if**: >25GB storage or bandwidth

### Resend (Free)
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ Unlimited domains
- ⚠️ **Upgrade needed if**: >3,000 emails/month

### Vercel (Free - Hobby)
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Preview deployments
- ⚠️ **Upgrade needed if**: >100GB bandwidth/month or need team features

---

## 🚨 Important Notes

### M-Pesa Integration
- M-Pesa requires API credentials from Safaricom
- Sandbox is free for testing
- Production requires business registration with Safaricom
- **Your app works without M-Pesa** - customers can use "Cash on Delivery"

### Email Service
- Resend is optional - app works without it
- Emails will just log to console if not configured
- For production, consider verifying your domain in Resend

### Database Backups
- MongoDB Atlas free tier includes 1 snapshot/day
- Consider manual exports for critical data
- Upgrade to paid tier for more frequent backups

### Performance
- Free tiers may have slower response times
- MongoDB shared cluster can be slower during peak times
- Consider upgrading if you get significant traffic

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure `prisma generate` runs before build
- Verify all environment variables are set

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check MongoDB IP whitelist includes `0.0.0.0/0`
- Ensure database user has correct permissions

### Image Upload Fails
- Verify Cloudinary credentials
- Check Cloudinary upload preset settings
- Review Cloudinary dashboard for errors

### Authentication Not Working
- Verify `NEXTAUTH_SECRET` is set (32+ characters)
- Check `NEXTAUTH_URL` matches your deployment URL
- Ensure database has `sessions` and `accounts` collections

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for send logs
- Ensure domain is verified (for production)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Resend Documentation](https://resend.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## ✅ Final Checklist

Before announcing your site:

- [ ] Test all user flows (register, login, browse, cart, checkout)
- [ ] Test admin flows (dashboard, products, orders)
- [ ] Verify images load correctly
- [ ] Test email notifications (if configured)
- [ ] Check mobile responsiveness
- [ ] Test payment flow (Cash on Delivery works without M-Pesa)
- [ ] Set up monitoring (Vercel Analytics is free)
- [ ] Configure custom domain (optional)
- [ ] Set up error tracking (Sentry free tier available)

---

## 🎉 Congratulations!

Your KicksZone application is now deployed **100% FREE**! 

You're using:
- ✅ Vercel (Hosting) - Free
- ✅ MongoDB Atlas (Database) - Free
- ✅ Cloudinary (Images) - Free
- ✅ Resend (Email) - Free

Total monthly cost: **$0.00** 🎊

---

**Need Help?** Check the troubleshooting section or refer to the official documentation for each service.
