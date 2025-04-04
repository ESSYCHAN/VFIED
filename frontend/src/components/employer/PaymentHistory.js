import { FirestoreContext } from '../../context/FirestoreContext';
import { format } from 'date-fns';

export default function PaymentHistory() {
  const { currentUser } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const unsubscribe = db.collection('payments')
      .where('employerId', '==', currentUser.uid)
      .orderBy('timestamp', 'desc')
      .onSnapshot(snap => {
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="payment-history">
      <h3>Payment History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Requisition ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td>{format(new Date(payment.timestamp), 'MMM dd, yyyy')}</td>
              <td>${(payment.amount / 100).toFixed(2)}</td>
              <td>{payment.requisitionId.substring(0, 8)}...</td>
              <td className={`status-${payment.status}`}>
                {payment.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}