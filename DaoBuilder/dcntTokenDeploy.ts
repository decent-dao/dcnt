import { DecentDAOConfig } from "./types";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DCNTToken, LockRelease } from "../typechain";

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
  const dcntTokenFactory = await ethers.getContractFactory("DCNTToken");
  const dcntTokenContract = await dcntTokenFactory.deploy(
    ethers.utils.parseEther(decentDAOConfig.initialSupply),
    await deployer.getAddress()
  );
  await dcntTokenContract.deployed();
  console.log(`DCNTToken deployed to: ${dcntTokenContract.address}`);

  //
  // Deploy lock release factory
  // Sets up voting power prior to DCNT tokens being transferred
  const lockReleaseFactory = await ethers.getContractFactory("LockRelease");
  const start = decentDAOConfig.lockStart;
  const duration = decentDAOConfig.lockDuration;
  const lockReleaseContract = await lockReleaseFactory.deploy(
    dcntTokenContract.address,
    decentDAOConfig.beneficiaries.map((a) => a.address),
    decentDAOConfig.beneficiaries.map((a) => a.lockedAmount),
    start,
    duration
  );
  await lockReleaseContract.deployed();
  console.log(
    `LockRelease contract deployed to: ${lockReleaseContract.address}`
  );

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
  console.log(`Transferred ${totalLockedAmount} DCNT to LockRelease contract`);

  return {
    totalLockedAmount,
    dcntTokenContract,
    lockReleaseContract,
  };
};
