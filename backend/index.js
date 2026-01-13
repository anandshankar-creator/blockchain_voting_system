const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI (Import from artifacts after compilation)
const CONTRACT_ABI = require('../smart_contracts/artifacts/contracts/Voting.sol/Voting.json').abi;
// Placeholder address, update after deployment
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || require('./contract-address.json').address;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Provider & Wallet
// Use SEPOLIA_RPC_URL if available
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Helper to get contract instance
const getContract = async () => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    if (!PRIVATE_KEY) throw new Error("Private Key not found");
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
};

app.get('/candidates', async (req, res) => {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const candidates = await contract.getAllCandidates();
        const formatted = candidates.map(c => ({
            id: c.id.toString(),
            name: c.name,
            voteCount: c.voteCount.toString()
        }));
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/vote', async (req, res) => {
    const { candidateId, voterAddress } = req.body;

    if (!voterAddress) {
        return res.status(400).json({ error: "Voter address required" });
    }

    try {
        const contract = await getContract();
        console.log(`Relaying vote for ${voterAddress} on candidate ${candidateId}...`);

        // Relayer submits the vote on behalf of the user
        const tx = await contract.voteFor(voterAddress, candidateId);
        const receipt = await tx.wait();

        console.log(`Vote relayed! Tx: ${tx.hash}`);

        res.json({
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString()
        });
    } catch (error) {
        console.error(error);
        const reason = error.reason || error.message;
        res.status(500).json({ error: reason });
    }
});

app.post('/register', async (req, res) => {
    const { voterAddress } = req.body;
    if (!voterAddress) return res.status(400).json({ error: "Address required" });

    try {
        const contract = await getContract();
        console.log(`Registering voter: ${voterAddress}...`);
        const tx = await contract.registerVoter(voterAddress);
        await tx.wait();
        console.log(`Registered ${voterAddress}`);
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error(error);
        const reason = error.reason || error.message;
        res.status(500).json({ error: reason });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
