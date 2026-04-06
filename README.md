<div align="center">

<br/>

# 🏛️ DAO Voting

### Propose. Vote. Execute. On-chain governance done right.

A decentralized governance contract where token holders create proposals,
vote with their token weight, and execute approved decisions on-chain.

<br/>

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-3.x-f7df1e?style=for-the-badge)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.x-4e5ee4?style=for-the-badge&logo=openzeppelin&logoColor=white)](https://openzeppelin.com/)
[![Tests](https://img.shields.io/badge/Tests-8%2F8%20passing-brightgreen?style=for-the-badge)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-c792ea?style=for-the-badge)](LICENSE)

<br/>

> Part of the [Solidity Portfolio](https://github.com/HEO-80/solidity-portfolio) by HEO-80

</div>

---

## 📋 Overview

| Property | Value |
|----------|-------|
| Voting power | Token-weighted (1 token = 1 vote) |
| Phases | ACTIVE → PASSED / REJECTED → EXECUTED |
| Quorum | Configurable minimum votes required |
| Execution | On-chain call to any contract |
| Duration | Configurable voting period |

---

## ⚙️ How it worksToken holder creates proposal
│
Voting period opens
│
Holders cast votes (weighted by token balance)
│
Voting period ends
│
Anyone calls finalizeProposal()
│
votesFor > votesAgainst
AND totalVotes >= quorum?
┌────┴────┐
YES       NO
│         │
PASSED    REJECTED
│
executeProposal() → on-chain call

---

## 🚀 Quickstart
```bashgit clone https://github.com/HEO-80/dao-voting.git
cd dao-voting
npm install
npx hardhat build
npx hardhat test

---

## 📁 Project Structuredao-voting/
├── contracts/
│   ├── DAOVoting.sol         # Main governance contract
│   └── MockERC20.sol         # ERC-20 mock for testing
├── test/
│   └── DAOVoting.test.js     # 8 tests
├── README.md
├── STEPS.md
├── EXPLANATION.md
└── EXAMPLE.md

---

## 🧪 Tests

| Test | Status |
|------|--------|
| Deploy with correct parameters | ✅ |
| Token holder can create proposal | ✅ |
| Non token holder cannot create proposal | ✅ |
| Token holder can vote | ✅ |
| Cannot vote twice | ✅ |
| Pass proposal with enough votes | ✅ |
| Reject proposal with more votes against | ✅ |
| Cannot finalize before voting period ends | ✅ |

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Solidity 0.8.28 | Smart contract language |
| Hardhat 3 | Development environment |
| OpenZeppelin 5 | IERC20 interface |
| Mocha + Chai | Test framework |

---

## 👤 Author

**Héctor Oviedo** — Full Stack Developer & DeFi Researcher

[![GitHub](https://img.shields.io/badge/GitHub-HEO--80-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/HEO-80)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-hectorob-0077b5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/hectorob)

---

<div align="center">

*Tested. Documented. Ready to deploy.*

</div>