import { useContract } from '../../context/ContractContext';

export default function FinancePanel() {
  const { contract } = useContract();
  
  const handleWithdraw = async () => {
    try {
      await contract.withdrawFees();
      alert('Fees withdrawn successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="finance-panel">
      <button 
        onClick={handleWithdraw}
        disabled={!contract}
      >
        Withdraw Collected Fees (Admin Only)
      </button>
    </div>
  );
}