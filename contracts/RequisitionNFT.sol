// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RequisitionNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Requisition {
        address recruiter;
        string title;
        uint256 minSalary;
        uint256 maxSalary;
        string skillsCid;
        bool isActive;
    }

    mapping(uint256 => Requisition) public requisitions;

    // ONLY ADDITION: Monetization variable
    uint256 public constant MINT_FEE = 0.01 ether;

    constructor() ERC721("RequisitionNFT", "RQNFT") {}

    // MODIFIED FUNCTION: Added payment check
    function mintRequisition(
        address recruiter,
        string memory title,
        uint256 minSalary,
        uint256 maxSalary,
        string memory skillsCid
    ) public payable onlyOwner returns (uint256) {
        require(msg.value == MINT_FEE, "Incorrect payment amount"); // NEW LINE

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recruiter, newItemId);

        requisitions[newItemId] = Requisition(
            recruiter,
            title,
            minSalary,
            maxSalary,
            skillsCid,
            true
        );
        return newItemId;
    }

    // ONLY ADDITION: Withdraw function for collected fees
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
