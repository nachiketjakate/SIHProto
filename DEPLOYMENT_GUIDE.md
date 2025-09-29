# 🚀 Complete Deployment Guide - Blue Carbon Registry

This guide will help you deploy the entire application stack with public URLs that anyone can access.

## 📋 Prerequisites

1. GitHub account (free)
2. Vercel account (free) - for frontend
3. Render/Railway account (free tier) - for backend
4. Supabase account (free tier) - for database
5. Pinata account (free tier) - for IPFS
6. Alchemy/Infura account (free) - for blockchain RPC

## 🔧 Step 1: Prepare Your Code for Deployment

### 1.1 Push Code to GitHub

```bash
cd C:\Users\HP\blue-carbon-registry
git init
git add .
git commit -m "Initial commit - Blue Carbon Registry"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blue-carbon-registry.git
git push -u origin main
```

### 1.2 Create Environment Variable Files

Create `.env.example` files to document required environment variables:

**backend/.env.example:**
```
NODE_ENV=production
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret_min_32_chars
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
BLOCKCHAIN_RPC_URL=your_alchemy_or_infura_url
CONTRACT_ADDRESS=deployed_contract_address
MARKETPLACE_ADDRESS=deployed_marketplace_address
```

**frontend/.env.example:**
```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_WEB3_RPC_URL=your_alchemy_or_infura_url
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_MARKETPLACE_ADDRESS=deployed_marketplace_address
```

## 🗄️ Step 2: Set Up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose a region close to you)
3. Once created, go to Settings → API
4. Copy your:
   - `Project URL` (this is your SUPABASE_URL)
   - `service_role` key (this is your SUPABASE_SERVICE_KEY)

5. Go to SQL Editor and run your schema creation script:

```sql
-- Run your existing schema.sql file content here
```

## 🔗 Step 3: Deploy Smart Contracts

### Option A: Deploy to Sepolia Testnet (Recommended for Testing)

1. Get Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com)
2. Create an Alchemy account at [alchemy.com](https://www.alchemy.com)
3. Create a new app for Sepolia network
4. Update `hardhat.config.js`:

```javascript
module.exports = {
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
      accounts: ["YOUR_PRIVATE_KEY"] // Use .env file in production!
    }
  }
}
```

5. Deploy contracts:
```bash
cd smart-contracts
npx hardhat run scripts/deploy.js --network sepolia
```

6. Save the deployed contract addresses

### Option B: Deploy to Polygon Mumbai (Free & Fast)

Similar process but using Polygon Mumbai testnet for lower costs.

## 🎨 Step 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from `.env.example`
   - Use your actual values

6. Click "Deploy"
7. Your frontend will be available at: `https://your-app.vercel.app`

## 🖥️ Step 5: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: `blue-carbon-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`

5. Add Environment Variables:
   - Go to "Environment" tab
   - Add all variables from `backend/.env.example`

6. Click "Create Web Service"
7. Your backend will be available at: `https://blue-carbon-backend.onrender.com`

**Note:** Free tier on Render spins down after inactivity, first request may take 30-50 seconds.

## 🎯 Step 6: Connect Everything Together

1. Update your frontend environment variables on Vercel:
   - Go to your Vercel project settings
   - Update `VITE_API_URL` to your Render backend URL
   - Redeploy frontend

2. Configure CORS in your backend:
   - Add your Vercel frontend URL to allowed origins
   - Redeploy backend

## 🌍 Step 7: Your Public URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.onrender.com`
- **Smart Contracts**: On Sepolia/Mumbai testnet

Share the frontend URL with anyone to access your application!

## 📱 Alternative: One-Click Deployment Options

### Option 1: Deploy with Railway (All-in-One)

1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Select your repository
4. Railway will automatically:
   - Detect services (frontend, backend)
   - Set up PostgreSQL database
   - Provide public URLs

### Option 2: Deploy with Netlify + Heroku

- **Frontend**: Deploy to Netlify (drag & drop dist folder)
- **Backend**: Deploy to Heroku (free tier discontinued, use hobby plan)

### Option 3: Deploy with GitHub Pages + Cyclic

- **Frontend**: Enable GitHub Pages for frontend
- **Backend**: Deploy to [cyclic.sh](https://cyclic.sh) (free tier)

## 🔒 Security Checklist

Before going live:

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Set up proper CORS policies
- [ ] Add rate limiting
- [ ] Enable authentication on all protected routes
- [ ] Audit smart contracts
- [ ] Use mainnet for production

## 🛠️ Monitoring & Maintenance

1. **Monitoring**:
   - Vercel Analytics (frontend)
   - Render Metrics (backend)
   - Supabase Dashboard (database)

2. **Logs**:
   - Check Vercel Functions logs
   - Check Render service logs
   - Monitor smart contract events

3. **Updates**:
   - Push to GitHub main branch
   - Auto-deploys trigger on Vercel/Render

## 💰 Cost Breakdown (Free Tier Limits)

| Service | Free Tier | Limits |
|---------|-----------|---------|
| Vercel | Yes | 100GB bandwidth/month |
| Render | Yes | 750 hours/month |
| Supabase | Yes | 500MB database, 2GB bandwidth |
| Pinata | Yes | 1GB storage, 100 pins |
| Alchemy | Yes | 300M compute units/month |

## 🚨 Troubleshooting

### Frontend not connecting to backend?
- Check CORS settings
- Verify API URL in environment variables
- Check browser console for errors

### Backend crashes on Render?
- Check logs for errors
- Verify all environment variables are set
- Ensure package.json has correct start script

### Smart contract transactions failing?
- Check wallet has enough test ETH
- Verify contract addresses in env vars
- Check RPC URL is correct

## 📞 Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Hardhat Docs](https://hardhat.org/docs)

---

## 🎉 Congratulations!

Your Blue Carbon Registry is now live and accessible to anyone worldwide!

**Next Steps:**
1. Share your frontend URL
2. Monitor usage and performance
3. Gather user feedback
4. Plan feature updates

**Example Live URL:** `https://blue-carbon-registry.vercel.app`