import { createContext } from 'react';
export const ContractContext = createContext(null);
export default ContractContext;
// const contract = new ethers.Contract(
//     process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
//     RequisitionNFT.abi,
//     providerOrSigner
//   );