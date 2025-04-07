// src/pages/_app.js
import '../styles/globals.css';
// Import firebase first to ensure initialization
import '../lib/firebase'; 
import { AuthProvider } from '@/context/AuthContext';
import { Web3Provider } from '@/context/Web3Context';
import { ContractProvider } from '@/context/ContractContext';
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
        <Web3Provider>
          <ContractProvider>
            {getLayout(<Component {...pageProps} />)}
          </ContractProvider>
        </Web3Provider>
      </AuthProvider>
    </>
  );
}

export default MyApp;