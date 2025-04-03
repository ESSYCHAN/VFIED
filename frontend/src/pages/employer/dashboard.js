import { useAuth } from '../../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement } from '@stripe/react-stripe-js';
import PaymentHistory from '../../components/employer/PaymentHistory'; // New
import RevenueChart from '../../components/employer/RevenueChart'; // New

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function EmployerDashboard() {
  const { currentUser } = useAuth();
  const [requisitions, setRequisitions] = useState([]);
  const [paymentIntent, setPaymentIntent] = useState(null);

  // Fetch employer's requisitions
  useEffect(() => {
    const unsubscribe = db.collection('requisitions')
      .where('recruiter', '==', currentUser.uid)
      .onSnapshot(snap => {
        setRequisitions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    return unsubscribe;
  }, [currentUser]);

  // Create payment intent
  const createPayment = async (reqId) => {
    const response = await fetch('/api/stripe/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        requisitionId: reqId,
        amount: 5000 // $50.00 in cents
      })
    });
    setPaymentIntent(await response.json());
  };

  return (
    <div className="dashboard-container">
      <h1>Job Requisitions</h1>
      <div className="requisition-grid">
        {requisitions.map(req => (
          <div key={req.id} className="requisition-card">
            <h3>{req.title}</h3>
            <p>Status: {req.status}</p>
            {!req.paid && (
              <button onClick={() => createPayment(req.id)}>
                Pay to Publish
              </button>
            )}
            {paymentIntent?.requisitionId === req.id && (
              <Elements stripe={stripePromise}>
                <PaymentForm intent={paymentIntent} />
              </Elements>
            )}
          </div>
        ))}
      </div>
      {/* New Monetization Section */}
      <section className="monetization-section">
        <h2 className="section-title">Billing & Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PaymentHistory userId={currentUser.uid} />
          <RevenueChart userId={currentUser.uid} />
        </div>
      </section>
    </div>
  );
}