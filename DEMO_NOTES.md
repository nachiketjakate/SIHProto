# Demo Setup - Important Notes

## 🚨 Current Status

The application is running in **DEMO MODE** with the following configuration:

### ✅ What's Working:

1. **Frontend** - Running on http://localhost:3001
2. **Backend** - Running on http://localhost:5000
3. **User Registration/Login** - Using in-memory storage (no database required)
4. **Authentication** - JWT tokens working
5. **Role-based Access** - All 4 roles functional
6. **Smart Contracts** - Compiled and ready

### ⚠️ Demo Mode Features:

- **User Storage**: Users are stored in memory (will reset when backend restarts)
- **No Database Required**: The app works without Supabase connection
- **Temporary Data**: All data is temporary and exists only while servers are running

### 📝 How to Use:

1. **Register Users**: Create accounts with different roles
   - Each registration creates a temporary user
   - You can log in immediately after registration
   - Users persist until backend is restarted

2. **Test Accounts You Can Create**:
   ```
   Email: developer@test.com
   Password: test123
   Role: Developer
   
   Email: verifier@test.com
   Password: test123
   Role: Verifier
   
   Email: admin@test.com
   Password: test123
   Role: Admin
   
   Email: buyer@test.com
   Password: test123
   Role: Buyer
   ```

3. **Navigation**: After login, you'll be redirected to role-specific dashboards

### 🔄 To Restart the Application:

**If you need to restart the servers:**

1. Stop current processes (Ctrl+C in each terminal)
2. Restart backend: `cd backend && npm run dev`
3. Restart frontend: `cd frontend && npm run dev`

**Note**: Restarting the backend will clear all registered users (they're stored in memory)

### 🎯 Next Steps for Production:

1. **Set up Supabase**:
   - Create a Supabase project
   - Run the SQL schemas in `/database` folder
   - Update `.env` with real Supabase credentials

2. **Deploy Smart Contracts**:
   - Deploy to testnet (Sepolia/Mumbai)
   - Update contract addresses in backend

3. **Configure IPFS**:
   - Get full Pinata API credentials
   - Test file uploads

### 🐛 Troubleshooting:

**Registration fails?**
- Backend might need restart
- Check console for errors

**Can't login?**
- If backend was restarted, re-register (users are temporary)
- Check email/password are correct

**Page not loading?**
- Ensure both servers are running
- Frontend: http://localhost:3001
- Backend: http://localhost:5000

**Port conflicts?**
- Frontend uses 3001 (changed from 3000)
- Backend uses 5000
- Modify in respective config files if needed

### ✨ Features to Explore:

1. **Landing Page** - Overview of the platform
2. **Registration** - Multi-role registration form
3. **Login** - JWT authentication
4. **Dashboards** - Different UI for each role
5. **Web3 Integration** - Connect MetaMask wallet
6. **Responsive Design** - Works on all devices

The demo is fully functional for testing the user interface and authentication flow!