// frontend/src/components/payment/PaymentHistory.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function PaymentHistory({ limit = 10 }) {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(limit)
        );
        
        const querySnapshot = await getDocs(q);
        
        const transactionList = [];
        querySnapshot.forEach(doc => {
          transactionList.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
        
        setTransactions(transactionList);
        setError(null);
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentUser, limit]);
  
  const formatType = (type) => {
    switch (type) {
      case 'job_posting_fee': return 'Job Posting';
      case 'verification_fee': return 'Verification';
      case 'hire_success_fee': return 'Hire Success Fee';
      case 'subscription': return 'Subscription';
      default: return type;
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Payment History</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Your recent transactions</p>
      </div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 text-red-700 border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading your payment history...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No payment history found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.timestamp.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatType(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(transaction.amount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        transaction.status === 'failed' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}