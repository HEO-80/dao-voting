import { expect } from "chai";
import { network } from "hardhat";

describe("DAOVoting", function () {
  let dao, token, owner, voter1, voter2, voter3;
  const VOTING_DURATION = 1n; // 1 second for testing
  const QUORUM = 100n * 10n ** 18n; // 100 tokens

  beforeEach(async function () {
    const { ethers } = await network.connect();
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Gov Token", "GOV", 10000n * 10n ** 18n);

    // Distribute tokens
    await token.transfer(voter1.address, 500n * 10n ** 18n);
    await token.transfer(voter2.address, 300n * 10n ** 18n);
    await token.transfer(voter3.address, 200n * 10n ** 18n);

    const DAO = await ethers.getContractFactory("DAOVoting");
    dao = await DAO.deploy(
      await token.getAddress(),
      VOTING_DURATION,
      QUORUM
    );
  });

  it("Should deploy with correct parameters", async function () {
    expect(await dao.votingDuration()).to.equal(VOTING_DURATION);
    expect(await dao.quorum()).to.equal(QUORUM);
  });

  it("Token holder can create proposal", async function () {
    await dao.connect(voter1).createProposal("Proposal 1", "0x0000000000000000000000000000000000000000", "0x");
    expect(await dao.proposalCount()).to.equal(1n);
  });

  it("Non token holder cannot create proposal", async function () {
    const { ethers } = await network.connect();
    const noTokens = ethers.Wallet.createRandom().connect(ethers.provider);
    await expect(
      dao.connect(noTokens).createProposal("Proposal", "0x0000000000000000000000000000000000000000", "0x")
    ).to.be.reverted;
  });

  it("Token holder can vote", async function () {
    await dao.connect(voter1).createProposal("Proposal 1", "0x0000000000000000000000000000000000000000", "0x");
    await dao.connect(voter1).castVote(0n, true);
    const proposal = await dao.proposals(0n);
    expect(proposal.votesFor).to.equal(500n * 10n ** 18n);
  });

  it("Cannot vote twice", async function () {
    await dao.connect(voter1).createProposal("Proposal 1", "0x0000000000000000000000000000000000000000", "0x");
    await dao.connect(voter1).castVote(0n, true);
    await expect(
      dao.connect(voter1).castVote(0n, true)
    ).to.be.revertedWith("Already voted");
  });

  it("Should pass proposal with enough votes", async function () {
    await dao.connect(voter1).createProposal("Proposal 1", "0x0000000000000000000000000000000000000000", "0x");
    await dao.connect(voter1).castVote(0n, true);
    await dao.connect(voter2).castVote(0n, true);

    // Mine blocks to advance past voting duration
    await network.connect().then(async ({ ethers }) => {
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);
    });

    await dao.finalizeProposal(0n);
    expect(await dao.getProposalState(0n)).to.equal(1n); // PASSED
  });

  it("Should reject proposal with more votes against", async function () {
    await dao.connect(voter1).createProposal("Proposal 1", "0x0000000000000000000000000000000000000000", "0x");
    await dao.connect(voter1).castVote(0n, false);
    await dao.connect(voter2).castVote(0n, false);

    await network.connect().then(async ({ ethers }) => {
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);
    });

    await dao.finalizeProposal(0n);
    expect(await dao.getProposalState(0n)).to.equal(2n); // REJECTED
  });

  it("Cannot finalize before voting period ends", async function () {
    await dao.connect(voter1).createProposal("Proposal 1", "0x0000000000000000000000000000000000000000", "0x");
    await expect(
      dao.finalizeProposal(0n)
    ).to.be.revertedWith("Voting period not ended");
  });
});