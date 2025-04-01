import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function RequisitionForm() {
  const { account, library } = useWeb3();
  const [formData, setFormData] = useState({
    title: "",
    minSalary: "",
    maxSalary: "",
    skills: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/requisitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        recruiter: account
      })
    });
    const result = await response.json();
    console.log("TX Hash:", result.txHash);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Requisition</h2>
      <form onSubmit={handleSubmit}>
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Mint Requisition NFT (0.1 ETH)
        </button>
      </form>
    </div>
  );
}