# Blue Carbon Credit Registry - Prototype

A blockchain-based platform for Blue Carbon Credit Registry, MRV (Monitoring, Reporting, Verification), and Marketplace.

## Architecture

### Web2 Layer
- **Database**: Supabase (PostgreSQL) for users, projects, tokens, transactions
- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express

### Web3 Layer
- **Smart Contracts**: Solidity ERC20 tokens (1 token = 1 tCO₂e, decimals = 0)
- **Blockchain**: Ethereum-compatible network
- **Storage**: IPFS via Pinata for metadata and MRV data

### Bridge Layer
- Oracles and APIs for Web2/Web3 synchronization
- Event listeners for blockchain transactions
- Automated database updates

## Core Lifecycle

1. **Data Collection**: Project developers upload restoration details and documents
2. **Verification**: On-field verifiers review projects and NCCR data
3. **Tokenization**: Smart contracts create token batches with IPFS metadata
4. **Marketplace**: Open marketplace for credit trading
5. **Retirement**: Credits can be retired with certificates

## Roles & Dashboards

- **Developer**: Register projects, upload MRV data
- **Verifier**: Approve/reject projects, provide signatures for minting
- **NCCR Admin**: Oversee registry, compliance, national reporting
- **Buyer/Investor**: Browse marketplace, purchase, retire credits

## Getting Started

1. Clone the repository
2. Install dependencies in each module
3. Set up environment variables
4. Deploy smart contracts
5. Start the application

### Running the Application

**Backend:** `cd backend && npm run dev` (Port 5000)
**Frontend:** `cd frontend && npm run dev` (Port 3001)

## Project Structure

```
blue-carbon-registry/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── smart-contracts/   # Solidity contracts
├── database/         # Supabase schema and migrations
└── docs/            # Documentation
```

## Environment Variables

- `PINATA_API_KEY`: Pinata API key for IPFS storage
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `JWT_SECRET`: JWT secret for authentication

## License

MIT License