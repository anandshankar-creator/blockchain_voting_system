const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    console.log(`Voting deployed to ${voting.target}`);

    // Seeding some candidates
    const candidates = ["Alice", "Bob", "Charlie"];
    for (const name of candidates) {
        const tx = await voting.addCandidate(name);
        await tx.wait();
        console.log(`Added candidate: ${name}`);
    }

    const addressPath = path.join(__dirname, "../../backend/contract-address.json");
    fs.writeFileSync(addressPath, JSON.stringify({ address: voting.target }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
