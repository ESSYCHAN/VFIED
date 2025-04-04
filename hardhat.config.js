require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/10175f730902445e87cb346a8bee27e5", // Direct URL for testing
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
      chainId: 11155111
    }
  }
};