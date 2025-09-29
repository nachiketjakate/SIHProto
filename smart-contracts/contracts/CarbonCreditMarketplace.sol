// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CarbonCreditMarketplace
 * @dev Marketplace for trading blue carbon credits
 * Supports both fixed-price listings and auction mechanisms
 */
contract CarbonCreditMarketplace is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // The carbon credit token contract
    IERC20 public immutable carbonCreditToken;
    
    // Marketplace fee (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFee;
    
    // Fee recipient address
    address public feeRecipient;

    // Listing structure
    struct Listing {
        uint256 listingId;
        address seller;
        uint256 amount;
        uint256 pricePerCredit; // Price in wei per credit
        uint256 totalPrice; // Total price for all credits
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
        string metadataIPFS; // Additional listing metadata
    }

    // Offer structure for buyers
    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address buyer;
        uint256 amount;
        uint256 pricePerCredit;
        uint256 totalPrice;
        uint256 expiresAt;
        bool isActive;
    }

    // Mapping from listing ID to listing
    mapping(uint256 => Listing) public listings;
    
    // Mapping from offer ID to offer
    mapping(uint256 => Offer) public offers;
    
    // Mapping from seller to their listing IDs
    mapping(address => uint256[]) public sellerListings;
    
    // Mapping from buyer to their offer IDs
    mapping(address => uint256[]) public buyerOffers;
    
    // Counter for listing IDs
    uint256 public nextListingId;
    
    // Counter for offer IDs
    uint256 public nextOfferId;

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 amount,
        uint256 pricePerCredit,
        uint256 totalPrice,
        uint256 expiresAt
    );

    event ListingCancelled(uint256 indexed listingId, address indexed seller);

    event ListingPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 totalPrice
    );

    event OfferCreated(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 pricePerCredit,
        uint256 totalPrice
    );

    event OfferAccepted(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed seller,
        address buyer,
        uint256 amount,
        uint256 totalPrice
    );

    event OfferCancelled(uint256 indexed offerId, address indexed buyer);

    constructor(
        address _carbonCreditToken,
        uint256 _marketplaceFee,
        address _feeRecipient
    ) Ownable(msg.sender) {
        require(_carbonCreditToken != address(0), "Invalid token address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        require(_marketplaceFee <= 1000, "Fee too high"); // Max 10%

        carbonCreditToken = IERC20(_carbonCreditToken);
        marketplaceFee = _marketplaceFee;
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a new listing to sell carbon credits
     */
    function createListing(
        uint256 amount,
        uint256 pricePerCredit,
        uint256 duration, // Duration in seconds
        string memory metadataIPFS
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(pricePerCredit > 0, "Price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(
            carbonCreditToken.balanceOf(msg.sender) >= amount,
            "Insufficient carbon credit balance"
        );

        // Transfer credits to marketplace for escrow
        carbonCreditToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 listingId = nextListingId++;
        uint256 totalPrice = amount * pricePerCredit;
        uint256 expiresAt = block.timestamp + duration;

        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            amount: amount,
            pricePerCredit: pricePerCredit,
            totalPrice: totalPrice,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            metadataIPFS: metadataIPFS
        });

        sellerListings[msg.sender].push(listingId);

        emit ListingCreated(
            listingId,
            msg.sender,
            amount,
            pricePerCredit,
            totalPrice,
            expiresAt
        );
    }

    /**
     * @dev Purchase credits directly from a listing
     */
    function purchaseListing(uint256 listingId, uint256 amount)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp < listing.expiresAt, "Listing expired");
        require(amount > 0 && amount <= listing.amount, "Invalid amount");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        uint256 totalCost = amount * listing.pricePerCredit;
        require(msg.value >= totalCost, "Insufficient payment");

        // Calculate fees
        uint256 fee = (totalCost * marketplaceFee) / 10000;
        uint256 sellerPayment = totalCost - fee;

        // Update listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }

        // Transfer carbon credits to buyer
        carbonCreditToken.safeTransfer(msg.sender, amount);

        // Transfer payments
        payable(listing.seller).transfer(sellerPayment);
        if (fee > 0) {
            payable(feeRecipient).transfer(fee);
        }

        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        emit ListingPurchased(
            listingId,
            msg.sender,
            listing.seller,
            amount,
            totalCost
        );
    }

    /**
     * @dev Cancel a listing and return credits to seller
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;

        // Return credits to seller
        carbonCreditToken.safeTransfer(msg.sender, listing.amount);

        emit ListingCancelled(listingId, msg.sender);
    }

    /**
     * @dev Create an offer for a specific listing
     */
    function createOffer(
        uint256 listingId,
        uint256 amount,
        uint256 pricePerCredit,
        uint256 duration
    ) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp < listing.expiresAt, "Listing expired");
        require(amount > 0 && amount <= listing.amount, "Invalid amount");
        require(pricePerCredit > 0, "Price must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(msg.sender != listing.seller, "Cannot offer on own listing");

        uint256 totalPrice = amount * pricePerCredit;
        require(msg.value >= totalPrice, "Insufficient payment for offer");

        uint256 offerId = nextOfferId++;
        uint256 expiresAt = block.timestamp + duration;

        offers[offerId] = Offer({
            offerId: offerId,
            listingId: listingId,
            buyer: msg.sender,
            amount: amount,
            pricePerCredit: pricePerCredit,
            totalPrice: totalPrice,
            expiresAt: expiresAt,
            isActive: true
        });

        buyerOffers[msg.sender].push(offerId);

        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit OfferCreated(
            offerId,
            listingId,
            msg.sender,
            amount,
            pricePerCredit,
            totalPrice
        );
    }

    /**
     * @dev Accept an offer (seller only)
     */
    function acceptOffer(uint256 offerId) external nonReentrant whenNotPaused {
        Offer storage offer = offers[offerId];
        require(offer.isActive, "Offer not active");
        require(block.timestamp < offer.expiresAt, "Offer expired");

        Listing storage listing = listings[offer.listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");
        require(listing.amount >= offer.amount, "Insufficient credits in listing");

        // Calculate fees
        uint256 fee = (offer.totalPrice * marketplaceFee) / 10000;
        uint256 sellerPayment = offer.totalPrice - fee;

        // Update listing and offer status
        listing.amount -= offer.amount;
        if (listing.amount == 0) {
            listing.isActive = false;
        }
        offer.isActive = false;

        // Transfer carbon credits to buyer
        carbonCreditToken.safeTransfer(offer.buyer, offer.amount);

        // Transfer payments
        payable(msg.sender).transfer(sellerPayment);
        if (fee > 0) {
            payable(feeRecipient).transfer(fee);
        }

        emit OfferAccepted(
            offerId,
            offer.listingId,
            msg.sender,
            offer.buyer,
            offer.amount,
            offer.totalPrice
        );
    }

    /**
     * @dev Cancel an offer and refund buyer
     */
    function cancelOffer(uint256 offerId) external nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.buyer == msg.sender, "Not the buyer");
        require(offer.isActive, "Offer not active");

        offer.isActive = false;

        // Refund buyer
        payable(msg.sender).transfer(offer.totalPrice);

        emit OfferCancelled(offerId, msg.sender);
    }

    /**
     * @dev Get active listings (paginated)
     */
    function getActiveListings(uint256 offset, uint256 limit)
        external
        view
        returns (Listing[] memory)
    {
        uint256 totalListings = nextListingId;
        if (offset >= totalListings) {
            return new Listing[](0);
        }

        uint256 end = offset + limit;
        if (end > totalListings) {
            end = totalListings;
        }

        uint256 activeCount = 0;
        for (uint256 i = offset; i < end; i++) {
            if (listings[i].isActive && block.timestamp < listings[i].expiresAt) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = offset; i < end; i++) {
            if (listings[i].isActive && block.timestamp < listings[i].expiresAt) {
                activeListings[currentIndex] = listings[i];
                currentIndex++;
            }
        }

        return activeListings;
    }

    /**
     * @dev Update marketplace fee (owner only)
     */
    function setMarketplaceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        marketplaceFee = _fee;
    }

    /**
     * @dev Update fee recipient (owner only)
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
        }
    }
}