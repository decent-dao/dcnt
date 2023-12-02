import { DecentDAOConfig } from "./types";
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

export const deployDCNTAndLockRelease = async (
  deployer: SignerWithAddress,
  decentDAOConfig: DecentDAOConfig
): Promise<{
  noMintContract: NoMint;
  totalLockedAmount: BigNumber;
  dcntTokenContract: DCNTToken;
  lockReleaseContract: LockRelease;
}> => {
  //
  // Deploy DCNT token
  // Tokens will be minted to deployer address
  const noMintContract = await new NoMint__factory(deployer).deploy();
  await noMintContract.deployed();
  const dcntTokenContract = await new DCNTToken__factory(deployer).deploy(
    ethers.utils.parseEther(decentDAOConfig.initialSupply),
    deployer.address,
    noMintContract.address,
    decentDAOConfig.tokenName,
    decentDAOConfig.tokenSymbol
  );
  await dcntTokenContract.deployed();

  //
  // Deploy lock release factory
  // Sets up voting power prior to DCNT tokens being transferred
  const start = decentDAOConfig.unlockStart;
  const duration = decentDAOConfig.unlockDuration;
  const lockReleaseContract = await new LockRelease__factory(deployer).deploy(
    dcntTokenContract.address,
    decentDAOConfig.beneficiaries.map((a) => a.address),
    decentDAOConfig.beneficiaries.map((a) => a.lockedAmount),
    start,
    duration
  );
  await lockReleaseContract.deployed();

  //
  // Transfer beneficiary total tokens to lock contract
  const totalLockedAmount = decentDAOConfig.beneficiaries.reduce(
    (a, b) => a.add(b.lockedAmount),
    ethers.BigNumber.from(0)
  );
  const tokenTransferTx = await dcntTokenContract.transfer(
    lockReleaseContract.address,
    totalLockedAmount
  );
  await tokenTransferTx.wait();

  return {
    totalLockedAmount,
    dcntTokenContract,
    lockReleaseContract,
    noMintContract,
  };
};
