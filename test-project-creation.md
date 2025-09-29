# Test Guide: New Project Form

## Setup Instructions

1. **Start Backend Server**
   ```powershell
   cd C:\Users\HP\blue-carbon-registry\backend
   npm run dev
   ```

2. **Start Frontend Server** (in new terminal)
   ```powershell
   cd C:\Users\HP\blue-carbon-registry\frontend
   npm run dev
   ```

3. **Deploy Smart Contracts** (optional - in new terminal)
   ```powershell
   cd C:\Users\HP\blue-carbon-registry\smart-contracts
   npx hardhat node
   # In another terminal:
   npx hardhat run scripts/deploy.js --network localhost
   ```

## Testing the New Project Form

1. **Navigate to**: http://localhost:3000

2. **Create an Account** (if not already done):
   - Click "Register"
   - Fill in details with role = "developer"
   - Submit

3. **Login**:
   - Use your created credentials
   - You'll be redirected to Developer Dashboard

4. **Create New Project**:
   - Click "Create New Project" button
   - Fill in the form with sample data:

   **Basic Information:**
   - Title: "Sundarbans Mangrove Restoration Project"
   - Description: "Large-scale mangrove restoration in the Sundarbans delta region"
   - Ecosystem Type: Mangrove
   - Project Area: 250 hectares
   
   **Carbon Sequestration:**
   - Estimated CO2: 1250 tCO2e/year
   - Start Date: 2024-01-01
   
   **Location Details:**
   - Location Address: "Sundarbans, West Bengal, India"
   - Latitude: 21.9497
   - Longitude: 89.1833
   
   **Restoration Details:**
   - Restoration Plan: "Phased restoration over 3 years with community involvement"
   - Methodology: "Using Verra VM0033 methodology for tidal wetland restoration"
   - Monitoring Plan: "Quarterly satellite monitoring with annual field verification"
   
   **Impact Assessment:**
   - Community Impact: "Creating 50+ local jobs and protecting coastal communities"
   - Biodiversity Impact: "Habitat restoration for Bengal tigers and various bird species"
   
   **Documents:**
   - Upload any test PDF or image files

5. **Submit the Form**:
   - Click "Submit Project"
   - You should see a success notification
   - You'll be redirected to the projects list

6. **Verify Project Creation**:
   - The new project should appear in your projects list
   - Status should show as "Pending Verification"
   - All project details should be displayed correctly

## Form Features Implemented

✅ **Form Validation**:
- Required field validation
- Numeric range validation for coordinates
- Positive number validation for area and CO2
- Real-time validation feedback

✅ **Data Management**:
- Integration with backend API
- Local storage fallback for offline mode
- Proper error handling and user feedback

✅ **User Experience**:
- Loading states during submission
- Success/error toast notifications
- Automatic redirect after submission
- File upload interface (UI ready, backend integration pending)

✅ **Additional Fields**:
- Methodology details
- Monitoring plan
- Community impact assessment
- Biodiversity impact assessment

## API Integration

The form now sends data to:
- **Endpoint**: `POST http://localhost:5000/api/projects`
- **Headers**: Authorization Bearer token
- **Payload**: Complete project data matching backend schema

## Next Steps for Full Production

1. **IPFS Integration**: 
   - Upload documents to IPFS
   - Store IPFS hashes in project metadata

2. **Smart Contract Integration**:
   - Mint project NFT on blockchain
   - Store project hash on-chain

3. **Enhanced Validation**:
   - KML/GeoJSON file upload for precise boundaries
   - Carbon calculation validators
   - Duplicate location checking

4. **Workflow Enhancement**:
   - Save draft functionality
   - Multi-step wizard for complex projects
   - Project templates

5. **Verification Flow**:
   - Assign to verifiers
   - Track verification status
   - Comments and revision requests