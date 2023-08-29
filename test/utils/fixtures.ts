import {DCNTToken__factory, LockRelease__factory} from "../../typechain";
import {ethers, network, waffle} from "hardhat";
const { loadFixture } = waffle;
import time from "./time";

export const dcntFixture = async () => {
  const [deployer, owner] =
    await ethers.getSigners();

  const dcnt = await new DCNTToken__factory(deployer).deploy(1000, owner.address);
  return { dcnt }
}
export const lockReleaseFixture = async () => {
  const fixture = await loadFixture(dcntFixture)
  const dcnt = fixture.dcnt
  const [deployer, owner, beneficiary1, beneficiary2, beneficiary3, beneficiary4] =
    await ethers.getSigners();

  const beneficiaries = [beneficiary1.address, beneficiary2.address, beneficiary3.address, beneficiary4.address]
  const totals = [100, 200, 300, 400]
  // Token unlocks start in 100 seconds from current time, and vesting lasts for 100 seconds
  const unlockTime = (await time.latest()) + 100;
  const duration = 100;

  const lockRelease = await new LockRelease__factory(deployer).deploy(
    dcnt.address,
    beneficiaries,
    totals,
    unlockTime,
    duration
  );

  await dcnt.connect(deployer).transfer(lockRelease.address, totals.reduce((a, b) => a + b, 0));
  return {lockRelease}
}

export const releaseFixture = async () => {
  const [_deployer, _owner, beneficiary1, beneficiary2, beneficiary3, beneficiary4] =
    await ethers.getSigners();

  const fixture = await loadFixture(lockReleaseFixture)
  const lockRelease = fixture.lockRelease

  const increaseTimePercentage = 10;
  await time.increaseTo( (await time.latest()) + 100 + (100 / increaseTimePercentage));

  await network.provider.send("evm_setAutomine", [false]);
  await lockRelease.connect(beneficiary1).release();
  await lockRelease.connect(beneficiary2).release();
  await lockRelease.connect(beneficiary3).release();
  await lockRelease.connect(beneficiary4).release();
  await network.provider.send("evm_mine");
  await network.provider.send("evm_setAutomine", [true]);
}