const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RequisitionNFT", function () {
  let contract;
  let owner, recruiter;

  before(async () => {
    [owner, recruiter] = await ethers.getSigners();
    const RequisitionNFT = await ethers.getContractFactory("RequisitionNFT");
    contract = await RequisitionNFT.deploy();
  });

  it("Should mint a new requisition NFT", async function () {
    await expect(contract.mintRequisition(
      recruiter.address,
      "Blockchain Developer",
      100000,
      200000,
      "QmXYZ123"
    )).to.emit(contract, "Transfer");
  });
});