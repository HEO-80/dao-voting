# Explanation - DAO Voting

## What is on-chain governance?
A DAO (Decentralized Autonomous Organization) uses smart contracts
to let token holders make collective decisions without a central authority.
This contract implements the core voting mechanism.

## Token-weighted voting
Each voter's power equals their token balance at vote time:
votingPower = governanceToken.balanceOf(voter)
Holders with more tokens have more influence — standard in DeFi protocols.

## Proposal lifecycle
ACTIVE → PASSED → EXECUTED
ACTIVE → REJECTED

| State | Value | Meaning |
|-------|-------|---------|
| ACTIVE | 0 | Voting open |
| PASSED | 1 | Quorum reached, more FOR than AGAINST |
| REJECTED | 2 | Quorum not reached or more AGAINST |
| EXECUTED | 3 | On-chain call completed |

## Quorum
Minimum total votes (FOR + AGAINST) required for a proposal to pass.
Without quorum, even a unanimous vote can be rejected — prevents
low-participation attacks.

## On-chain execution
Passed proposals can execute any contract call:
```solidity
(bool success,) = proposal.target.call(proposal.callData);
```
This allows governance to control protocol parameters, treasury, upgrades.

## Proposal struct
| Field | Description |
|-------|-------------|
| `proposer` | Who created it |
| `description` | Human readable text |
| `votesFor/Against` | Accumulated token weights |
| `startTime/endTime` | Voting window |
| `state` | Current lifecycle state |
| `target + callData` | What to execute if passed |