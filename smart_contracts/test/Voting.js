const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
    it("Should return the new voting contract once deployed", async function () {
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy();
        await voting.waitForDeployment();
        expect(await voting.target).to.not.be.undefined;
    });

    it("Should allow owner to add candidates", async function () {
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy();
        await voting.waitForDeployment();

        await voting.addCandidate("Alice");
        const candidates = await voting.getAllCandidates();
        expect(candidates.length).to.equal(1);
        expect(candidates[0].name).to.equal("Alice");
    });

    it("Should allow voting", async function () {
        const [owner, otherAccount] = await ethers.getSigners();
        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy();
        await voting.waitForDeployment();

        await voting.addCandidate("Alice");

        // otherAccount votes
        await voting.connect(otherAccount).vote(0);

        const candidates = await voting.getAllCandidates();
        expect(candidates[0].voteCount).to.equal(1);
    });
});
