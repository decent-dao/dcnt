import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  DCNTToken,
  DCNTToken__factory,
  LockRelease,
  LockRelease__factory,
} from "../typechain";

import time from "./time";

describe("LockRelease", async function () {
  let deployer: SignerWithAddress;
  let owner: SignerWithAddress;
  let beneficiary1: SignerWithAddress;
  let beneficiary2: SignerWithAddress;
  let beneficiary3: SignerWithAddress;
  let beneficiary4: SignerWithAddress;
  let dcnt: DCNTToken;
  let lockRelease: LockRelease;
  let startTime: number;
  let duration: number;

  beforeEach(async function () {
    [deployer, owner, beneficiary1, beneficiary2, beneficiary3, beneficiary4] =
      await ethers.getSigners();

    // Deploy contracts
    dcnt = await new DCNTToken__factory(deployer).deploy(1000, owner.address);

    // Token unlocks start in 100 seconds from current time, and vesting lasts for 100 seconds
    startTime = (await time.latest()) + 100;
    duration = 100;

    lockRelease = await new LockRelease__factory(deployer).deploy(
      dcnt.address,
      [
        beneficiary1.address,
        beneficiary2.address,
        beneficiary3.address,
        beneficiary4.address,
      ],
      [100, 200, 300, 400],
      startTime,
      duration
    );

    await dcnt.connect(deployer).transfer(lockRelease.address, 1000);

    await dcnt.connect(beneficiary1).delegate(beneficiary1.address);
    await dcnt.connect(beneficiary2).delegate(beneficiary2.address);
    await dcnt.connect(beneficiary3).delegate(beneficiary3.address);
    await dcnt.connect(beneficiary4).delegate(beneficiary4.address);
  });

  describe("LockRelease Features", function () {
    it("Is initialized correctly", async function () {
      expect(await dcnt.balanceOf(lockRelease.address)).to.eq(1000);
      expect(await dcnt.balanceOf(deployer.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary1.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary2.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary3.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary4.address)).to.eq(0);

      expect(await dcnt.delegates(beneficiary1.address)).to.eq(
        beneficiary1.address
      );
      expect(await dcnt.delegates(beneficiary2.address)).to.eq(
        beneficiary2.address
      );
      expect(await dcnt.delegates(beneficiary3.address)).to.eq(
        beneficiary3.address
      );
      expect(await dcnt.delegates(beneficiary4.address)).to.eq(
        beneficiary4.address
      );

      expect(await dcnt.getVotes(beneficiary1.address)).to.eq(0);
      expect(await dcnt.getVotes(beneficiary2.address)).to.eq(0);
      expect(await dcnt.getVotes(beneficiary3.address)).to.eq(0);
      expect(await dcnt.getVotes(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getBeneficiaries()).to.deep.eq([
        beneficiary1.address,
        beneficiary2.address,
        beneficiary3.address,
        beneficiary4.address,
      ]);
      expect(await lockRelease.getTotal(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getTotal(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getTotal(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getTotal(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getTotalMatured(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getTotalMatured(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getTotalMatured(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getTotalMatured(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getReleasable(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getReleasable(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getReleasable(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getReleasable(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getPending(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getPending(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getPending(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getPending(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.delegates(beneficiary1.address)).to.eq(
        beneficiary1.address
      );
      expect(await lockRelease.delegates(beneficiary2.address)).to.eq(
        beneficiary2.address
      );
      expect(await lockRelease.delegates(beneficiary3.address)).to.eq(
        beneficiary3.address
      );
      expect(await lockRelease.delegates(beneficiary4.address)).to.eq(
        beneficiary4.address
      );

      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getVotes(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getVotes(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getVotes(beneficiary4.address)).to.eq(400);
    });

    it("Handles unlocks correctly", async function () {
      // Increase time to 10% through vesting period
      await time.increaseTo(startTime + 10);

      expect(await dcnt.balanceOf(lockRelease.address)).to.eq(1000);
      expect(await dcnt.balanceOf(deployer.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary1.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary2.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary3.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getTotal(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getTotal(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getTotal(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getTotal(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getTotalMatured(beneficiary1.address)).to.eq(10);
      expect(await lockRelease.getTotalMatured(beneficiary2.address)).to.eq(20);
      expect(await lockRelease.getTotalMatured(beneficiary3.address)).to.eq(30);
      expect(await lockRelease.getTotalMatured(beneficiary4.address)).to.eq(40);

      expect(await lockRelease.getReleasable(beneficiary1.address)).to.eq(10);
      expect(await lockRelease.getReleasable(beneficiary2.address)).to.eq(20);
      expect(await lockRelease.getReleasable(beneficiary3.address)).to.eq(30);
      expect(await lockRelease.getReleasable(beneficiary4.address)).to.eq(40);

      expect(await lockRelease.getPending(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getPending(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getPending(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getPending(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getVotes(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getVotes(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getVotes(beneficiary4.address)).to.eq(400);

      // All four beneficiaries release
      await lockRelease.connect(beneficiary1).release();
      await lockRelease.connect(beneficiary2).release();
      await lockRelease.connect(beneficiary3).release();
      await lockRelease.connect(beneficiary4).release();

      const beneficiary1Released1 = BigNumber.from(100).mul(11).div(100);
      const beneficiary2Released1 = BigNumber.from(200).mul(12).div(100);
      const beneficiary3Released1 = BigNumber.from(300).mul(13).div(100);
      const beneficiary4Released1 = BigNumber.from(400).mul(14).div(100);

      expect(await dcnt.balanceOf(lockRelease.address)).to.eq(
        BigNumber.from(1000)
          .sub(beneficiary1Released1)
          .sub(beneficiary2Released1)
          .sub(beneficiary3Released1)
          .sub(beneficiary4Released1)
      );
      expect(await dcnt.balanceOf(beneficiary1.address)).to.eq(
        beneficiary1Released1
      );
      expect(await dcnt.balanceOf(beneficiary2.address)).to.eq(
        beneficiary2Released1
      );
      expect(await dcnt.balanceOf(beneficiary3.address)).to.eq(
        beneficiary3Released1
      );
      expect(await dcnt.balanceOf(beneficiary4.address)).to.eq(
        beneficiary4Released1
      );

      expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(
        beneficiary1Released1
      );
      expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(
        beneficiary2Released1
      );
      expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(
        beneficiary3Released1
      );
      expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(
        beneficiary4Released1
      );

      expect(await dcnt.getVotes(beneficiary1.address)).to.eq(
        beneficiary1Released1
      );
      expect(await dcnt.getVotes(beneficiary2.address)).to.eq(
        beneficiary2Released1
      );
      expect(await dcnt.getVotes(beneficiary3.address)).to.eq(
        beneficiary3Released1
      );
      expect(await dcnt.getVotes(beneficiary4.address)).to.eq(
        beneficiary4Released1
      );

      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getVotes(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getVotes(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getVotes(beneficiary4.address)).to.eq(400);

      // Increase time to halfway through vesting period
      await time.increaseTo(startTime + 50);

      // All four beneficiaries release
      await lockRelease.connect(beneficiary1).release();
      await lockRelease.connect(beneficiary2).release();
      await lockRelease.connect(beneficiary3).release();
      await lockRelease.connect(beneficiary4).release();

      const beneficiary1Released2 = BigNumber.from(100)
        .mul(51)
        .div(100)
        .sub(beneficiary1Released1);
      const beneficiary2Released2 = BigNumber.from(200)
        .mul(52)
        .div(100)
        .sub(beneficiary2Released1);
      const beneficiary3Released2 = BigNumber.from(300)
        .mul(53)
        .div(100)
        .sub(beneficiary3Released1);
      const beneficiary4Released2 = BigNumber.from(400)
        .mul(54)
        .div(100)
        .sub(beneficiary4Released1);

      expect(await dcnt.balanceOf(lockRelease.address)).to.eq(
        BigNumber.from(1000)
          .sub(beneficiary1Released1)
          .sub(beneficiary2Released1)
          .sub(beneficiary3Released1)
          .sub(beneficiary4Released1)
          .sub(beneficiary1Released2)
          .sub(beneficiary2Released2)
          .sub(beneficiary3Released2)
          .sub(beneficiary4Released2)
      );
      expect(await dcnt.balanceOf(deployer.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary1.address)).to.eq(
        beneficiary1Released1.add(beneficiary1Released2)
      );
      expect(await dcnt.balanceOf(beneficiary2.address)).to.eq(
        beneficiary2Released1.add(beneficiary2Released2)
      );
      expect(await dcnt.balanceOf(beneficiary3.address)).to.eq(
        beneficiary3Released1.add(beneficiary3Released2)
      );
      expect(await dcnt.balanceOf(beneficiary4.address)).to.eq(
        beneficiary4Released1.add(beneficiary4Released2)
      );

      expect(await lockRelease.getTotal(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getTotal(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getTotal(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getTotal(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(
        beneficiary1Released1.add(beneficiary1Released2)
      );
      expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(
        beneficiary2Released1.add(beneficiary2Released2)
      );
      expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(
        beneficiary3Released1.add(beneficiary3Released2)
      );
      expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(
        beneficiary4Released1.add(beneficiary4Released2)
      );

      const currentTime = await time.latest();

      const beneficiary1Matured = BigNumber.from(currentTime)
        .sub(startTime)
        .mul(100)
        .div(duration);
      const beneficiary2Matured = BigNumber.from(currentTime)
        .sub(startTime)
        .mul(200)
        .div(duration);
      const beneficiary3Matured = BigNumber.from(currentTime)
        .sub(startTime)
        .mul(300)
        .div(duration);
      const beneficiary4Matured = BigNumber.from(currentTime)
        .sub(startTime)
        .mul(400)
        .div(duration);

      expect(await lockRelease.getTotalMatured(beneficiary1.address)).to.eq(
        beneficiary1Matured
      );
      expect(await lockRelease.getTotalMatured(beneficiary2.address)).to.eq(
        beneficiary2Matured
      );
      expect(await lockRelease.getTotalMatured(beneficiary3.address)).to.eq(
        beneficiary3Matured
      );
      expect(await lockRelease.getTotalMatured(beneficiary4.address)).to.eq(
        beneficiary4Matured
      );

      expect(await lockRelease.getReleasable(beneficiary1.address)).to.eq(
        beneficiary1Matured
          .sub(beneficiary1Released1)
          .sub(beneficiary1Released2)
      );
      expect(await lockRelease.getReleasable(beneficiary2.address)).to.eq(
        beneficiary2Matured
          .sub(beneficiary2Released1)
          .sub(beneficiary2Released2)
      );
      expect(await lockRelease.getReleasable(beneficiary3.address)).to.eq(
        beneficiary3Matured
          .sub(beneficiary3Released1)
          .sub(beneficiary3Released2)
      );
      expect(await lockRelease.getReleasable(beneficiary4.address)).to.eq(
        beneficiary4Matured
          .sub(beneficiary4Released1)
          .sub(beneficiary4Released2)
      );

      expect(await lockRelease.getPending(beneficiary1.address)).to.eq(
        BigNumber.from(100)
          .sub(beneficiary1Released1)
          .sub(beneficiary1Released2)
      );
      expect(await lockRelease.getPending(beneficiary2.address)).to.eq(
        BigNumber.from(200)
          .sub(beneficiary2Released1)
          .sub(beneficiary2Released2)
      );
      expect(await lockRelease.getPending(beneficiary3.address)).to.eq(
        BigNumber.from(300)
          .sub(beneficiary3Released1)
          .sub(beneficiary3Released2)
      );
      expect(await lockRelease.getPending(beneficiary4.address)).to.eq(
        BigNumber.from(400)
          .sub(beneficiary4Released1)
          .sub(beneficiary4Released2)
      );

      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getVotes(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getVotes(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getVotes(beneficiary4.address)).to.eq(400);

      // Increase time to end of vesting period
      await time.increaseTo(startTime + duration);

      // All four beneficiaries release, should all be fully vested now
      await lockRelease.connect(beneficiary1).release();
      await lockRelease.connect(beneficiary2).release();
      await lockRelease.connect(beneficiary3).release();
      await lockRelease.connect(beneficiary4).release();

      expect(await dcnt.balanceOf(lockRelease.address)).to.eq(0);
      expect(await dcnt.balanceOf(beneficiary1.address)).to.eq(100);
      expect(await dcnt.balanceOf(beneficiary2.address)).to.eq(200);
      expect(await dcnt.balanceOf(beneficiary3.address)).to.eq(300);
      expect(await dcnt.balanceOf(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getTotal(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getTotal(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getTotal(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getTotal(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(400);

      expect(await lockRelease.getTotalMatured(beneficiary1.address)).to.eq(
        100
      );
      expect(await lockRelease.getTotalMatured(beneficiary2.address)).to.eq(
        200
      );
      expect(await lockRelease.getTotalMatured(beneficiary3.address)).to.eq(
        300
      );
      expect(await lockRelease.getTotalMatured(beneficiary4.address)).to.eq(
        400
      );

      expect(await lockRelease.getReleasable(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getReleasable(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getReleasable(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getReleasable(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getPending(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getPending(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getPending(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getPending(beneficiary4.address)).to.eq(0);

      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(100);
      expect(await lockRelease.getVotes(beneficiary2.address)).to.eq(200);
      expect(await lockRelease.getVotes(beneficiary3.address)).to.eq(300);
      expect(await lockRelease.getVotes(beneficiary4.address)).to.eq(400);
    });
  });
});
