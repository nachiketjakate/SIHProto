const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy BlueCarbonCredit token
  console.log("\nDeploying BlueCarbonCredit token...");
  const BlueCarbonCredit = await hre.ethers.getContractFactory("BlueCarbonCredit");
  const carbonCreditToken = await BlueCarbonCredit.deploy(deployer.address);
  await carbonCreditToken.deployed();

  console.log("BlueCarbonCredit deployed to:", carbonCreditToken.address);

  // Deploy CarbonCreditMarketplace
  console.log("\nDeploying CarbonCreditMarketplace...");
  const CarbonCreditMarketplace = await hre.ethers.getContractFactory("CarbonCreditMarketplace");
  
  // Marketplace fee: 2.5% (250 basis points)
  const marketplaceFee = 250;
  const feeRecipient = deployer.address;

  const marketplace = await CarbonCreditMarketplace.deploy(
    carbonCreditToken.address,
    marketplaceFee,
    feeRecipient
  );
  await marketplace.deployed();

  console.log("CarbonCreditMarketplace deployed to:", marketplace.address);

  // Grant marketplace the minter role for the token
  console.log("\nSetting up roles...");
  const MINTER_ROLE = await carbonCreditToken.MINTER_ROLE();
  await carbonCreditToken.grantRole(MINTER_ROLE, marketplace.address);
  console.log("Granted MINTER_ROLE to marketplace");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      BlueCarbonCredit: carbonCreditToken.address,
      CarbonCreditMarketplace: marketplace.address
    },
    roles: {
      MINTER_ROLE: MINTER_ROLE,
      VERIFIER_ROLE: await carbonCreditToken.VERIFIER_ROLE(),
      PAUSER_ROLE: await carbonCreditToken.PAUSER_ROLE(),
      DEFAULT_ADMIN_ROLE: await carbonCreditToken.DEFAULT_ADMIN_ROLE()
    },
    deploymentDate: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const filename = `deployment-${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${filepath}`);

  // Also save latest deployment
  const latestFilepath = path.join(deploymentsDir, `latest-${hre.network.name}.json`);
  fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Latest deployment info saved to: ${latestFilepath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });