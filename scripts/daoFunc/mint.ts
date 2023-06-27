import { ethers } from "hardhat";
import { DCNTToken, LockRelease } from "../../typechain";

// @todo replace with real addresses and amounts
const beneficiaries = [
  {
    address: "0x629750317d320B8bB4d48D345A6d699Cc855c4a6",
    lockedAmount: ethers.utils.parseEther("1000"),
  },
  {
    address: "0x065FEDAaD9486C7647EBe78cD5be05A5DF29Fe76",
    lockedAmount: ethers.utils.parseEther("1000"),
  },
];
export const deployDecentToken = async (): Promise<{
  dcntTokenContract: DCNTToken;
  lockReleaseContract: LockRelease;
}> => {
  const [deployer] = await ethers.getSigners();
  const DCNTTokenArtifact = await ethers.getContractFactory("DCNTToken");
  const LockReleaseArtifact = await ethers.getContractFactory("LockRelease");

  // First deploy DCNTToken and mint tokens to deployer address
  const initialSupply = ethers.utils.parseEther("10000"); // Supply for Token Generation Event
  const token = await DCNTTokenArtifact.deploy(initialSupply, deployer.address);
  await token.deployed();
  console.log(`DCNTToken deployed to: ${token.address}`);

  // Mocked amounts for beneficiaries
  const totalLockedAmount = beneficiaries.reduce(
    (a, b) => a.add(b.lockedAmount),
    ethers.BigNumber.from(0)
  );

  // Deploy LockRelease contract with token address, beneficiaries, amounts, start, and duration
  const beneficiaryAddresses = beneficiaries.map((b) => b.address);
  const start = Math.floor(Date.now() / 1000);
  const duration = 60 * 60 * 24 * 365; // 1 year

  const lockRelease = await LockReleaseArtifact.deploy(
    token.address,
    beneficiaryAddresses,
    beneficiaries.map((a) => a.lockedAmount),
    start,
    duration
  );
  await lockRelease.deployed();
  console.log(`LockRelease contract deployed to: ${lockRelease.address}`);

  // Make sure enough time has passed before minting new tokens
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 * 60 * 60 * 24 * 365)
  ); // Wait for a year

  // Mint and fund the lock contract with the locked token amounts
  await token.mint(lockRelease.address, totalLockedAmount);
  console.log(
    `Minted and transferred ${totalLockedAmount} tokens to LockRelease contract`
  );

  return {
    dcntTokenContract: token,
    lockReleaseContract: lockRelease,
  };
};
