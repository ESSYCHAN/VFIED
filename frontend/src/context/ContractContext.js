// src/context/ContractContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './Web3Context';

// Import ABI (you need to provide the actual ABI file)
// This is a placeholder since we don't have the ABI
const RequisitionNFT = {
  abi: [] // Replace with actual ABI
};

const ContractContext = createContext(null);

export function useContract() {
  const context = useContext(ContractContext);
  if (context === null) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
}

export function ContractProvider({ children }) {
  const { signer, provider, account } = useWeb3();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (!provider) return;
        
        const contractAddress = process.env.NEXT_PUBLIC_REQUISITION_CONTRACT_ADDRESS;
        
        if (!contractAddress) {
          console.warn("Contract address not found in environment variables");
          return;
        }
        
        // Create contract instance with provider for read-only operations if signer is not available
        const contractInstance = signer 
          ? new ethers.Contract(contractAddress, RequisitionNFT.abi, signer)
          : new ethers.Contract(contractAddress, RequisitionNFT.abi, provider);
          
        setContract(contractInstance);
        setError(null);
      } catch (err) {
        console.error("Error initializing contract:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initContract();
  }, [provider, signer, account]);

  const value = {
    contract,
    loading,
    error
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export default ContractContext;