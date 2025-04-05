// src/pages/_app.js (continued)
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  // Check if the component has a getLayout function
  const getLayout = Component.getLayout || ((page) => {
    // Don't wrap login and signup pages with the Layout component
    if (
      Component.displayName === 'LoginPage' || 
      Component.displayName === 'SignupPage' ||
      Component.name === 'Login' ||
      Component.name === 'Signup' ||
      pageProps.hideLayout
    ) {
      return page;
    }
    
    return <Layout>{page}</Layout>;
  });

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VFied - Your Credentials</title>
      </Head>
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  );
}

export default MyApp;