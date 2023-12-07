import { BeneficiaryType, DecentDAOConfig } from "./types";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  DCNTToken,
  DCNTToken__factory,
  LockRelease,
  LockRelease__factory,
  NoMint,
  NoMint__factory,
} from "../typechain";
import { getUniqueBeneficiaries } from "./utils";

export const deployDCNTAndLockRelease = async (
  deployer: SignerWithAddress,
  decentDAOConfig: DecentDAOConfig
): Promise<{
  noMintContract: NoMint;
  totalAmountToLock: BigNumber;
  amountToLockForInvestors: BigNumber;
  amountToLockForPurchasers: BigNumber;
  dcntTokenContract: DCNTToken;
  dcntTokenConstructorArguments: [BigNumber, string, string, string, string];
  lockReleaseContract: LockRelease;
  lockReleaseConstructorArguments: [
    string,
    string[],
    BigNumber[],
    number,
    number
  ];
}> => {
  //
  // Deploy an instance of the NoMint contract, will be used in DCNT
  const noMintContract = await new NoMint__factory(deployer).deploy();
  await noMintContract.deployed();
  console.log(
    `${deployer.address} deployed NoMint to ${noMintContract.address} at ${noMintContract.deployTransaction.hash}`
  );

  //
  // Deploy DCNT token
  // Tokens will be minted to deployer address
  const dcntTokenConstructorArguments: [
    BigNumber,
    string,
    string,
    string,
    string
  ] = [
    ethers.utils.parseEther(decentDAOConfig.initialSupply),
    deployer.address,
    noMintContract.address,
    decentDAOConfig.tokenName,
    decentDAOConfig.tokenSymbol,
  ];
  const dcntTokenContract = await new DCNTToken__factory(deployer).deploy(
    ...dcntTokenConstructorArguments
  );
  await dcntTokenContract.deployed();
  console.log(
    `${deployer.address} deployed DCNT to ${dcntTokenContract.address} at ${dcntTokenContract.deployTransaction.hash}`
  );

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
    string[],
    BigNumber[],
    number,
    number
  ] = [
    dcntTokenContract.address,
    uniqueBeneficiaries.map((a) => a.address),
    uniqueBeneficiaries.map((a) => a.lockedAmount),
    decentDAOConfig.unlockStartTimestamp,
    decentDAOConfig.unlockDurationSeconds,
  ];
  const lockReleaseContract = await new LockRelease__factory(deployer).deploy(
    ...lockReleaseConstructorArguments
  );
  await lockReleaseContract.deployed();
  console.log(
    `${deployer.address} deployed LockRelease to ${lockReleaseContract.address} at ${lockReleaseContract.deployTransaction.hash}`
  );

  //
  // Compute beneficiary total tokens for lock contract
  const totalAmountToLock = uniqueBeneficiaries.reduce(
    (acc, cur) => acc.add(cur.lockedAmount),
    ethers.BigNumber.from(0)
  );

  // Compute total number of tokens for Investors
  const amountToLockForInvestors = decentDAOConfig.beneficiaries.reduce(
    (acc, cur) => {
      if (cur.type !== BeneficiaryType.Investor) return acc;
      return acc.add(cur.lockedAmount);
    },
    ethers.BigNumber.from(0)
  );

  // Compute total number of tokens for Purchasers
  const amountToLockForPurchasers = decentDAOConfig.beneficiaries.reduce(
    (acc, cur) => {
      if (cur.type !== BeneficiaryType.Purchaser) return acc;
      return acc.add(cur.lockedAmount);
    },
    ethers.BigNumber.from(0)
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
