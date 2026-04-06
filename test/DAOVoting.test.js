import { expect } from "chai";
import { network } from "hardhat";

describe("DAOVoting", function () {
  let dao, token, owner, voter1, voter2, voter3, noTokens;
  const VOTING_DURATION = 100n;
  const QUORUM = 100n * 10n ** 18n;
 const ZERO = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    const { ethers } = await network.connect();
    [owner, voter1, voter2, voter3, , noTokens] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("Gov Token", "GOV", 10000n * 10n ** 18n);

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
    const { ethers } = await network.connect();
    await dao.connect(voter1).createProposal("Proposal 1", ZERO , "0x");
    expect(await dao.proposalCount()).to.equal(1n);
  });

  it("Non token holder cannot create proposal", async function () {
    const { ethers } = await network.connect();
    await expect(
      dao.connect(noTokens).createProposal("Proposal", ZERO , "0x")
    ).to.be.revertedWith("Must hold tokens to propose");
  });

  it("Token holder can vote", async function () {
    const { ethers } = await network.connect();
    await dao.connect(voter1).createProposal("Proposal 1", ZERO , "0x");
    await dao.connect(voter1).castVote(0n, true);
    const proposal = await dao.proposals(0n);
    expect(proposal.votesFor).to.equal(500n * 10n ** 18n);
  });

  it("Cannot vote twice", async function () {
    const { ethers } = await network.connect();
    await dao.connect(voter1).createProposal("Proposal 1", ZERO , "0x");
    await dao.connect(voter1).castVote(0n, true);
    await expect(
      dao.connect(voter1).castVote(0n, true)
    ).to.be.revertedWith("Already voted");
  });

  it("Should pass proposal with enough votes", async function () {
    const { ethers } = await network.connect();
    const signers = await ethers.getSigners();
    const v1 = signers[1];
    const v2 = signers[2];

    const Token = await ethers.getContractFactory("MockERC20");
    const freshToken = await Token.deploy("Gov Token", "GOV", 10000n * 10n ** 18n);
    
    // Transfer from deployer (signers[0]) to voters
    await freshToken.connect(signers[0]).transfer(v1.address, 500n * 10n ** 18n);
    await freshToken.connect(signers[0]).transfer(v2.address, 300n * 10n ** 18n);

    const DAO = await ethers.getContractFactory("DAOVoting");
    const longDao = await DAO.deploy(await freshToken.getAddress(), 1000n, QUORUM);

    await longDao.connect(v1).createProposal("Proposal 1", ZERO, "0x");
    await longDao.connect(v1).castVote(0n, true);
    await longDao.connect(v2).castVote(0n, true);

    const proposal = await longDao.proposals(0n);
    expect(proposal.votesFor).to.equal(500n * 10n ** 18n + 300n * 10n ** 18n);
    expect(proposal.votesFor).to.be.greaterThan(proposal.votesAgainst);
    expect(proposal.votesFor + proposal.votesAgainst).to.be.greaterThan(QUORUM);
  });
  
  it("Should reject proposal with more votes against", async function () {
    const { ethers } = await network.connect();

    const Token = await ethers.getContractFactory("MockERC20");
    const freshToken = await Token.deploy("Gov Token", "GOV", 10000n * 10n ** 18n);
    await freshToken.transfer(voter1.address, 500n * 10n ** 18n);
    await freshToken.transfer(voter2.address, 300n * 10n ** 18n);

    const DAO = await ethers.getContractFactory("DAOVoting");
    const shortDao = await DAO.deploy(await freshToken.getAddress(), 1n, QUORUM);

    await shortDao.connect(voter1).createProposal("Proposal 1", ZERO, "0x");
    await shortDao.connect(voter1).castVote(0n, false);
    await shortDao.connect(voter2).castVote(0n, false);

    await ethers.provider.send("evm_mine", []);
    await ethers.provider.send("evm_mine", []);

    await shortDao.finalizeProposal(0n);
    expect(await shortDao.getProposalState(0n)).to.equal(2n);
  });

  it("Cannot finalize before voting period ends", async function () {
    const { ethers } = await network.connect();
    await dao.connect(voter1).createProposal("Proposal 1", ZERO , "0x");
    await expect(
      dao.finalizeProposal(0n)
    ).to.be.revertedWith("Voting period not ended");
  });
});