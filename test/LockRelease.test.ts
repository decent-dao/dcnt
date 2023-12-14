import { Signer, lock } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  DCNTToken,
  DCNTToken__factory,
  LockRelease,
  LockRelease__factory,
  UnlimitedMint__factory,
} from "../typechain-types";

describe("LockRelease", async function () {
  let deployer: Signer;
  let dcntOwner: Signer;
  let lockReleaseOwner: Signer;
  let beneficiary1: Signer;
  let beneficiary2: Signer;
  let beneficiary3: Signer;
  let beneficiary4: Signer;
  let beneficiary5: Signer;
  let beneficiary6: Signer;
  let dcnt: DCNTToken;
  let lockRelease: LockRelease;
  let startTime: number;
  let duration: number;

  beforeEach(async function () {
    [deployer, dcntOwner, lockReleaseOwner, beneficiary1, beneficiary2, beneficiary3, beneficiary4, beneficiary5, beneficiary6] =
      await ethers.getSigners();

    // Token unlocks start in 100 seconds from current time, and vesting lasts for 100 seconds
    startTime = (await time.latest()) + 100;
    duration = 100;

    // Deploy DCNT token
    dcnt = await new DCNTToken__factory(deployer).deploy(
      2000,
      await dcntOwner.getAddress(),
      await (await new UnlimitedMint__factory(deployer).deploy()).getAddress(),
      "Test Token",
      "TEST"
    );
  });

  describe("LockRelease Deployment", function () {
    let dummyContract: LockRelease;

    beforeEach(async function () {
      dummyContract = await new LockRelease__factory(deployer).deploy(
        await lockReleaseOwner.getAddress(),
        await dcnt.getAddress(),
        startTime,
        duration,
        [],
        []
      );
    });

    it("Cannot be deployed with token as address zero", async function () {
      const dummyContract = await new LockRelease__factory(deployer).deploy(
        await lockReleaseOwner.getAddress(),
        await dcnt.getAddress(),
        startTime,
        duration,
        [],
        []
      );
      await expect(
        new LockRelease__factory(deployer).deploy(
          await lockReleaseOwner.getAddress(),
          ethers.ZeroAddress,
          startTime,
          duration,
          [
            await beneficiary1.getAddress(),
            await beneficiary2.getAddress(),
            await beneficiary3.getAddress(),
            await beneficiary4.getAddress(),
          ],
          [100, 200, 300, 400],
        )
      ).to.be.revertedWithCustomError(dummyContract, "InvalidToken");
    });

    it("Cannot be deployed with a duration of zero", async function () {
      await expect(
        new LockRelease__factory(deployer).deploy(
          await lockReleaseOwner.getAddress(),
          await dcnt.getAddress(),
          startTime,
          0,
          [
            await beneficiary1.getAddress(),
            await beneficiary2.getAddress(),
            await beneficiary3.getAddress(),
            await beneficiary4.getAddress(),
          ],
          [100, 200, 300, 400],
        )
      ).to.be.revertedWithCustomError(dummyContract, "ZeroDuration");
    });

    it("Cannot be deployed with invalid array lengths", async function () {
      await expect(
        new LockRelease__factory(deployer).deploy(
          await lockReleaseOwner.getAddress(),
          await dcnt.getAddress(),
          startTime,
          duration,
          [
            await beneficiary1.getAddress(),
            await beneficiary2.getAddress(),
            await beneficiary3.getAddress(),
            await beneficiary4.getAddress(),
          ],
          [100, 200, 300],
        )
      ).to.be.revertedWithCustomError(dummyContract, "InvalidArrayLengths");
    });

    it("Cannot be deployed if one of the amounts is zero", async function () {
      await expect(
        new LockRelease__factory(deployer).deploy(
          await lockReleaseOwner.getAddress(),
          await dcnt.getAddress(),
          startTime,
          duration,
          [
            await beneficiary1.getAddress(),
            await beneficiary2.getAddress(),
            await beneficiary3.getAddress(),
            await beneficiary4.getAddress(),
          ],
          [100, 200, 300, 0],
        )
      ).to.be.revertedWithCustomError(dummyContract, "InvalidAmount");
    });

    it("Cannot be deployed if one of the beneficiaries is address zero", async function () {
      await expect(
        new LockRelease__factory(deployer).deploy(
          await lockReleaseOwner.getAddress(),
          await dcnt.getAddress(),
          startTime,
          duration,
          [
            ethers.ZeroAddress,
            await beneficiary2.getAddress(),
            await beneficiary3.getAddress(),
            await beneficiary4.getAddress(),
          ],
          [100, 200, 300, 400],
        )
      ).to.be.revertedWithCustomError(dummyContract, "InvalidBeneficiary");
    });

    it("Cannot be deployed with duplicate beneficiaries", async function () {
      await expect(
        new LockRelease__factory(deployer).deploy(
          await lockReleaseOwner.getAddress(),
          await dcnt.getAddress(),
          startTime,
          duration,
          [
            await beneficiary1.getAddress(),
            await beneficiary1.getAddress(),
            await beneficiary3.getAddress(),
            await beneficiary4.getAddress(),
          ],
          [100, 200, 300, 400],
        )
      ).to.be.revertedWithCustomError(dummyContract, "DuplicateBeneficiary");
    });
  });

  describe("LockRelease Functionality", function () {
    beforeEach(async function () {
      lockRelease = await new LockRelease__factory(deployer).deploy(
        await lockReleaseOwner.getAddress(),
        await dcnt.getAddress(),
        startTime,
        duration,
        [
          await beneficiary1.getAddress(),
          await beneficiary2.getAddress(),
          await beneficiary3.getAddress(),
          await beneficiary4.getAddress(),
        ],
        [100, 200, 300, 400],
      );

      await dcnt.connect(deployer).transfer(await lockRelease.getAddress(), 1000);

      await dcnt.connect(beneficiary1).delegate(await beneficiary1.getAddress());
      await dcnt.connect(beneficiary2).delegate(await beneficiary2.getAddress());
      await dcnt.connect(beneficiary3).delegate(await beneficiary3.getAddress());
      await dcnt.connect(beneficiary4).delegate(await beneficiary4.getAddress());
    });

    it("Is initialized correctly", async function () {
      expect(await dcnt.balanceOf(await lockRelease.getAddress())).to.eq(1000);
      expect(await dcnt.balanceOf(await deployer.getAddress())).to.eq(1000);
      expect(await dcnt.balanceOf(await beneficiary1.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary2.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary3.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary4.getAddress())).to.eq(0);

      expect(await dcnt.delegates(await beneficiary1.getAddress())).to.eq(
        await beneficiary1.getAddress()
      );
      expect(await dcnt.delegates(await beneficiary2.getAddress())).to.eq(
        await beneficiary2.getAddress()
      );
      expect(await dcnt.delegates(await beneficiary3.getAddress())).to.eq(
        await beneficiary3.getAddress()
      );
      expect(await dcnt.delegates(await beneficiary4.getAddress())).to.eq(
        await beneficiary4.getAddress()
      );

      expect(await dcnt.getVotes(await beneficiary1.getAddress())).to.eq(0);
      expect(await dcnt.getVotes(await beneficiary2.getAddress())).to.eq(0);
      expect(await dcnt.getVotes(await beneficiary3.getAddress())).to.eq(0);
      expect(await dcnt.getVotes(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.getTotal(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getTotal(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getTotal(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getTotal(await beneficiary4.getAddress())).to.eq(400);

      expect(await lockRelease.getReleased(await beneficiary1.getAddress())).to.eq(0);
      expect(await lockRelease.getReleased(await beneficiary2.getAddress())).to.eq(0);
      expect(await lockRelease.getReleased(await beneficiary3.getAddress())).to.eq(0);
      expect(await lockRelease.getReleased(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.getTotalMatured(await beneficiary1.getAddress())).to.eq(0);
      expect(await lockRelease.getTotalMatured(await beneficiary2.getAddress())).to.eq(0);
      expect(await lockRelease.getTotalMatured(await beneficiary3.getAddress())).to.eq(0);
      expect(await lockRelease.getTotalMatured(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.getReleasable(await beneficiary1.getAddress())).to.eq(0);
      expect(await lockRelease.getReleasable(await beneficiary2.getAddress())).to.eq(0);
      expect(await lockRelease.getReleasable(await beneficiary3.getAddress())).to.eq(0);
      expect(await lockRelease.getReleasable(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.delegates(await beneficiary1.getAddress())).to.eq(
        await beneficiary1.getAddress()
      );
      expect(await lockRelease.delegates(await beneficiary2.getAddress())).to.eq(
        await beneficiary2.getAddress()
      );
      expect(await lockRelease.delegates(await beneficiary3.getAddress())).to.eq(
        await beneficiary3.getAddress()
      );
      expect(await lockRelease.delegates(await beneficiary4.getAddress())).to.eq(
        await beneficiary4.getAddress()
      );

      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getVotes(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getVotes(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getVotes(await beneficiary4.getAddress())).to.eq(400);
    });

    it("Handles unlocks correctly", async function () {
      // Increase time to 10% through vesting period
      await time.increaseTo(startTime + 10);

      expect(await dcnt.balanceOf(await lockRelease.getAddress())).to.eq(1000);
      expect(await dcnt.balanceOf(await deployer.getAddress())).to.eq(1000);
      expect(await dcnt.balanceOf(await beneficiary1.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary2.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary3.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.getTotal(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getTotal(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getTotal(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getTotal(await beneficiary4.getAddress())).to.eq(400);

      expect(await lockRelease.getReleased(await beneficiary1.getAddress())).to.eq(0);
      expect(await lockRelease.getReleased(await beneficiary2.getAddress())).to.eq(0);
      expect(await lockRelease.getReleased(await beneficiary3.getAddress())).to.eq(0);
      expect(await lockRelease.getReleased(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.getTotalMatured(await beneficiary1.getAddress())).to.eq(10);
      expect(await lockRelease.getTotalMatured(await beneficiary2.getAddress())).to.eq(20);
      expect(await lockRelease.getTotalMatured(await beneficiary3.getAddress())).to.eq(30);
      expect(await lockRelease.getTotalMatured(await beneficiary4.getAddress())).to.eq(40);

      expect(await lockRelease.getReleasable(await beneficiary1.getAddress())).to.eq(10);
      expect(await lockRelease.getReleasable(await beneficiary2.getAddress())).to.eq(20);
      expect(await lockRelease.getReleasable(await beneficiary3.getAddress())).to.eq(30);
      expect(await lockRelease.getReleasable(await beneficiary4.getAddress())).to.eq(40);

      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getVotes(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getVotes(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getVotes(await beneficiary4.getAddress())).to.eq(400);

      // All four beneficiaries release
      await lockRelease.connect(beneficiary1).release();
      await lockRelease.connect(beneficiary2).release();
      await lockRelease.connect(beneficiary3).release();
      await lockRelease.connect(beneficiary4).release();

      const beneficiary1Released1 = BigInt(100) * BigInt(11) / BigInt(100);
      const beneficiary2Released1 = BigInt(200) * BigInt(12) / BigInt(100);
      const beneficiary3Released1 = BigInt(300) * BigInt(13) / BigInt(100);
      const beneficiary4Released1 = BigInt(400) * BigInt(14) / BigInt(100);

      expect(await dcnt.balanceOf(await lockRelease.getAddress())).to.eq(
        BigInt(1000)
          - beneficiary1Released1
          - beneficiary2Released1
          - beneficiary3Released1
          - beneficiary4Released1
      );
      expect(await dcnt.balanceOf(await beneficiary1.getAddress())).to.eq(
        beneficiary1Released1
      );
      expect(await dcnt.balanceOf(await beneficiary2.getAddress())).to.eq(
        beneficiary2Released1
      );
      expect(await dcnt.balanceOf(await beneficiary3.getAddress())).to.eq(
        beneficiary3Released1
      );
      expect(await dcnt.balanceOf(await beneficiary4.getAddress())).to.eq(
        beneficiary4Released1
      );

      expect(await lockRelease.getReleased(await beneficiary1.getAddress())).to.eq(
        beneficiary1Released1
      );
      expect(await lockRelease.getReleased(await beneficiary2.getAddress())).to.eq(
        beneficiary2Released1
      );
      expect(await lockRelease.getReleased(await beneficiary3.getAddress())).to.eq(
        beneficiary3Released1
      );
      expect(await lockRelease.getReleased(await beneficiary4.getAddress())).to.eq(
        beneficiary4Released1
      );

      expect(await dcnt.getVotes(await beneficiary1.getAddress())).to.eq(
        beneficiary1Released1
      );
      expect(await dcnt.getVotes(await beneficiary2.getAddress())).to.eq(
        beneficiary2Released1
      );
      expect(await dcnt.getVotes(await beneficiary3.getAddress())).to.eq(
        beneficiary3Released1
      );
      expect(await dcnt.getVotes(await beneficiary4.getAddress())).to.eq(
        beneficiary4Released1
      );

      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getVotes(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getVotes(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getVotes(await beneficiary4.getAddress())).to.eq(400);

      // Increase time to halfway through vesting period
      await time.increaseTo(startTime + 50);

      // All four beneficiaries release
      await lockRelease.connect(beneficiary1).release();
      await lockRelease.connect(beneficiary2).release();
      await lockRelease.connect(beneficiary3).release();
      await lockRelease.connect(beneficiary4).release();

      const beneficiary1Released2 = BigInt(100) * BigInt(51) / BigInt(100) - beneficiary1Released1;
      const beneficiary2Released2 = BigInt(200) * BigInt(52) / BigInt(100) - beneficiary2Released1;
      const beneficiary3Released2 = BigInt(300) * BigInt(53) / BigInt(100) - beneficiary3Released1;
      const beneficiary4Released2 = BigInt(400) * BigInt(54) / BigInt(100) - beneficiary4Released1;

      expect(await dcnt.balanceOf(await lockRelease.getAddress())).to.eq(
        BigInt(1000)
          - beneficiary1Released1
          - beneficiary2Released1
          - beneficiary3Released1
          - beneficiary4Released1
          - beneficiary1Released2
          - beneficiary2Released2
          - beneficiary3Released2
          - beneficiary4Released2
      );
      expect(await dcnt.balanceOf(await deployer.getAddress())).to.eq(1000);
      expect(await dcnt.balanceOf(await beneficiary1.getAddress())).to.eq(
        beneficiary1Released1 + beneficiary1Released2
      );
      expect(await dcnt.balanceOf(await beneficiary2.getAddress())).to.eq(
        beneficiary2Released1 + beneficiary2Released2
      );
      expect(await dcnt.balanceOf(await beneficiary3.getAddress())).to.eq(
        beneficiary3Released1 + beneficiary3Released2
      );
      expect(await dcnt.balanceOf(await beneficiary4.getAddress())).to.eq(
        beneficiary4Released1 + beneficiary4Released2
      );

      expect(await lockRelease.getTotal(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getTotal(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getTotal(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getTotal(await beneficiary4.getAddress())).to.eq(400);

      expect(await lockRelease.getReleased(await beneficiary1.getAddress())).to.eq(
        beneficiary1Released1 + beneficiary1Released2
      );
      expect(await lockRelease.getReleased(await beneficiary2.getAddress())).to.eq(
        beneficiary2Released1 + beneficiary2Released2
      );
      expect(await lockRelease.getReleased(await beneficiary3.getAddress())).to.eq(
        beneficiary3Released1 + beneficiary3Released2
      );
      expect(await lockRelease.getReleased(await beneficiary4.getAddress())).to.eq(
        beneficiary4Released1 + beneficiary4Released2
      );

      const currentTime = await time.latest();

      const beneficiary1Matured = (BigInt(currentTime) - BigInt(startTime)) * BigInt(100) / BigInt(duration);
      const beneficiary2Matured = (BigInt(currentTime) - BigInt(startTime)) * BigInt(200) / BigInt(duration);
      const beneficiary3Matured = (BigInt(currentTime) - BigInt(startTime)) * BigInt(300) / BigInt(duration);
      const beneficiary4Matured = (BigInt(currentTime) - BigInt(startTime)) * BigInt(400) / BigInt(duration);

      expect(await lockRelease.getTotalMatured(await beneficiary1.getAddress())).to.eq(
        beneficiary1Matured
      );
      expect(await lockRelease.getTotalMatured(await beneficiary2.getAddress())).to.eq(
        beneficiary2Matured
      );
      expect(await lockRelease.getTotalMatured(await beneficiary3.getAddress())).to.eq(
        beneficiary3Matured
      );
      expect(await lockRelease.getTotalMatured(await beneficiary4.getAddress())).to.eq(
        beneficiary4Matured
      );

      expect(await lockRelease.getReleasable(await beneficiary1.getAddress())).to.eq(
        beneficiary1Matured - beneficiary1Released1 - beneficiary1Released2
      );
      expect(await lockRelease.getReleasable(await beneficiary2.getAddress())).to.eq(
        beneficiary2Matured - beneficiary2Released1 - beneficiary2Released2
      );
      expect(await lockRelease.getReleasable(await beneficiary3.getAddress())).to.eq(
        beneficiary3Matured - beneficiary3Released1 - beneficiary3Released2
      );
      expect(await lockRelease.getReleasable(await beneficiary4.getAddress())).to.eq(
        beneficiary4Matured - beneficiary4Released1 - beneficiary4Released2
      );

      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getVotes(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getVotes(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getVotes(await beneficiary4.getAddress())).to.eq(400);

      // Increase time to end of vesting period
      await time.increaseTo(startTime + duration);

      // All four beneficiaries release, should all be fully vested now
      await lockRelease.connect(beneficiary1).release();
      await lockRelease.connect(beneficiary2).release();
      await lockRelease.connect(beneficiary3).release();
      await lockRelease.connect(beneficiary4).release();

      expect(await dcnt.balanceOf(await lockRelease.getAddress())).to.eq(0);
      expect(await dcnt.balanceOf(await beneficiary1.getAddress())).to.eq(100);
      expect(await dcnt.balanceOf(await beneficiary2.getAddress())).to.eq(200);
      expect(await dcnt.balanceOf(await beneficiary3.getAddress())).to.eq(300);
      expect(await dcnt.balanceOf(await beneficiary4.getAddress())).to.eq(400);

      expect(await lockRelease.getTotal(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getTotal(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getTotal(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getTotal(await beneficiary4.getAddress())).to.eq(400);

      expect(await lockRelease.getReleased(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getReleased(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getReleased(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getReleased(await beneficiary4.getAddress())).to.eq(400);

      expect(await lockRelease.getTotalMatured(await beneficiary1.getAddress())).to.eq(
        100
      );
      expect(await lockRelease.getTotalMatured(await beneficiary2.getAddress())).to.eq(
        200
      );
      expect(await lockRelease.getTotalMatured(await beneficiary3.getAddress())).to.eq(
        300
      );
      expect(await lockRelease.getTotalMatured(await beneficiary4.getAddress())).to.eq(
        400
      );

      expect(await lockRelease.getReleasable(await beneficiary1.getAddress())).to.eq(0);
      expect(await lockRelease.getReleasable(await beneficiary2.getAddress())).to.eq(0);
      expect(await lockRelease.getReleasable(await beneficiary3.getAddress())).to.eq(0);
      expect(await lockRelease.getReleasable(await beneficiary4.getAddress())).to.eq(0);

      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(100);
      expect(await lockRelease.getVotes(await beneficiary2.getAddress())).to.eq(200);
      expect(await lockRelease.getVotes(await beneficiary3.getAddress())).to.eq(300);
      expect(await lockRelease.getVotes(await beneficiary4.getAddress())).to.eq(400);
    });

    it("LockRelease correctly tracks user's past votes", async function () {
      // Increase time to 10% through vesting period
      await time.increaseTo(startTime + 10);

      const blockOneNumber = await time.latestBlock();
      const blockOneVotes = 100;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockOneVotes
      );

      await time.increaseTo(startTime + 49);
      await lockRelease.connect(beneficiary1).release();
      // Should have 50 votes directly on token, and 50 on LockRelease

      // beneficiary 1 delegates their lockRelease votes to beneficiary 2
      await lockRelease.connect(beneficiary1).delegate(await beneficiary2.getAddress());
      const blockTwoNumber = await time.latestBlock();
      const blockTwoVotes = 50;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockTwoVotes
      );

      // beneficiary 1 delegates their dcnt votes to beneficiary 2
      await dcnt.connect(beneficiary1).delegate(await beneficiary2.getAddress());
      const blockThreeNumber = await time.latestBlock();
      const blockThreeVotes = 0;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockThreeVotes
      );

      await time.increase(1);

      // Check votes at past blocks are correct
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockOneNumber)
      ).to.eq(blockOneVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockTwoNumber)
      ).to.eq(blockTwoVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockThreeNumber)
      ).to.eq(blockThreeVotes);

      // benefeciary 1 re-delegates back to themselves
      await lockRelease.connect(beneficiary1).delegate(await beneficiary1.getAddress());
      await dcnt.connect(beneficiary1).delegate(await beneficiary1.getAddress());
      const blockFourNumber = await time.latestBlock();
      const blockFourVotes = 100;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockFourVotes
      );

      // advance time to after end of vesting period
      await time.increaseTo(startTime + duration + 10);

      // beneficiary 1 releases the remaining of their locked tokens
      await lockRelease.connect(beneficiary1).release();

      const blockFiveNumber = await time.latestBlock();
      const blockFiveVotes = 100;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockFiveVotes
      );

      await dcnt.connect(beneficiary1).transfer(await beneficiary2.getAddress(), 30);
      const blockSixNumber = await time.latestBlock();
      const blockSixVotes = 70;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockSixVotes
      );

      await dcnt.connect(beneficiary1).transfer(await beneficiary2.getAddress(), 60);
      const blockSevenNumber = await time.latestBlock();
      const blockSevenVotes = 10;
      expect(await lockRelease.getVotes(await beneficiary1.getAddress())).to.eq(
        blockSevenVotes
      );

      await time.increase(1);

      // Check votes at past blocks are correct
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockOneNumber)
      ).to.eq(blockOneVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockTwoNumber)
      ).to.eq(blockTwoVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockThreeNumber)
      ).to.eq(blockThreeVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockFourNumber)
      ).to.eq(blockFourVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockFiveNumber)
      ).to.eq(blockFiveVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockSixNumber)
      ).to.eq(blockSixVotes);
      expect(
        await lockRelease.getPastVotes(await beneficiary1.getAddress(), blockSevenNumber)
      ).to.eq(blockSevenVotes);
    });

    it("Reverts when getPastVotes is called on the current or a future block", async function () {
      await expect(
        lockRelease.getPastVotes(
          await beneficiary1.getAddress(),
          await time.latestBlock()
        )
      ).to.be.revertedWithCustomError(lockRelease, "ERC5805FutureLookup");

      await expect(
        lockRelease.getPastVotes(
          await beneficiary1.getAddress(),
          await time.latestBlock() + 1
        )
      ).to.be.revertedWithCustomError(lockRelease, "ERC5805FutureLookup");
    });

    it("Reverts when release is called and releasable amount is zero", async function () {
      // vesting hasn't started, so releasable amount is zero
      expect(await lockRelease.getReleasable(await beneficiary1.getAddress())).to.eq(0);
      await expect(
        lockRelease.connect(beneficiary1).release()
      ).to.be.revertedWithCustomError(lockRelease, "NothingToRelease");

      // deployer isn't a beneficiary, so shouldn't have any releasable funds
      expect(await lockRelease.getReleasable(await deployer.getAddress())).to.eq(0);
      await expect(lockRelease.connect(deployer).release()).to.be.revertedWithCustomError(lockRelease, "NothingToRelease");

      // Increase time to after vesting period
      await time.increaseTo(startTime + duration + 10);

      // deployer isn't a beneficiary, so shouldn't have any releasable funds
      expect(await lockRelease.getReleasable(await deployer.getAddress())).to.eq(0);
      await expect(lockRelease.connect(deployer).release()).to.be.revertedWithCustomError(lockRelease, "NothingToRelease");
    });

    describe("Adding more schedules after deployment", function () {
      describe("From an unauthorized account", function () {
        it("Doesn't allow more schedules to be added", async function () {
          await expect(lockRelease.addSchedules([await beneficiary5.getAddress()], [100]))
            .to.be.revertedWithCustomError(lockRelease, "OwnableUnauthorizedAccount");
        });
      });

      describe("From an authorized account", function () {
        beforeEach(async function () {
          lockRelease = lockRelease.connect(lockReleaseOwner);
          await dcnt.transfer(await lockReleaseOwner.getAddress(), 1000);
          dcnt = dcnt.connect(lockReleaseOwner);
        });

        it("Fails if there are duplicate beneficiaries", async function () {
          await expect(lockRelease.addSchedules([await beneficiary1.getAddress()], [100]))
            .to.be.revertedWithCustomError(lockRelease, "DuplicateBeneficiary");
        });
  
        it("Fails when msg.sender hasn't allowed token approvals", async function () {
          await expect(lockRelease.addSchedules([await beneficiary5.getAddress()], [100]))
            .to.be.revertedWithCustomError(dcnt, "ERC20InsufficientAllowance");
        });
  
        describe("When allowance has been set", async function () {
          const first = 600, second = 400;
  
          beforeEach(async function () {
            await dcnt.approve(await lockRelease.getAddress(), first + second);
            await lockRelease.addSchedules([await beneficiary5.getAddress(), await beneficiary6.getAddress()], [first, second]);
          });
  
          it("Allows more schedules to be added", async function () {
            expect(await lockRelease.getTotal(await beneficiary5.getAddress())).to.equal(first);
            expect(await lockRelease.getTotal(await beneficiary6.getAddress())).to.equal(second);
          });

          it("Allows those new schedules to be properly released when time allows", async function () {
            await time.increaseTo(startTime + 10); // 10% thru release
            await lockRelease.connect(beneficiary5).release();
            expect(await dcnt.balanceOf(beneficiary5)).to.be.greaterThan(60);
          })
        });
  
        describe("When release schedule is in effect", function () {
          const amount = 100;
  
          beforeEach(async function () {
            await dcnt.approve(await lockRelease.getAddress(), amount);
            await time.increaseTo(startTime + 10); // 10% thru release
            await lockRelease.addSchedules([await beneficiary5.getAddress()], [amount]);
          });
  
          it("Allows new beneficiary to immediately claim their released tokens", async function () {
            await lockRelease.connect(beneficiary5).release();
            expect(await dcnt.balanceOf(beneficiary5)).to.be.greaterThan(10);
          });
        });
  
        describe("When release schedule is over", function () {
          const amount = 100;
  
          beforeEach(async function () {
            await dcnt.approve(await lockRelease.getAddress(), amount);
            await time.increaseTo(startTime + duration); // 100% thru release
            await lockRelease.addSchedules([await beneficiary5.getAddress()], [amount]);
          });
  
          it("Allows new beneficiary to immediately claim their released tokens", async function () {
            await lockRelease.connect(beneficiary5).release();
            expect(await dcnt.balanceOf(beneficiary5)).to.be.equal(100);
          });
        });
      });
    });
  });
});
