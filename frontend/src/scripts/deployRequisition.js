const hre = require("hardhat");

async function main() {
  const Requisition = await hre.ethers.getContractFactory("RequisitionNFT");
  const requisition = await Requisition.deploy();

  await requisition.deployed();
  console.log("RequisitionNFT deployed to:", requisition.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});