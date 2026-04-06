// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title DAOVoting - On-chain governance with proposals and token-weighted voting
/// @author HEO-80
/// @notice Token holders vote on proposals. Quorum required for execution.
contract DAOVoting {

    enum ProposalState { ACTIVE, PASSED, REJECTED, EXECUTED }

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        ProposalState state;
        address target;
        bytes callData;
    }

    IERC20 public immutable governanceToken;
    uint256 public votingDuration;
    uint256 public quorum;
    uint256 public proposalCount;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalFinalized(uint256 indexed proposalId, ProposalState state);

    constructor(
        address _governanceToken,
        uint256 _votingDuration,
        uint256 _quorum
    ) {
        require(_governanceToken != address(0), "Invalid token");
        require(_votingDuration > 0, "Invalid voting duration");
        require(_quorum > 0, "Invalid quorum");
        governanceToken = IERC20(_governanceToken);
        votingDuration = _votingDuration;
        quorum = _quorum;
    }

    /// @notice Create a new proposal
    /// @param description Human readable description of the proposal
    /// @param target Contract address to call on execution (address(0) if none)
    /// @param callData Encoded function call for execution
    function createProposal(
        string memory description,
        address target,
        bytes memory callData
    ) external returns (uint256) {
        require(governanceToken.balanceOf(msg.sender) > 0, "Must hold tokens to propose");

        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + votingDuration,
            state: ProposalState.ACTIVE,
            target: target,
            callData: callData
        });

        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }

    /// @notice Cast a vote on an active proposal
    /// @param proposalId ID of the proposal
    /// @param support True to vote for, false to vote against
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.ACTIVE, "Proposal not active");
        require(block.timestamp <= proposal.endTime, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = governanceToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /// @notice Finalize a proposal after voting period ends
    /// @param proposalId ID of the proposal to finalize
    function finalizeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.ACTIVE, "Proposal not active");
        require(block.timestamp > proposal.endTime, "Voting period not ended");

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;

        if (totalVotes >= quorum && proposal.votesFor > proposal.votesAgainst) {
            proposal.state = ProposalState.PASSED;
        } else {
            proposal.state = ProposalState.REJECTED;
        }

        emit ProposalFinalized(proposalId, proposal.state);
    }

    /// @notice Execute a passed proposal
    /// @param proposalId ID of the proposal to execute
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.state == ProposalState.PASSED, "Proposal not passed");
        require(proposal.target != address(0), "No target to execute");

        proposal.state = ProposalState.EXECUTED;

        (bool success,) = proposal.target.call(proposal.callData);
        require(success, "Execution failed");

        emit ProposalExecuted(proposalId);
    }

    /// @notice Returns proposal state
    function getProposalState(uint256 proposalId) external view returns (ProposalState) {
        return proposals[proposalId].state;
    }
}