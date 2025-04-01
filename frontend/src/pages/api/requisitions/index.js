import { ethers } from "ethers";
import RequisitionNFT from "../../../artifacts/contracts/Requisition.sol/RequisitionNFT.json";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      process.env.REQUISITION_CONTRACT_ADDRESS,
      RequisitionNFT.abi,
      wallet
    );

    const tx = await contract.mintRequisition(
      req.body.title,
      req.body.minSalary,
      req.body.maxSalary,
      req.body.skillsCid,
      { value: ethers.utils.parseEther("0.1") }
    );

    res.status(200).json({ txHash: tx.hash });
  }
}