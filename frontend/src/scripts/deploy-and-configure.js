async function main() {
  // Deploy contract
  const RequisitionNFT = await ethers.getContractFactory("RequisitionNFT");
  const contract = await RequisitionNFT.deploy();
  await contract.deployed();

  // Configure payment receiver
  await contract.setPaymentReceiver("0xYourTreasuryAddress");

  console.log("Deployed to:", contract.address);
}