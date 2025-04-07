// src/context/Web3Context.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === null) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Web3
  useEffect(() => {
    const init = async () => {
      try {
        // Check if window.ethereum is available
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Get network information
          const network = await provider.getNetwork();
          setNetwork(network);
          
          // Get connected accounts
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            const signer = await provider.getSigner();
            setSigner(signer);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              provider.getSigner().then(setSigner);
            } else {
              setAccount(null);
              setSigner(null);
            }
          });
          
          // Listen for network changes
          window.ethereum.on('chainChanged', () => {
            window.location.reload();
          });
        } else {
          setError("Please install MetaMask to use this feature");
        }
      } catch (err) {
        console.error("Error initializing Web3:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    init();
    
    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setLoading(true);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          const signer = await provider.getSigner();
          setSigner(signer);
        }
        setError(null);
      } else {
        setError("Please install MetaMask to use this feature");
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
  };

  const value = {
    account,
    provider,
    signer,
    network,
    loading,
    error,
    connectWallet,
    disconnectWallet
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export default Web3Context;