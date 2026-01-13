import { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';
import './index.css'

// Dynamic API URL for deployment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("");
  const [txDetails, setTxDetails] = useState(null);
  const [account, setAccount] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchCandidates();
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (account) {
      checkRegistrationStatus();
    }
  }, [account]);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setStatus("Failed to connect wallet.");
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const registered = await contract.registeredVoters(account);
      setIsRegistered(registered);
    } catch (err) {
      console.error("Error checking registration:", err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_URL}/candidates`);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load candidates (Backend might be offline)");
    }
  };

  const handleRegister = async () => {
    setStatus("Requesting Registration from Relayer...");
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterAddress: account })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Registration Successful! You can now vote.");
        setIsRegistered(true);
      } else {
        setStatus(`Registration Failed: ${data.error}`);
      }
    } catch (err) {
      setStatus(`Network Error: ${err.message}`);
    }
  };

  const handleVote = async (id) => {
    if (!account) {
      alert("Please connect your wallet first!");
      connectWallet();
      return;
    }

    if (!isRegistered) {
      setStatus("You must register before voting!");
      return;
    }

    setStatus("Sending Vote Request to Relayer...");
    setTxDetails(null);

    try {
      // Send vote to Backend Relayer
      const res = await fetch(`${API_URL}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: id,
          voterAddress: account
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Vote Relayed Successfully on Sepolia!");
        setTxDetails(data);
        fetchCandidates();
      } else {
        setStatus(`Relayer Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus(`Network Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Campus Voting System
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 text-sm font-mono text-green-400 hidden md:block">
              System Active • Sepolia Relayer
            </div>
            {account ? (
              <div className="flex items-center gap-2">
                <div className="bg-blue-900/30 border border-blue-500/50 px-4 py-2 rounded-full font-mono text-sm text-blue-300">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                {isRegistered ? (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Registered</span>
                ) : (
                  <button onClick={handleRegister} className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-3 py-2 rounded font-bold transition-all">
                    Register Now
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-orange-500/20"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        <main className="space-y-8">
          {status && (
            <div className={`p-4 rounded border-l-4 ${status.includes("Error") || status.includes("Reverted") || status.includes("Failed") ? "bg-red-900/50 border-red-500 text-red-200" : "bg-gray-800 border-blue-500 text-blue-300"} animate-fade-in`}>
              <p className="font-bold">{status}</p>
            </div>
          )}

          {txDetails && (
            <div className="bg-gray-800 p-6 rounded-lg border border-green-500 shadow-lg animate-fade-in">
              <h3 className="text-xl font-bold text-green-400 mb-4">Blockchain Transaction Receipt</h3>
              <div className="space-y-2 font-mono text-sm text-gray-300">
                <p><span className="text-gray-500">Transaction Hash:</span> <a href={`https://sepolia.etherscan.io/tx/${txDetails.txHash}`} target="_blank" rel="noopener noreferrer" className="text-yellow-400 break-all hover:underline">{txDetails.txHash}</a></p>
                <p><span className="text-gray-500">Block Number:</span> <span className="text-blue-400">{txDetails.blockNumber}</span></p>
                <p><span className="text-gray-500">Gas Used:</span> <span className="text-purple-400">{txDetails.gasUsed} units</span></p>
                <p className="text-xs text-gray-500 mt-2">Verified on Sepolia Relayer</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map(c => (
              <div key={c.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all hover:transform hover:-translate-y-1 group">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{c.name}</h2>
                  <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
                    ID: {c.id}
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-gray-400 text-sm">Total Votes</p>
                  <p className="text-3xl font-mono font-bold text-blue-400">{c.voteCount}</p>
                </div>
                <button
                  onClick={() => handleVote(c.id)}
                  disabled={!account || !isRegistered}
                  className={`w-full py-3 rounded-lg font-bold shadow-lg transition-all active:scale-95 ${account && isRegistered ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/30 text-white" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
                >
                  {account ? (isRegistered ? "Vote (Backend Pays Gas)" : "Register to Vote") : "Connect Wallet to Vote"}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
