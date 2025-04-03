import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers"; // Add this import

export default function RequisitionForm() {
  const { account, library } = useWeb3();
  const [formData, setFormData] = useState({
    title: "",
    minSalary: "",
    maxSalary: "",
    skills: []
  });
  const [isProcessing, setIsProcessing] = useState(false); // New loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // 1. First create the requisition record
      const response = await fetch("/api/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recruiter: account
        })
      });
      
      const result = await response.json();
      
      // 2. Mint NFT with payment (NEW)
      const tx = await library
        .getSigner()
        .sendTransaction({
          to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          value: ethers.utils.parseEther("0.01"), // 0.01 ETH payment
          data: contract.interface.encodeFunctionData("mintRequisition", [
            account,
            formData.title,
            formData.minSalary,
            formData.maxSalary,
            result.ipfsCid // Assuming API returns IPFS CID
          ])
        });
      
      console.log("NFT Minted:", tx.hash);
      
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Requisition</h2>
      <form onSubmit={handleSubmit}>
        {/* Existing form fields remain unchanged */}
        <input
          type="text"
          placeholder="Job Title"
          className="w-full p-2 mb-4 border rounded"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            placeholder="Min Salary"
            className="p-2 border rounded"
            value={formData.minSalary}
            onChange={(e) => setFormData({...formData, minSalary: e.target.value})}
          />
          <input
            type="number"
            placeholder="Max Salary"
            className="p-2 border rounded"
            value={formData.maxSalary}
            onChange={(e) => setFormData({...formData, maxSalary: e.target.value})}
          />
        </div>
        
        {/* Updated submit button */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? "Processing..." : "Mint Requisition NFT (0.01 ETH)"}
        </button>
      </form>
    </div>
  );
}