import { useState } from "react";
// import { Web3Context } from '../context/Web3Context';
import { useWeb3 } from '@/context/Web3Context';
import { loadStripe } from "@stripe/stripe-js";

export default function EmployerDashboard() {
  const { account } = useWeb3();
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    skills: []
  });

  const handlePostJob = async () => {
    // 1. Save to Firestore (matches your existing structure)
    const docRef = await db.collection("requisitions").add({
      ...jobData,
      employer: account,
      status: "unpaid" // For Stripe tracking
    });

    // 2. Redirect to Stripe
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({
      lineItems: [{ price: "price_123", quantity: 1 }], // Your Stripe price ID
      mode: "payment",
      successUrl: `${window.location.origin}/success?jobId=${docRef.id}`,
    });
  };

  return (
    <div className="p-4">
      <h1>Post a Job ($100)</h1>
      {/* Form fields matching your screenshot */}
      <input 
        value={jobData.title} 
        onChange={(e) => setJobData({...jobData, title: e.target.value})}
        placeholder="Job Title"
      />
      <button onClick={handlePostJob}>Pay & Post Job</button>
    </div>
  );
}