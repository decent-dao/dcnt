import { ethers } from "ethers";

export const decentDAOConfig = {
  lockStart: Math.floor(Date.now() / 1000), // (Now) Start time of token lock
  lockDuration: 60 * 60 * 24 * 365, // 1 year
  snapshotURL: "https://snapshot.org/#/decentdao.eth",
  initialSupply: "1000000",
  votingPeriod: 86400, // Length of time (in blocks) that voting occurs.
  quorum: 4, // Percentage of total possible tokens that must vote in order to consider a proposal result valid.  We should take into account that a large portion of tokens will be locked for investors, who may never vote.
  timeLockPeriod: 86400, //  Length of time (in blocks) between when a proposal is passed and when it can be actually be executed.  For the top level Decent DAO we may want to have this be 0
  executionPeriod: 86400, // Length of time (in blocks) that a successful proposal has to be executed, after which is will expire.  We can simply set this to the the same length decided on for Voting Period.
  votingBasis: 500000, // the percentage of YES votes required to pass a proposal.  Suggested 50% for a simple majority.
  proposalRequiredWeight: 0, // Required token delegation amount in order to create proposals.  Suggested 1.  Mainnet has less risk of proposal spam, but having something delegated makes sense
  // @todo replace with real addresses and amounts
  beneficiaries: [
    {
      address: "0x629750317d320B8bB4d48D345A6d699Cc855c4a6",
      lockedAmount: ethers.utils.parseEther("1"),
    },
    {
      address: "0x065FEDAaD9486C7647EBe78cD5be05A5DF29Fe76",
      lockedAmount: ethers.utils.parseEther("1"),
    },
  ],
};
