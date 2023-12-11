export interface MetaTransaction {
  to: string;
  value: string | number | bigint;
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
  lockedAmount: bigint;
}

export interface DecentDAOConfig {
  tokenName: string;
  tokenSymbol: string;
  name: string;
  unlockStartTimestamp: number;
  unlockDurationSeconds: number;
  snapshotENS: string;
  initialSupply: string;
  votingPeriodBlocks: number;
  quorumBasisNumerator: number;
  timeLockPeriodBlocks: number;
  executionPeriodBlocks: number;
  votingBasisNumerator: number;
  proposalRequiredWeightTokens: number;
  beneficiaries: {
    type: BeneficiaryType;
    address: string;
    lockedAmount: bigint;
  }[];
}
