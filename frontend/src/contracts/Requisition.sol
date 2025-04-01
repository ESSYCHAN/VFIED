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
        string skillsCid; // IPFS hash
        bool isActive;
    }

    mapping(uint256 => Requisition) public requisitions;
    mapping(address => uint256[]) public recruiterRequisitions;

    constructor() ERC721("VFiedRequisition", "VREQ") {}

    function mintRequisition(
        string memory title,
        uint256 minSalary,
        uint256 maxSalary,
        string memory skillsCid
    ) external payable {
        require(msg.value >= 0.1 ether, "Insufficient minting fee");

        _tokenIds.increment();
        uint256 newId = _tokenIds.current();

        _safeMint(msg.sender, newId);
        requisitions[newId] = Requisition(
            msg.sender,
            title,
            minSalary,
            maxSalary,
            skillsCid,
            true
        );
        recruiterRequisitions[msg.sender].push(newId);
    }
}
