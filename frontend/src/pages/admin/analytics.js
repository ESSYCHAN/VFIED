// frontend/src/pages/admin/analytics.js
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsDashboard() {
  const { currentUser, userRole } = useAuth();
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  
  useEffect(() => {
    if (userRole !== 'admin') {
      setError('You do not have permission to view analytics');
      setLoading(false);
      return;
    }
    
    const fetchTransactions = async () => {
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        if (dateRange === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (dateRange === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (dateRange === 'year') {
          startDate.setFullYear(startDate.getFullYear() - 1);
        }
        
        // Query transactions
        const q = query(
          collection(db, 'transactions'),
          where('timestamp', '>=', startDate),
          where('timestamp', '<=', endDate),
          where('status', '==', 'completed'),
          orderBy('timestamp', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        // Process data for charts
        const byType = {
          'job_posting_fee': 0,
          'verification_fee': 0,
          'hire_success_fee': 0,
          'subscription': 0
        };
        
        const byDate = {};
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          
          // Sum by type
          if (data.type in byType) {
            byType[data.type] += data.amount || 0;
          }
          
          // Group by date
          const date = data.timestamp.toDate().toISOString().split('T')[0];
          byDate[date] = (byDate[date] || 0) + (data.amount || 0);
        });
        
        setRevenueData({ byType, byDate });
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [userRole, dateRange]);
  
  return (
    <DashboardLayout title="Payment Analytics">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payment Analytics</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : revenueData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by type pie chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Revenue by Type</h2>
              <div className="h-64">
                <Pie
                  data={{
                    labels: ['Job Posting', 'Verification', 'Hire Success', 'Subscription'],
                    datasets: [{
                      data: [
                        revenueData.byType.job_posting_fee / 100,
                        revenueData.byType.verification_fee / 100,
                        revenueData.byType.hire_success_fee / 100,
                        revenueData.byType.subscription / 100
                      ],
                      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#6b7280']
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
            
            {/* Daily revenue bar chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Daily Revenue</h2>
              <div className="h-64">
                <Bar
                  data={{
                    labels: Object.keys(revenueData.byDate).sort(),
                    datasets: [{
                      label: 'Revenue (USD)',
                      data: Object.keys(revenueData.byDate)
                        .sort()
                        .map(date => revenueData.byDate[date] / 100),
                      backgroundColor: '#4f46e5'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No revenue data available
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}