# Example - DAO Voting

## Real-world use case

A DeFi protocol has 1,000,000 governance tokens distributed
among its community. Any holder can propose changes — from
adjusting protocol fees to allocating treasury funds.

## Deployment
```solidity
DAOVoting dao = new DAOVoting(
    address(govToken),    // governance token
    7 days,               // 1 week voting period
    100_000 * 1e18        // 10% of supply needed for quorum
);
```

## Creating a proposal
```solidity
// Propose to change protocol fee to 0.3%
bytes memory callData = abi.encodeWithSignature(
    "setFee(uint256)", 30
);

uint256 proposalId = dao.createProposal(
    "Increase swap fee from 0.1% to 0.3%",
    address(protocolContract),
    callData
);
```

## Voting
```solidity
// Holders vote during the 7-day window
dao.castVote(proposalId, true);  // vote FOR
dao.castVote(proposalId, false); // vote AGAINST
```

## Finalizing and executing
```solidity
// After 7 days, anyone can finalize
dao.finalizeProposal(proposalId);

// If passed, execute the on-chain call
dao.executeProposal(proposalId);
// → protocolContract.setFee(30) is called automatically
```

## Vote outcome example
Total supply: 1,000,000 GOV
Quorum required: 100,000 GOV
Votes FOR:     350,000 GOV ✅
Votes AGAINST: 120,000 GOV
Total votes:   470,000 GOV ✅ (quorum reached)
Result: PASSED → executeProposal() available

## Who uses this pattern?
- **DeFi protocols** — community governance of parameters
- **DAOs** — treasury allocation decisions
- **NFT collections** — holder votes on roadmap
- **Staking protocols** — reward rate adjustments