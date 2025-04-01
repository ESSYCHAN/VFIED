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

    constructor() ERC721("RequisitionNFT", "RQNFT") {}

    function mintRequisition(
        address recruiter,
        string memory title,
        uint256 minSalary,
        uint256 maxSalary,
        string memory skillsCid
    ) public onlyOwner returns (uint256) {
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
}
