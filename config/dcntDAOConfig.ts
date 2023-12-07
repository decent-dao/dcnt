import { DecentDAOConfig } from "../DaoBuilder/types";
import { beneficiaries } from "./beneficiaries";

const NOW = Math.floor(Date.now() / 1000);

const ONE_SECOND = 1;
const SECONDS_PER_BLOCK = 12;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const ONE_MINUTE_OF_SECONDS = ONE_SECOND * SECONDS_PER_MINUTE;
const ONE_HOUR_OF_SECONDS = ONE_MINUTE_OF_SECONDS * MINUTES_PER_HOUR;
const ONE_DAY_OF_SECONDS = ONE_HOUR_OF_SECONDS * HOURS_PER_DAY;

const ONE_MINUTE_OF_BLOCKS = ONE_MINUTE_OF_SECONDS / SECONDS_PER_BLOCK;
const ONE_HOUR_OF_BLOCKS = ONE_MINUTE_OF_BLOCKS * MINUTES_PER_HOUR;
const ONE_DAY_OF_BLOCKS = ONE_HOUR_OF_BLOCKS * HOURS_PER_DAY;

export const decentDAOConfig: DecentDAOConfig = {
  // name of the Token
  tokenName: "Decent",
  // symbol of the Token
  tokenSymbol: "DCNT",
  // name of the DAO
  name: "Decent DAO",
  // Lock Release | start timestamp of the release schedule
  unlockStartTimestamp: NOW + ONE_HOUR_OF_SECONDS * 12, // (seconds)
  // Lock Release | duration of the release schedule in seconds
  unlockDurationSeconds: ONE_DAY_OF_SECONDS, // (seconds)
  // Snapshot | url of the snapshot page
  snapshotENS: "decent-dao.eth",
  // DCNT Token | initial supply of the token
  initialSupply: "100", // (+18 decimals)
  // Linear Strategy |  Length of time that voting occurs
  votingPeriodBlocks: ONE_DAY_OF_BLOCKS, // (blocks)
  // Linear Strategy | Length of time between when a proposal is passed and when it can be actually be executed.
  timeLockPeriodBlocks: ONE_MINUTE_OF_BLOCKS * 10, // (blocks)
  // Linear Strategy | Length of time that a successful proposal has to be executed, after which is will expire.
  executionPeriodBlocks: ONE_DAY_OF_BLOCKS * 12, // (blocks)
  // Linear Strategy | Percentage of total possible tokens that must vote in order to consider a proposal result valid.
  quorumBasisNumerator: 40000, // (basis points, will be divided by 1_000_000)
  // Linear Strategy | Percentage of total possible tokens which have voted that must vote YES in order to pass a proposal.
  votingBasisNumerator: 500000, // (basis points, will be divided by 1_000_000)
  // Linear Strategy | Number of total possible tokens that must be delegated to a user in order for them to create a proposal.
  proposalRequiredWeightTokens: 0, // (delegated voting token balance)
  // Lock Release | Beneficiaries of the lock release schedule
  /**
   * Beneficiaries {@link beneficiaries}
   */
  beneficiaries,
};
