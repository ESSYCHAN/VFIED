const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    RequisitionNFT.abi,
    providerOrSigner
  );