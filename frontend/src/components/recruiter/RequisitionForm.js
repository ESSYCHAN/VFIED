import { useState } from "react";
import { Web3Context } from '../../context/Web3Context';
import { ethers } from "ethers";
import { ContractContext } from '../../context/ContractContext';
// import { useContract } from "../context/ContractContext"; // Add this import

export default function RequisitionForm() {
  const { account, library } = Web3Context(); 
  const { contract } = useContract(); // Get contract instance
  const [formData, setFormData] = useState({
    title: "",
    minSalary: "",
    maxSalary: "",
    skills: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // 1. Validate form data
      if (!formData.title || !formData.minSalary || !formData.maxSalary) {
        throw new Error("Please fill all required fields");
      }

      // 2. Create Firestore record
      const response = await fetch("/api/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recruiter: account, // Using wallet address as recruiter ID
          status: "draft", // Ensure status field exists
          createdAt: new Date().toISOString() // Add timestamp
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create requisition record");
      }

      const result = await response.json();

      // 3. Mint NFT with payment
      const tx = await contract.mintRequisition(
        account,
        formData.title,
        formData.minSalary,
        formData.maxSalary,
        result.ipfsCid || "default_cid", // Fallback CID
        { value: ethers.utils.parseEther("0.01") }
      );

      console.log("NFT Minted:", tx.hash);
      
      // Optional: Wait for transaction confirmation
      await tx.wait(1);
      
    } catch (err) {
      console.error("Submission Error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Requisition</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title *"
          className="w-full p-2 mb-4 border rounded"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            placeholder="Min Salary *"
            className="p-2 border rounded"
            value={formData.minSalary}
            onChange={(e) => setFormData({...formData, minSalary: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Max Salary *"
            className="p-2 border rounded"
            value={formData.maxSalary}
            onChange={(e) => setFormData({...formData, maxSalary: e.target.value})}
            required
          />
        </div>
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