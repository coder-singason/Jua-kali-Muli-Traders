# ⚡ Quick Start Deployment Guide

## 🎯 TL;DR - Deploy in 15 Minutes

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Email addresses for service signups

### Step 1: Setup Services (10 min)

1. **MongoDB Atlas** (2 min)
   - Sign up: https://www.mongodb.com/cloud/atlas/register
   - Create M0 Free cluster
   - Create database user
   - Whitelist IP: `0.0.0.0/0`
   - Copy connection string

2. **Cloudinary** (2 min)
   - Sign up: https://cloudinary.com/users/register/free
   - Copy: Cloud Name, API Key, API Secret

3. **Resend** (2 min) - Optional
   - Sign up: https://resend.com/signup
   - Create API key

4. **Vercel** (4 min)
   - Sign up: https://vercel.com/signup (use GitHub)
   - Import your repository
   - Add environment variables (see below)
   - Deploy!

### Step 2: Environment Variables

Add these to Vercel → Settings → Environment Variables:

```env
# Database (from MongoDB Atlas)
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/kickszone?retryWrites=true&w=majority

# NextAuth (generate: openssl rand -base64 32)
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=https://your-app.vercel.app

# Cloudinary (from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend (optional - from Resend dashboard)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Step 3: Deploy & Initialize

1. **Deploy on Vercel** (click "Deploy")
2. **Initialize Database:**
   ```bash
   # Option A: Add to package.json
   "vercel-build": "prisma generate && prisma db push && next build"
   
   # Option B: Run manually
   vercel env pull .env.local
   npx prisma generate
   npx prisma db push
   ```

3. **Create Admin User:**
   - Register normally via `/register`
   - Update role to `ADMIN` in MongoDB Atlas UI

### Step 4: Test

- ✅ Visit your Vercel URL
- ✅ Register a user
- ✅ Login
- ✅ Browse products
- ✅ Add to cart
- ✅ Create order

---

## 📋 Service URLs Quick Reference

| Service | Signup URL | Dashboard |
|---------|-----------|-----------|
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas/register | https://cloud.mongodb.com |
| Cloudinary | https://cloudinary.com/users/register/free | https://console.cloudinary.com |
| Resend | https://resend.com/signup | https://resend.com/emails |
| Vercel | https://vercel.com/signup | https://vercel.com/dashboard |

---

## 🔑 Generate Secrets

**NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

---

## ⚠️ Common Issues

**Build fails?**
- Check Vercel build logs
- Ensure `prisma generate` runs before build

**Database connection error?**
- Verify `DATABASE_URL` format
- Check IP whitelist: `0.0.0.0/0`

**Images not uploading?**
- Verify Cloudinary credentials
- Check Cloudinary dashboard

**Auth not working?**
- Verify `NEXTAUTH_SECRET` is 32+ chars
- Check `NEXTAUTH_URL` matches deployment URL

---

For detailed instructions, see [FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md)
