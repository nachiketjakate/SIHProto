# Blue Carbon Registry - Demo Guide

## Quick Start

### 1. Backend Server (Already Running)
The backend server is running on http://localhost:5000

Test endpoints:
- Health Check: http://localhost:5000/health
- Public Projects: http://localhost:5000/api/public/projects
- Public Marketplace: http://localhost:5000/api/public/marketplace/listings

### 2. Start Frontend Application

Open a new terminal/PowerShell window and run:
```powershell
cd C:\Users\HP\blue-carbon-registry\frontend
npm run dev
```

The frontend will start on http://localhost:3001

### 3. Demo Walkthrough

#### A. Landing Page
1. Visit http://localhost:3001
2. You'll see the main landing page with:
   - Blue Carbon lifecycle overview
   - Role-based registration options
   - Feature highlights

#### B. User Registration
1. Click "Get Started" or "Register"
2. Fill in the registration form:
   - Choose a role (Developer, Verifier, Admin, or Buyer)
   - Enter your details
   - Create account

Example test accounts you can create:
- Developer: dev@test.com (password: test123)
- Verifier: verifier@test.com (password: test123)
- Admin: admin@test.com (password: test123)
- Buyer: buyer@test.com (password: test123)

#### C. Login & Dashboard
1. After registration, you'll be logged in automatically
2. Or login via http://localhost:3001/login
3. You'll be redirected to your role-specific dashboard

#### D. Role-Based Features

**Developer Dashboard:**
- Create new projects
- View project list
- Track verification status
- Upload MRV data (coming soon)

**Verifier Dashboard:**
- View verification queue
- Review submitted projects
- Approve/reject projects

**Admin Dashboard:**
- User management
- System settings
- Compliance reporting
- Overview of all activities

**Buyer Dashboard:**
- Browse carbon credits
- View portfolio
- Purchase credits
- Retire credits

#### E. Public Pages (No Login Required)
- **Public Registry** (/registry): View all verified projects
- **Marketplace** (/marketplace): Browse available carbon credits

### 4. Core Functionalities Demo

#### Project Lifecycle Flow:
1. **Data Collection**: Developer creates project with details
2. **Verification**: Verifier reviews and approves project
3. **Tokenization**: Approved projects can be tokenized (blockchain integration)
4. **Marketplace**: Credits listed for sale
5. **Retirement**: Buyers can retire credits with certificates

#### IPFS Integration:
- Project documents stored on IPFS via Pinata
- MRV data uploaded to IPFS
- Verification reports stored on IPFS
- Retirement certificates on IPFS

#### Web3 Features:
- Connect MetaMask wallet (button in header)
- View wallet address when connected
- Smart contracts deployed for tokenization

### 5. Database Schema

The Supabase database includes:
- `users` - User accounts with roles
- `projects` - Blue carbon projects
- `verifications` - Verification records
- `credits` - Carbon credit tokens
- `transactions` - Blockchain transactions
- `marketplace_listings` - Credit listings
- `nccr_sensor_data` - IoT sensor data
- `audit_logs` - Compliance audit trail

### 6. Technical Architecture

```
Frontend (React + Vite)
    ↓
Backend API (Node.js + Express)
    ↓
Database (Supabase PostgreSQL)
    ↓
Blockchain (Smart Contracts)
    ↓
Storage (IPFS via Pinata)
```

### 7. Environment Variables

Backend (.env):
- PORT=5000
- SUPABASE_URL=your_supabase_url
- SUPABASE_ANON_KEY=your_supabase_key
- JWT_SECRET=your_jwt_secret
- PINATA_API_KEY=your_pinata_key

Frontend (.env):
- VITE_API_URL=http://localhost:5000/api
- VITE_SUPABASE_URL=your_supabase_url
- VITE_SUPABASE_ANON_KEY=your_supabase_key
- VITE_PINATA_API_KEY=your_pinata_key

### 8. Test Scenarios

1. **Register as Developer**
   - Create account with developer role
   - Navigate to developer dashboard
   - Try to create a new project

2. **Register as Verifier**
   - Create account with verifier role
   - View verification queue
   - Check for pending projects

3. **Register as Buyer**
   - Create account with buyer role
   - Browse marketplace
   - View available credits

4. **Connect Web3 Wallet**
   - Click "Connect Wallet" button
   - Connect MetaMask or other wallet
   - See wallet address in header

### 9. Known Limitations (Prototype)

- Supabase connection may fail if tables not created
- Smart contracts need to be deployed to a network
- Some features show "Coming Soon" placeholders
- Payment processing is simulated
- Real blockchain transactions require testnet setup

### 10. Next Steps for Production

1. Deploy smart contracts to testnet/mainnet
2. Set up production Supabase instance
3. Implement full CRUD operations
4. Add real payment gateway
5. Implement complete MRV data upload
6. Add comprehensive testing
7. Deploy to cloud hosting

## Troubleshooting

### Backend Issues:
- If port 5000 is busy, change PORT in .env
- Check Node.js version (v14+ required)
- Verify all npm packages installed

### Frontend Issues:
- Clear browser cache if styles don't load
- Check console for errors
- Ensure backend is running first

### Database Issues:
- Run schema.sql in Supabase SQL editor
- Check Supabase credentials in .env
- Verify RLS policies are applied

## Contact

For issues or questions about this prototype, please refer to the main README.md file.