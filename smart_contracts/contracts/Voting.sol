// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public owner;
    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;
    mapping(address => bool) public registeredVoters;

    event Voted(address indexed voter, uint256 indexed candidateId);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoterRegistered(address indexed voter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyRegistered(address _voter) {
        require(registeredVoters[_voter], "Voter is not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addCandidate(string memory _name) public onlyOwner {
        uint256 id = candidates.length;
        candidates.push(Candidate(id, _name, 0));
        emit CandidateAdded(id, _name);
    }

    function registerVoter(address _voter) public onlyOwner {
        require(!registeredVoters[_voter], "Voter is already registered");
        registeredVoters[_voter] = true;
        emit VoterRegistered(_voter);
    }

    function vote(uint256 _candidateId) public onlyRegistered(msg.sender) {
        _castVote(msg.sender, _candidateId);
    }

    function voteFor(address _voter, uint256 _candidateId) public onlyOwner onlyRegistered(_voter) {
        _castVote(_voter, _candidateId);
    }

    function _castVote(address _voter, uint256 _candidateId) internal {
        require(!hasVoted[_voter], "You have already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");

        hasVoted[_voter] = true;
        candidates[_candidateId].voteCount++;

        emit Voted(_voter, _candidateId);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }
}
