import EmployerDashboard from '../components/recruiter/EmployerDashboard';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not employer
  if (user?.role !== 'employer') {
    router.push('/');
    return null;
  }

  return <EmployerDashboard />;
}