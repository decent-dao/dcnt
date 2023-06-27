import { DecentDAOConfig } from "./types";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DCNTToken, LockRelease } from "../typechain";

export const retryCall = async (
  fn: () => Promise<any>,
  retriesLeft = 5,
  interval = 1000
): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      return retryCall(fn, retriesLeft - 1, interval);
    }
    throw new Error(error as string);
  }
};

export const deployDecentToken = async (
  deployer: SignerWithAddress,
  decentDAOConfig: DecentDAOConfig
): Promise<{
  totalLockedAmount: BigNumber;
  dcntTokenContract: DCNTToken;
  lockReleaseContract: LockRelease;
}> => {
  const DCNTTokenArtifact = await ethers.getContractFactory("DCNTToken");
  const LockReleaseArtifact = await ethers.getContractFactory("LockRelease");

  // First deploy DCNTToken and mint tokens to deployer address
  const initialSupply = ethers.utils.parseEther(decentDAOConfig.initialSupply); // Supply for Token Generation Event
  const token = await DCNTTokenArtifact.deploy(initialSupply, deployer.address);
  await token.deployed();
  console.log(`DCNTToken deployed to: ${token.address}`);

  const totalLockedAmount = decentDAOConfig.beneficiaries.reduce(
    (a, b) => a.add(b.lockedAmount),
    ethers.BigNumber.from(0)
  );

  // Deploy LockRelease contract with token address, beneficiaries, amounts, start, and duration
  const start = decentDAOConfig.lockStart;
  const duration = decentDAOConfig.lockDuration;

  const lockRelease = await LockReleaseArtifact.deploy(
    token.address,
    decentDAOConfig.beneficiaries.map((a) => a.address),
    decentDAOConfig.beneficiaries.map((a) => a.lockedAmount),
    start,
    duration
  );
  await lockRelease.deployed();
  console.log(`LockRelease contract deployed to: ${lockRelease.address}`);

  const tokenTransferTx = await token.transfer(
    lockRelease.address,
    totalLockedAmount
  );

  await tokenTransferTx.wait();

  console.log(`Transferred ${totalLockedAmount} DCNT to LockRelease contract`);
  console.table({
    "DCNTToken address": token.address,
    "LockRelease address": lockRelease.address,
    "Total locked amount": totalLockedAmount.toString(),
  });
  return {
    totalLockedAmount,
    dcntTokenContract: token,
    lockReleaseContract: lockRelease,
  };
};
