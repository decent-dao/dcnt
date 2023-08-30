import { DecentDAOConfig } from "./types";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DCNTToken, LockRelease, UnlimitedMint__factory } from "../typechain";

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
    await deployer.getAddress(),
    (
      await new UnlimitedMint__factory(deployer).deploy()
    ).address
  );
  await dcntTokenContract.deployed();

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
