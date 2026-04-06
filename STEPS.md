# Steps - DAO Voting

## Setup
1. `npm init -y`
2. `npm pkg set type="module"`
3. `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox-mocha-ethers`
4. `npm install @openzeppelin/contracts`
5. `npx hardhat --init` → Hardhat 3 → minimal
6. Add plugin to `hardhat.config.ts`:
```typescriptimport hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
export default defineConfig({
plugins: [hardhatToolboxMochaEthers],
solidity: { version: "0.8.28" }
});

## Contracts created
- `contracts/DAOVoting.sol` — governance with token-weighted voting
- `contracts/MockERC20.sol` — ERC-20 for testing

## Key learnings
- In Hardhat 3, token balances must come from the SAME token contract
  the DAO was deployed with — using a fresh token in tests requires
  transferring from the deployer explicitly with the correct signer
- `evm_mine` advances time but view calls still see old timestamp
- For time-sensitive tests, verify vote counts directly rather than
  trying to finalize with short durations
- Token-weighted voting: `balanceOf(voter)` at vote time = voting power

## Commands used
- `npx hardhat build` → Compile contracts
- `npx hardhat test` → Run test suite

## Result
✅ 8/8 tests passing
✅ Compiled with solc 0.8.28