require("@nomicfoundation/hardhat-toolbox");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    networks: {
        hardhat: {
            chainId: 1337
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    }
};
