import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { DCNTToken, LockRelease } from "../../typechain";
import { decentDAOConfig } from "./DCNTDAO.config";

export const deployDecentToken = async (
  deployer: SignerWithAddress
): Promise<{
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

  // Mocked amounts for beneficiaries
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

  // Make sure enough time has passed before minting new tokens
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
  console.log("1 minute has passed");

  await token
    .transfer(lockRelease.address, totalLockedAmount)
    .catch((e) => console.error(e));
  console.log(
    `Minted and transferred ${totalLockedAmount} tokens to LockRelease contract`
  );

  return {
    dcntTokenContract: token,
    lockReleaseContract: lockRelease,
  };
};
