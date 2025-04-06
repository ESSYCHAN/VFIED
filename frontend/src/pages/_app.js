// src/pages/_app.js
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  // Check if the component should use the layout
  const getLayout = Component.getLayout || ((page) => page);

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