import type { BigNumber } from "ethers";

export interface MetaTransaction {
  to: string;
  value: string | number | BigNumber;
  data: string;
  operation: number;
}

export interface SafeTransaction extends MetaTransaction {
  safeTxGas: string | number;
  baseGas: string | number;
  gasPrice: string | number;
  gasToken: string;
  refundReceiver: string;
  nonce: string | number;
}

export interface SafeSignature {
  signer: string;
  data: string;
}

export enum BeneficiaryType {
  Purchaser,
  Investor,
}

export interface Beneficiary {
  type: BeneficiaryType;
  address: string;
  lockedAmount: BigNumber;
}

export interface DecentDAOConfig {
  tokenName: string;
  tokenSymbol: string;
  name: string;
  unlockStart: number;
  unlockDuration: number;
  snapshotENS: string;
  initialSupply: string;
  votingPeriod: number;
  quorum: number;
  timeLockPeriod: number;
  executionPeriod: number;
  votingBasis: number;
  proposalRequiredWeight: number;
  beneficiaries: {
    type: BeneficiaryType;
    address: string;
    lockedAmount: BigNumber;
  }[];
}
