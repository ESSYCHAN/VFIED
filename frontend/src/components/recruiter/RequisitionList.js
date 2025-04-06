import { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3Context"; // Fixed import
import { db } from '../../lib/firebase'; // Add missing import

export default function RequisitionList(employerId) {
  const { account, library } = useWeb3();
  const [requisitions, setRequisitions] = useState([]);

  // Change Firestore query to:
  // const firestoreQuery = employerId 
  //   ? db.collection('requisitions').where('recruiter', '==', employerId)
  //   : db.collection('requisitions');

    const firestoreQuery = isEmployer
    ? db.collection('requisitions').where('employer', '==', employerId) // New employer filter
    : employerId
      ? db.collection('requisitions').where('recruiter', '==', employerId) // Existing recruiter filter
      : db.collection('requisitions');
  


  useEffect(() => {
    const fetchRequisitions = async () => {
      const contract = new library.eth.Contract(
        RequisitionNFT.abi,
        process.env.NEXT_PUBLIC_REQUISITION_CONTRACT_ADDRESS
      );
      const reqs = await contract.methods.getRequisitionsByRecruiter(account).call();
      setRequisitions(reqs);
    };

    if (account) fetchRequisitions();
  }, [account, library]);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Your Requisitions</h3>
      <div className="space-y-4">
        {requisitions.map((req) => (
          <div key={req.id} className="p-4 border rounded-lg">
            <h4 className="font-medium">{req.title}</h4>
            <p>Salary: {req.minSalary} - {req.maxSalary}</p>
            <button className="mt-2 text-sm text-blue-600">
              View Matching Candidates
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}