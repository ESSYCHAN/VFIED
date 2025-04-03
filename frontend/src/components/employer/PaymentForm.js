import { useStripe, useElements } from '@stripe/react-stripe-js';

export default function PaymentForm({ intent }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      intent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: 'Employer' }
        }
      }
    );
    if (stripeError) setError(stripeError.message);
    else {
      await db.collection('payments').doc(intent.requisitionId).set({
        status: 'completed',
        amount: intent.amount,
        createdAt: new Date()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay ${intent.amount / 100}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}