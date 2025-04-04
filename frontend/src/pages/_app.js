import '@/styles/globals.css';
import { initializeFirebase } from '@/lib/firebase';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';

// Initialize Firebase once
initializeFirebase();

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout> 
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;