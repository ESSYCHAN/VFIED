// // src/pages/_app.js
// import '@/styles/globals.css';
// import { AuthProvider } from '@/context/AuthContext';
// import Layout from '@/components/Layout';
// import Head from 'next/head';
// import RoleSwitcher from '@/components/RoleSwitcher';

// function MyApp({ Component, pageProps }) {
//   // Check if the component should use the layout
//   const getLayout = Component.getLayout || ((page) => {
//     // Skip layout for auth pages
//     if (
//       Component.displayName === 'Login' || 
//       Component.name === 'Login' ||
//       Component.displayName === 'Signup' ||
//       Component.name === 'Signup' ||
//       pageProps.hideLayout
//     ) {
//       return page;
//     }
    
//     return <Layout>{page}</Layout>;
//   });

//   return (
//     <>
//       <Head>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <title>VFied - Your Credentials</title>
//       </Head>
//       <AuthProvider>
//         {getLayout(<Component {...pageProps} />)}
//         <RoleSwitcher /> {/* Add this */}
//       </AuthProvider>
//     </>
//   );
// }
// export default MyApp;


// pages/_app.js
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <AuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </AuthProvider>
  );
}

export default MyApp;