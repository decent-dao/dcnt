import { DecentDAOConfig } from "./types";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  DCNTToken,
  DCNTToken__factory,
  LockRelease,
  LockRelease__factory,
  NoMint__factory,
} from "../typechain";

export const deployDCNTAndLockRelease = async (
  deployer: SignerWithAddress,
  decentDAOConfig: DecentDAOConfig
): Promise<{
  totalLockedAmount: BigNumber;
  dcntTokenContract: DCNTToken;
  lockReleaseContract: LockRelease;
}> => {
  //
  // Deploy DCNT token
  // Tokens will be minted to deployer address
  const noMintInstance = await new NoMint__factory(deployer).deploy();
  await noMintInstance.deployed();
  const dcntTokenContract = await new DCNTToken__factory(deployer).deploy(
    ethers.utils.parseEther(decentDAOConfig.initialSupply),
    deployer.address,
    noMintInstance.address
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

  console.log("Decent Token and Lock Release contracts deployed:");
  console.table({
    dcntTokenContract: dcntTokenContract.address,
    lockReleaseContract: lockReleaseContract.address,
    totalLockedAmount: totalLockedAmount.toString(),
  });

  return {
    totalLockedAmount,
    dcntTokenContract,
    lockReleaseContract,
  };
};
