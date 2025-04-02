import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ethers } from 'ethers';
import RequisitionNFT from '../artifacts/contracts/RequisitionNFT.sol/RequisitionNFT.json';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [web3Provider, setWeb3Provider] = useState(null);
  const [requisitionContract, setRequisitionContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [chainId, setChainId] = useState(null);

  // Existing Firebase Auth Functions (unchanged)
  async function signup(email, password, name) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name,
        createdAt: serverTimestamp(),
        role: 'candidate',
        profileComplete: false
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          role: 'candidate',
          profileComplete: false
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function signInWithGithub() {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          role: 'candidate',
          profileComplete: false,
          github: {
            username: user.reloadUserInfo.screenName || '',
            connected: true
          }
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // New Web3 Functions
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setWalletAddress(accounts[0]);
      
      const provider = new ethers.BrowserProvider(window.ethereum);

      setWeb3Provider(provider);

      const network = await provider.getNetwork();
      setChainId(network.chainId);

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_REQUISITION_CONTRACT_ADDRESS,
        RequisitionNFT.abi,
        signer
      );
      setRequisitionContract(contract);

      // Set up listeners
      window.ethereum.on('accountsChanged', (newAccounts) => {
        setWalletAddress(newAccounts[0] || '');
      });

      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(parseInt(newChainId, 16));
      });

    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Initialize auth and Web3
  useEffect(() => {
    // Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Auto-connect wallet if previously connected
    if (window.ethereum?.selectedAddress) {
      connectWallet();
    }

    return () => {
      unsubscribe();
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const value = {
    // Firebase Auth
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInWithGithub,
    
    // Web3
    web3Provider,
    requisitionContract,
    walletAddress,
    chainId,
    connectWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}