import { useState, useEffect } from 'react';
import { useContract } from '../../context/ContractContext';

export default function NFTBadge({ requisitionId }) {
  const { contract } = useContract();
  const [nftStatus, setNftStatus] = useState('pending');

  useEffect(() => {
    const checkNFT = async () => {
      try {
        const tokenId = await contract.requisitionToTokenId(requisitionId);
        if (tokenId > 0) {
          const owner = await contract.ownerOf(tokenId);
          setNftStatus(owner ? 'minted' : 'burned');
        }
      } catch {
        setNftStatus('failed');
      }
    };
    checkNFT();
  }, [requisitionId, contract]);

  const statusConfig = {
    pending: { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
    minted: { text: 'Minted', color: 'bg-green-100 text-green-800' },
    failed: { text: 'Failed', color: 'bg-red-100 text-red-800' },
    burned: { text: 'Burned', color: 'bg-gray-100 text-gray-800' }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[nftStatus].color}`}>
      {statusConfig[nftStatus].text}
    </span>
  );
}