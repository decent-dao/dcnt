import { DecentDAOConfig } from "../DaoBuilder/types";
import { beneficiaries } from "./beneficiaries";

// @note 1 block = 12 seconds
// @note 1 day = 7200 blocks
// @note 1 week = 50400 blocks

const ONE_YEAR = 365 * 24 * 60 * 60;
const NOW = Math.floor(Date.now() / 1000);

export const decentDAOConfig: DecentDAOConfig = {
  // name of the DAO
  name: "Decent DAO",
  // Lock Release | start timestamp of the release schedule
  unlockStart: NOW, // (seconds)
  // Lock Release | duration of the release schedule in seconds
  unlockDuration: ONE_YEAR, // (seconds)
  // Snapshot | url of the snapshot page
  snapshotENS: "decent-dao.eth",
  // DCNT Token | initial supply of the token
  initialSupply: "100", // (+18 decimals)
  // Linear Strategy |  Length of time that voting occurs
  votingPeriod: 5, // (blocks)
  // Linear Strategy | Length of time between when a proposal is passed and when it can be actually be executed.  For the top level Decent DAO we may want to have this be 0
  timeLockPeriod: 0, // (blocks)
  // Linear Strategy | Length of time that a successful proposal has to be executed, after which is will expire.  We can simply set this to the the same length decided on for Voting Period.
  executionPeriod: 86400, // (blocks)
  // Linear Strategy | Percentage of total possible tokens that must vote in order to consider a proposal result valid.  We should take into account that a large portion of tokens will be locked for investors, who may never vote.
  quorum: 4, // (basis points)
  // Linear Strategy | Percentage of total possible tokens that must vote YES in order to pass a proposal.  Suggested 50% for a simple majority.
  votingBasis: 500000, // (basis points)
  // Linear Strategy | Percentage of total possible tokens that must be delegated to a user in order for them to create a proposal.  Suggested 1%.
  proposalRequiredWeight: 0, // (basis points)
  // Lock Release | Beneficiaries of the lock release schedule
  /**
   * Beneficiaries {@link beneficiaries}
   */
  beneficiaries,
};
