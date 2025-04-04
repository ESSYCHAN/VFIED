import { Bar } from 'react-chartjs-2';
import { useFirestore } from '../../context/FirestoreContext';

export default function RevenueChart() {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const getData = async () => {
      const snapshot = await db.collection('payments')
        .where('employerId', '==', currentUser.uid)
        .get();
      
      const data = snapshot.docs.reduce((acc, doc) => {
        const date = doc.data().timestamp.toDate().toLocaleDateString('en-US', { month: 'short' });
        acc[date] = (acc[date] || 0) + doc.data().amount;
        return acc;
      }, {});

      setChartData({
        labels: Object.keys(data),
        datasets: [{
          label: 'Revenue (USD)',
          data: Object.values(data).map(amt => amt / 100),
          backgroundColor: '#4f46e5'
        }]
      });
    };
    getData();
  }, [currentUser]);

  return (
    <div className="revenue-chart">
      <h3>Monthly Revenue</h3>
      {chartData.labels ? (
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            scales: { y: { beginAtZero: true }}
          }}
        />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}