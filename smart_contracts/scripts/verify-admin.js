const { ethers } = require("hardhat");
require('dotenv').config({ path: '../backend/.env' });

async function main() {
    const key = "4139eccf7dee411dbcdd9372501f56cf76b21c6b29c18254d22f8307cef48dc0";
    const wallet = new ethers.Wallet(key);
    console.log("User Provided Key Address:", wallet.address);

    const contractAddress = "0x87b8b329D35580abae00d214426004543004C962";
    const Voting = await ethers.getContractFactory("Voting");
    const contract = Voting.attach(contractAddress);

    // We need a provider to read from Sepolia
    // Using the one from hardhat config (which uses .env)
    const owner = await contract.owner();
    console.log("Current Contract Owner:   ", owner);

    if (owner === wallet.address) {
        console.log("MATCH: This key IS already the Admin.");
    } else {
        console.log("MISMATCH: The contract is owned by someone else.");
    }
}

main().catch(console.error);
