const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

console.log("Checking Environment Variables...");

if (!process.env.SEPOLIA_RPC_URL) {
    console.error("❌ Error: SEPOLIA_RPC_URL is missing in backend/.env");
} else {
    console.log("✅ SEPOLIA_RPC_URL is set.");
}

if (!process.env.PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY is missing in backend/.env");
} else {
    console.log("✅ PRIVATE_KEY is set.");
}

if (!process.env.SEPOLIA_RPC_URL || !process.env.PRIVATE_KEY) {
    console.log("\nPlease edit backend/.env and add your Alchemy/Infura URL and Wallet Private Key.");
    process.exit(1);
}

console.log("Environment looks good. Attempting to run deploy...");
// If good, we valid.
