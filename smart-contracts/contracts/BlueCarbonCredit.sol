// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title BlueCarbonCredit
 * @dev ERC20 token representing blue carbon credits
 * 1 token = 1 tonne CO2 equivalent
 * Decimals = 0 (whole tonnes only)
 */
contract BlueCarbonCredit is ERC20, AccessControl, ERC20Pausable, ERC20Burnable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Struct to store credit batch metadata
    struct CreditBatch {
        uint256 projectId;
        uint256 verificationId;
        string metadataIPFSHash; // IPFS hash for detailed metadata
        address developer;
        uint256 verifiedAmount;
        uint256 issuanceDate;
        bool isRetired;
        string retirementReason;
        string retirementCertificateIPFS;
    }

    // Mapping from batch ID to credit batch info
    mapping(uint256 => CreditBatch) public creditBatches;
    
    // Mapping from token ID to batch ID
    mapping(uint256 => uint256) public tokenToBatch;
    
    // Mapping to track retired tokens
    mapping(uint256 => bool) public retiredTokens;
    
    // Current batch ID counter
    uint256 public currentBatchId;
    
    // Current token ID counter
    uint256 public currentTokenId;

    // Events
    event CreditBatchMinted(
        uint256 indexed batchId,
        uint256 indexed projectId,
        uint256 indexed verificationId,
        address developer,
        uint256 amount,
        string metadataIPFSHash
    );
    
    event CreditRetired(
        uint256 indexed tokenId,
        uint256 indexed batchId,
        address indexed retiredBy,
        string reason,
        string certificateIPFS
    );

    event BatchRetired(
        uint256 indexed batchId,
        address indexed retiredBy,
        string reason,
        string certificateIPFS
    );

    constructor(address defaultAdmin) ERC20("Blue Carbon Credit", "BCC") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
    }

    /**
     * @dev Returns 0 decimals as credits represent whole tonnes
     */
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /**
     * @dev Mint a new batch of carbon credits
     * Only callable by verified minters (admin/verifiers)
     */
    function mintCreditBatch(
        uint256 projectId,
        uint256 verificationId,
        address developer,
        uint256 amount,
        string memory metadataIPFSHash
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256 batchId) {
        require(developer != address(0), "Invalid developer address");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(metadataIPFSHash).length > 0, "Metadata IPFS hash required");

        batchId = currentBatchId++;
        
        // Create credit batch
        creditBatches[batchId] = CreditBatch({
            projectId: projectId,
            verificationId: verificationId,
            metadataIPFSHash: metadataIPFSHash,
            developer: developer,
            verifiedAmount: amount,
            issuanceDate: block.timestamp,
            isRetired: false,
            retirementReason: "",
            retirementCertificateIPFS: ""
        });

        // Mint tokens to developer
        _mint(developer, amount);

        // Map tokens to batch (simplified - in practice, you might want individual token tracking)
        for (uint256 i = 0; i < amount; i++) {
            tokenToBatch[currentTokenId + i] = batchId;
        }
        currentTokenId += amount;

        emit CreditBatchMinted(
            batchId,
            projectId,
            verificationId,
            developer,
            amount,
            metadataIPFSHash
        );
    }

    /**
     * @dev Retire carbon credits by burning them
     * Credits are permanently removed from circulation
     */
    function retireCredits(
        uint256 amount,
        string memory reason,
        string memory certificateIPFS
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(bytes(reason).length > 0, "Retirement reason required");

        // Burn the tokens
        _burn(msg.sender, amount);

        // For simplicity, we'll emit a retirement event
        // In a more complex implementation, you'd track individual token retirements
        emit CreditRetired(
            0, // tokenId - simplified
            0, // batchId - would need more complex logic to determine
            msg.sender,
            reason,
            certificateIPFS
        );
    }

    /**
     * @dev Retire an entire credit batch
     * Only callable by the batch owner or admin
     */
    function retireCreditBatch(
        uint256 batchId,
        string memory reason,
        string memory certificateIPFS
    ) external {
        require(batchId < currentBatchId, "Invalid batch ID");
        CreditBatch storage batch = creditBatches[batchId];
        require(!batch.isRetired, "Batch already retired");
        require(
            msg.sender == batch.developer || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized to retire this batch"
        );
        require(bytes(reason).length > 0, "Retirement reason required");

        // Mark batch as retired
        batch.isRetired = true;
        batch.retirementReason = reason;
        batch.retirementCertificateIPFS = certificateIPFS;

        emit BatchRetired(batchId, msg.sender, reason, certificateIPFS);
    }

    /**
     * @dev Get credit batch information
     */
    function getCreditBatch(uint256 batchId) external view returns (CreditBatch memory) {
        require(batchId < currentBatchId, "Invalid batch ID");
        return creditBatches[batchId];
    }

    /**
     * @dev Check if a token is retired
     */
    function isTokenRetired(uint256 tokenId) external view returns (bool) {
        uint256 batchId = tokenToBatch[tokenId];
        return creditBatches[batchId].isRetired || retiredTokens[tokenId];
    }

    /**
     * @dev Get metadata IPFS hash for a token
     */
    function getTokenMetadata(uint256 tokenId) external view returns (string memory) {
        uint256 batchId = tokenToBatch[tokenId];
        return creditBatches[batchId].metadataIPFSHash;
    }

    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override update function for OpenZeppelin v5 compatibility
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
        
        // Allow minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // For simplicity, we're not implementing individual token retirement checks
        // In a full implementation, you'd need to track individual token retirements
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}