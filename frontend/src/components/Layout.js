// import { Fragment, useState } from 'react';
// import { useRouter } from 'next/router';
// import { useAuth } from '../contexts/AuthContext';
// import Link from 'next/link';
// import { Disclosure, Menu, Transition } from '@headlessui/react';
// import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';

// function classNames(...classes) {
//   return classes.filter(Boolean).join(' ');
// }

// export default function Layout({ children }) {
//   const { currentUser, logout } = useAuth();
//   const router = useRouter();
//   const [error, setError] = useState('');

//   async function handleLogout() {
//     try {
//       setError('');
//       await logout();
//       router.push('/login');
//     } catch {
//       setError('Failed to log out');
//     }
//   }

//   // Define navigation items based on current path
//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard', current: router.pathname === '/dashboard' },
//     { name: 'Profile', href: '/profile', current: router.pathname === '/profile' },
//     { name: 'Settings', href: '/settings', current: router.pathname === '/settings' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <Disclosure as="nav" className="bg-indigo-600">
//         {({ open }) => (
//           <>
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               <div className="flex items-center justify-between h-16">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0">
//                     <Link href="/" className="text-white font-bold text-xl">
//                       VFied
//                     </Link>
//                   </div>
//                   <div className="hidden md:block">
//                     <div className="ml-10 flex items-baseline space-x-4">
//                       {navigation.map((item) => (
//                         <Link
//                           key={item.name}
//                           href={item.href}
//                           className={classNames(
//                             item.current
//                               ? 'bg-indigo-700 text-white'
//                               : 'text-white hover:bg-indigo-500',
//                             'px-3 py-2 rounded-md text-sm font-medium'
//                           )}
//                           aria-current={item.current ? 'page' : undefined}
//                         >
//                           {item.name}
//                         </Link>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="hidden md:block">
//                   <div className="ml-4 flex items-center md:ml-6">
//                     <button className="bg-indigo-600 p-1 rounded-full text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
//                       <span className="sr-only">View notifications</span>
//                       <BellIcon className="h-6 w-6" aria-hidden="true" />
//                     </button>

//                     {/* Profile dropdown */}
//                     <Menu as="div" className="ml-3 relative">
//                       {({ open }) => (
//                         <>
//                           <div>
//                             <Menu.Button className="max-w-xs bg-indigo-600 rounded-full flex items-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
//                               <span className="sr-only">Open user menu</span>
//                               <div className="h-8 w-8 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-800 font-bold">
//                                 {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
//                               </div>
//                             </Menu.Button>
//                           </div>
//                           <Transition
//                             as={Fragment}
//                             enter="transition ease-out duration-100"
//                             enterFrom="transform opacity-0 scale-95"
//                             enterTo="transform opacity-100 scale-100"
//                             leave="transition ease-in duration-75"
//                             leaveFrom="transform opacity-100 scale-100"
//                             leaveTo="transform opacity-0 scale-95"
//                           >
//                             <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
//                               <Menu.Item>
//                                 {({ active }) => (
//                                   <Link
//                                     href="/profile"
//                                     className={classNames(
//                                       active ? 'bg-gray-100' : '',
//                                       'block px-4 py-2 text-sm text-gray-700'
//                                     )}
//                                   >
//                                     Your Profile
//                                   </Link>
//                                 )}
//                               </Menu.Item>
//                               <Menu.Item>
//                                 {({ active }) => (
//                                   <Link
//                                     href="/settings"
//                                     className={classNames(
//                                       active ? 'bg-gray-100' : '',
//                                       'block px-4 py-2 text-sm text-gray-700'
//                                     )}
//                                   >
//                                     Settings
//                                   </Link>
//                                 )}
//                               </Menu.Item>
//                               <Menu.Item>
//                                 {({ active }) => (
//                                   <button
//                                     className={classNames(
//                                       active ? 'bg-gray-100' : '',
//                                       'block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer'
//                                     )}
//                                     onClick={handleLogout}
//                                   >
//                                     Sign out
//                                   </button>
//                                 )}
//                               </Menu.Item>
//                             </Menu.Items>
//                           </Transition>
//                         </>
//                       )}
//                     </Menu>
//                   </div>
//                 </div>
//                 <div className="-mr-2 flex md:hidden">
//                   {/* Mobile menu button */}
//                   <Disclosure.Button className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
//                     <span className="sr-only">Open main menu</span>
//                     {open ? (
//                       <XIcon className="block h-6 w-6" aria-hidden="true" />
//                     ) : (
//                       <MenuIcon className="block h-6 w-6" aria-hidden="true" />
//                     )}
//                   </Disclosure.Button>
//                 </div>
//               </div>
//             </div>

//             <Disclosure.Panel className="md:hidden">
//               <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
//                 {navigation.map((item) => (
//                   <Disclosure.Button
//                     key={item.name}
//                     as="a"
//                     href={item.href}
//                     className={classNames(
//                       item.current
//                         ? 'bg-indigo-700 text-white'
//                         : 'text-white hover:bg-indigo-500',
//                       'block px-3 py-2 rounded-md text-base font-medium'
//                     )}
//                     aria-current={item.current ? 'page' : undefined}
//                   >
//                     {item.name}
//                   </Disclosure.Button>
//                 ))}
//               </div>
//               <div className="pt-4 pb-3 border-t border-indigo-700">
//                 <div className="flex items-center px-5">
//                   <div className="flex-shrink-0">
//                     <div className="h-10 w-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-800 font-bold text-lg">
//                       {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
//                     </div>
//                   </div>
//                   <div className="ml-3">
//                     <div className="text-base font-medium text-white">
//                       {currentUser?.displayName || 'User'}
//                     </div>
//                     <div className="text-sm font-medium text-indigo-300">
//                       {currentUser?.email || ''}
//                     </div>
//                   </div>
//                   <button className="ml-auto bg-indigo-600 flex-shrink-0 p-1 rounded-full text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
//                     <span className="sr-only">View notifications</span>
//                     <BellIcon className="h-6 w-6" aria-hidden="true" />
//                   </button>
//                 </div>
//                 <div className="mt-3 px-2 space-y-1">
//                   <Disclosure.Button
//                     as="a"
//                     href="/profile"
//                     className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500"
//                   >
//                     Your Profile
//                   </Disclosure.Button>
//                   <Disclosure.Button
//                     as="a"
//                     href="/settings"
//                     className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500"
//                   >
//                     Settings
//                   </Disclosure.Button>
//                   <Disclosure.Button
//                     as="a"
//                     onClick={handleLogout}
//                     className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-500 cursor-pointer"
//                   >
//                     Sign out
//                   </Disclosure.Button>
//                 </div>
//               </div>
//             </Disclosure.Panel>
//           </>
//         )}
//       </Disclosure>

//       <main>
//         <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//           {error && (
//             <div className="rounded-md bg-red-50 p-4 mb-6">
//               <div className="text-sm text-red-700">{error}</div>
//             </div>
//           )}
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }

import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { styles } from '../styles/sharedStyles';

export default function Layout({ children }) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={styles.logo}>VFied</div>
        </Link>
        <nav style={styles.nav}>
          <Link 
            href="/dashboard" 
            style={{
              ...styles.navLink, 
              ...(router.pathname === '/dashboard' ? styles.activeNavLink : {})
            }}
          >
            Dashboard
          </Link>
          <Link 
            href="/profile" 
            style={{
              ...styles.navLink, 
              ...(router.pathname === '/profile' ? styles.activeNavLink : {})
            }}
          >
            Profile
          </Link>
          <Link 
            href="/settings" 
            style={{
              ...styles.navLink, 
              ...(router.pathname === '/settings' ? styles.activeNavLink : {})
            }}
          >
            Settings
          </Link>
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.navLink, 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </nav>
      </header>
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}