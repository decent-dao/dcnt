import { BeneficiaryType, DecentDAOConfig } from "./types";
import { ethers } from "hardhat";
import {
  DCNTToken,
  DCNTToken__factory,
  LockRelease,
  LockRelease__factory,
  NoMint,
  NoMint__factory,
} from "../typechain-types";
import { getUniqueBeneficiaries } from "./utils";
import { Signer } from "ethers";

export const deployDCNTAndLockRelease = async (
  deployer: Signer,
  decentDAOConfig: DecentDAOConfig
): Promise<{
  noMintContract: NoMint;
  totalAmountToLock: bigint;
  amountToLockForInvestors: bigint;
  amountToLockForPurchasers: bigint;
  dcntTokenContract: DCNTToken;
  dcntTokenConstructorArguments: [bigint, string, string, string, string];
  lockReleaseContract: LockRelease;
  lockReleaseConstructorArguments: [
    string,
    number,
    number,
    string[],
    bigint[],
  ];
}> => {
  //
  // Deploy an instance of the NoMint contract, will be used in DCNT
  const noMintContract = await new NoMint__factory(deployer).deploy();
  await noMintContract.waitForDeployment();
  console.log(`${await deployer.getAddress()} deployed NoMint to ${await noMintContract.getAddress()} at ${noMintContract.deploymentTransaction()?.hash}`);

  //
  // Deploy DCNT token
  // Tokens will be minted to deployer address
  const dcntTokenConstructorArguments: [
    bigint,
    string,
    string,
    string,
    string
  ] = [
      ethers.parseEther(decentDAOConfig.initialSupply),
      await deployer.getAddress(),
      await noMintContract.getAddress(),
      decentDAOConfig.tokenName,
      decentDAOConfig.tokenSymbol,
    ];
  const dcntTokenContract = await new DCNTToken__factory(deployer).deploy(
    ...dcntTokenConstructorArguments
  );
  await dcntTokenContract.waitForDeployment();
  console.log(`${await deployer.getAddress()} deployed DCNT to ${await dcntTokenContract.getAddress()} at ${dcntTokenContract.deploymentTransaction()?.hash}`);

  //
  // Make sure any duplicates in the beneficiares list
  // are combined into one schedule.
  // This is because one person might be both Investor and Purchaser,
  // but want all of their tokens at one address.
  const uniqueBeneficiaries = getUniqueBeneficiaries(
    decentDAOConfig.beneficiaries
  );

  //
  // Deploy a LockRelease instance using the deduped beneficiaries
  const lockReleaseConstructorArguments: [
    string,
    number,
    number,
    string[],
    bigint[],
  ] = [
      await dcntTokenContract.getAddress(),
      decentDAOConfig.unlockStartTimestamp,
      decentDAOConfig.unlockDurationSeconds,
      uniqueBeneficiaries.map((a) => a.address),
      uniqueBeneficiaries.map((a) => a.lockedAmount),
    ];
  const lockReleaseContract = await new LockRelease__factory(deployer).deploy(
    ...lockReleaseConstructorArguments
  );
  await lockReleaseContract.waitForDeployment();
  console.log(`${await deployer.getAddress()} deployed LockRelease to ${await lockReleaseContract.getAddress()} at ${lockReleaseContract.deploymentTransaction()?.hash}`);

  //
  // Compute beneficiary total tokens for lock contract
  const totalAmountToLock = uniqueBeneficiaries.reduce(
    (acc, cur) => acc + cur.lockedAmount,
    BigInt(0)
  );

  // Compute total number of tokens for Investors
  const amountToLockForInvestors = decentDAOConfig.beneficiaries.reduce(
    (acc, cur) => {
      if (cur.type !== BeneficiaryType.Investor) return acc;
      return acc + cur.lockedAmount;
    },
    BigInt(0)
  );

  // Compute total number of tokens for Purchasers
  const amountToLockForPurchasers = decentDAOConfig.beneficiaries.reduce(
    (acc, cur) => {
      if (cur.type !== BeneficiaryType.Purchaser) return acc;
      return acc + cur.lockedAmount;
    },
    BigInt(0)
  );

  return {
    totalAmountToLock,
    amountToLockForInvestors,
    amountToLockForPurchasers,
    dcntTokenContract,
    dcntTokenConstructorArguments,
    lockReleaseContract,
    noMintContract,
    lockReleaseConstructorArguments,
  };
};
