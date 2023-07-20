import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  DCNTToken,
  DCNTToken__factory,
  LockRelease,
  LockRelease__factory
} from "../typechain";

import time from "./utils/time";

describe("LockRelease", async function() {
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
  const [b1Total, b2Total, b3Total, b4Total] = [100, 200, 300, 400];

  beforeEach(async function() {
    [deployer, owner, beneficiary1, beneficiary2, beneficiary3, beneficiary4] =
      await ethers.getSigners();

    // Token unlocks start in 100 seconds from current time, and vesting lasts for 100 seconds
    startTime = (await time.latest()) + 100;
    duration = 100;

    // Deploy DCNT token
    dcnt = await new DCNTToken__factory(deployer).deploy(1000, owner.address);
  });

  describe("LockRelease Deployment", function() {
    it("Cannot be deployed with token as address zero", async function() {
      await expect(
        new LockRelease__factory(deployer).deploy(
          ethers.constants.AddressZero,
          [
            beneficiary1.address,
            beneficiary2.address,
            beneficiary3.address,
            beneficiary4.address
          ],
          [b1Total, b2Total, b3Total, b4Total],
          startTime,
          duration
        )
      ).to.be.revertedWith("InvalidToken()");
    });

    it("Cannot be deployed with a duration of zero", async function() {
      await expect(
        new LockRelease__factory(deployer).deploy(
          dcnt.address,
          [
            beneficiary1.address,
            beneficiary2.address,
            beneficiary3.address,
            beneficiary4.address
          ],
          [b1Total, b2Total, b3Total, b4Total],
          startTime,
          0
        )
      ).to.be.revertedWith("ZeroDuration()");
    });

    it("Cannot be deployed with invalid array lengths", async function() {
      await expect(
        new LockRelease__factory(deployer).deploy(
          dcnt.address,
          [
            beneficiary1.address
          ],
          [b1Total, b2Total],
          startTime,
          duration
        )
      ).to.be.revertedWith("InvalidArrayLengths()");

      await expect(
        new LockRelease__factory(deployer).deploy(
          dcnt.address,
          [
            beneficiary1.address,
            beneficiary2.address
          ],
          [b1Total],
          startTime,
          duration
        )
      ).to.be.revertedWith("InvalidArrayLengths()");
    });

    it("Cannot be deployed if one of the amounts is zero", async function() {
      await expect(
        new LockRelease__factory(deployer).deploy(
          dcnt.address,
          [
            beneficiary1.address,
            beneficiary2.address,
            beneficiary3.address,
            beneficiary4.address
          ],
          [b1Total, b2Total, b3Total, 0],
          startTime,
          duration
        )
      ).to.be.revertedWith("InvalidAmount()");
    });

    it("Cannot be deployed if one of the beneficiaries is address zero", async function() {
      await expect(
        new LockRelease__factory(deployer).deploy(
          dcnt.address,
          [
            ethers.constants.AddressZero,
            beneficiary2.address,
            beneficiary3.address,
            beneficiary4.address
          ],
          [b1Total, b2Total, b3Total, b4Total],
          startTime,
          duration
        )
      ).to.be.revertedWith("InvalidBeneficiary()");
    });

    it("Cannot be deployed with duplicate beneficiaries", async function() {
      await expect(
        new LockRelease__factory(deployer).deploy(
          dcnt.address,
          [
            beneficiary1.address,
            beneficiary1.address,
            beneficiary3.address,
            beneficiary4.address
          ],
          [b1Total, b2Total, b3Total, b4Total],
          startTime,
          duration
        )
      ).to.be.revertedWith("DuplicateBeneficiary()");
    });
  });

  context("deploying with 4 beneficiaries, at time of deployment", function() {
    beforeEach(async function() {
      lockRelease = await new LockRelease__factory(deployer).deploy(
        dcnt.address,
        [
          beneficiary1.address,
          beneficiary2.address,
          beneficiary3.address,
          beneficiary4.address
        ],
        [b1Total, b2Total, b3Total, b4Total],
        startTime,
        duration
      );

      await dcnt.connect(deployer).transfer(lockRelease.address, 1000);

      // await dcnt.connect(beneficiary1).delegate(beneficiary1.address);
      // await dcnt.connect(beneficiary2).delegate(beneficiary2.address);
      // await dcnt.connect(beneficiary3).delegate(beneficiary3.address);
      // await dcnt.connect(beneficiary4).delegate(beneficiary4.address);
    });

    it("initializes beneficiaries array correctly", async function() {
      expect(await lockRelease.getBeneficiaries()).to.deep.eq([
        beneficiary1.address,
        beneficiary2.address,
        beneficiary3.address,
        beneficiary4.address
      ]);
    });

    it("initializes beneficiary schedules correctly", async function() {
      expect(await lockRelease.getTotal(beneficiary1.address)).to.eq(b1Total);
      expect(await lockRelease.getTotal(beneficiary2.address)).to.eq(b2Total);
      expect(await lockRelease.getTotal(beneficiary3.address)).to.eq(b3Total);
      expect(await lockRelease.getTotal(beneficiary4.address)).to.eq(b4Total);

      expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(0);
      expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(0);
    });

    it("initializes delegates addresses correctly", async function() {
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
    });

    it("initializes delegates voting power correctly", async function() {
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(b1Total);
      expect(await lockRelease.getVotes(beneficiary2.address)).to.eq(b2Total);
      expect(await lockRelease.getVotes(beneficiary3.address)).to.eq(b3Total);
      expect(await lockRelease.getVotes(beneficiary4.address)).to.eq(b4Total);
    });
    // expect(await dcnt.delegates(beneficiary1.address)).to.eq(
    //   beneficiary1.address
    // );
    // expect(await dcnt.delegates(beneficiary2.address)).to.eq(
    //   beneficiary2.address
    // );
    // expect(await dcnt.delegates(beneficiary3.address)).to.eq(
    //   beneficiary3.address
    // );
    // expect(await dcnt.delegates(beneficiary4.address)).to.eq(
    //   beneficiary4.address
    // );
    //
    // expect(await dcnt.getVotes(beneficiary1.address)).to.eq(0);
    // expect(await dcnt.getVotes(beneficiary2.address)).to.eq(0);
    // expect(await dcnt.getVotes(beneficiary3.address)).to.eq(0);
    // expect(await dcnt.getVotes(beneficiary4.address)).to.eq(0);
    // expect(await lockRelease.getTotalMatured(beneficiary1.address)).to.eq(0);
    // expect(await lockRelease.getTotalMatured(beneficiary2.address)).to.eq(0);
    // expect(await lockRelease.getTotalMatured(beneficiary3.address)).to.eq(0);
    // expect(await lockRelease.getTotalMatured(beneficiary4.address)).to.eq(0);
    //
    // expect(await lockRelease.getReleasable(beneficiary1.address)).to.eq(0);
    // expect(await lockRelease.getReleasable(beneficiary2.address)).to.eq(0);
    // expect(await lockRelease.getReleasable(beneficiary3.address)).to.eq(0);
    // expect(await lockRelease.getReleasable(beneficiary4.address)).to.eq(0);

    context("at start of unlock time", async function() {
      beforeEach(async function() {
        await time.increaseTo(startTime);
      });

      it("has not released any tokens yet", async function() {
        expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(0);
        expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(0);
        expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(0);
        expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(0);
      });
    });

    context("at 10% through vesting period", async function() {
      beforeEach(async function() {
        await time.increaseTo(startTime + 10);
      });

      it("has not released any tokens", async function() {
        expect(await lockRelease.getReleased(beneficiary1.address)).to.eq(0);
        expect(await lockRelease.getReleased(beneficiary2.address)).to.eq(0);
        expect(await lockRelease.getReleased(beneficiary3.address)).to.eq(0);
        expect(await lockRelease.getReleased(beneficiary4.address)).to.eq(0);
      });

      it("has matured 10% of the total", async function() {
        expect(await lockRelease.getTotalMatured(beneficiary1.address)).to.eq(10);
        expect(await lockRelease.getTotalMatured(beneficiary2.address)).to.eq(20);
        expect(await lockRelease.getTotalMatured(beneficiary3.address)).to.eq(30);
        expect(await lockRelease.getTotalMatured(beneficiary4.address)).to.eq(40);
      });

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

    it("LockRelease correctly tracks user's past votes", async function() {
      // Increase time to 10% through vesting period
      await time.increaseTo(startTime + 10);

      const blockOneNumber = (await ethers.provider.getBlock("latest")).number;
      const blockOneVotes = 100;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockOneVotes
      );

      await time.increaseTo(startTime + 49);
      await lockRelease.connect(beneficiary1).release();
      // Should have 50 votes directly on token, and 50 on LockRelease

      // beneficiary 1 delegates their lockRelease votes to beneficiary 2
      await lockRelease.connect(beneficiary1).delegate(beneficiary2.address);
      const blockTwoNumber = (await ethers.provider.getBlock("latest")).number;
      const blockTwoVotes = 50;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockTwoVotes
      );

      // beneficiary 1 delegates their dcnt votes to beneficiary 2
      await dcnt.connect(beneficiary1).delegate(beneficiary2.address);
      const blockThreeNumber = (await ethers.provider.getBlock("latest"))
        .number;
      const blockThreeVotes = 0;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockThreeVotes
      );

      await time.increase(1);

      // Check votes at past blocks are correct
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockOneNumber)
      ).to.eq(blockOneVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockTwoNumber)
      ).to.eq(blockTwoVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockThreeNumber)
      ).to.eq(blockThreeVotes);

      // benefeciary 1 re-delegates back to themselves
      await lockRelease.connect(beneficiary1).delegate(beneficiary1.address);
      await dcnt.connect(beneficiary1).delegate(beneficiary1.address);
      const blockFourNumber = (await ethers.provider.getBlock("latest")).number;
      const blockFourVotes = 100;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockFourVotes
      );

      // advance time to after end of vesting period
      await time.increaseTo(startTime + duration + 10);

      // beneficiary 1 releases the remaining of their locked tokens
      await lockRelease.connect(beneficiary1).release();

      const blockFiveNumber = (await ethers.provider.getBlock("latest")).number;
      const blockFiveVotes = 100;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockFiveVotes
      );

      await dcnt.connect(beneficiary1).transfer(beneficiary2.address, 30);
      const blockSixNumber = (await ethers.provider.getBlock("latest")).number;
      const blockSixVotes = 70;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockSixVotes
      );

      await dcnt.connect(beneficiary1).transfer(beneficiary2.address, 60);
      const blockSevenNumber = (await ethers.provider.getBlock("latest"))
        .number;
      const blockSevenVotes = 10;
      expect(await lockRelease.getVotes(beneficiary1.address)).to.eq(
        blockSevenVotes
      );

      await time.increase(1);

      // Check votes at past blocks are correct
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockOneNumber)
      ).to.eq(blockOneVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockTwoNumber)
      ).to.eq(blockTwoVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockThreeNumber)
      ).to.eq(blockThreeVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockFourNumber)
      ).to.eq(blockFourVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockFiveNumber)
      ).to.eq(blockFiveVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockSixNumber)
      ).to.eq(blockSixVotes);
      expect(
        await lockRelease.getPastVotes(beneficiary1.address, blockSevenNumber)
      ).to.eq(blockSevenVotes);
    });

    it("Reverts when getPastVotes is called on the current or a future block", async function() {
      await expect(
        lockRelease.getPastVotes(
          beneficiary1.address,
          (
            await ethers.provider.getBlock("latest")
          ).number
        )
      ).to.be.revertedWith("ERC20Votes: future lookup");

      await expect(
        lockRelease.getPastVotes(
          beneficiary1.address,
          (await ethers.provider.getBlock("latest")).number + 1
        )
      ).to.be.revertedWith("ERC20Votes: future lookup");
    });

    it("Reverts when release is called and releasable amount is zero", async function() {
      // vesting hasn't started, so releasable amount is zero
      expect(await lockRelease.getReleasable(beneficiary1.address)).to.eq(0);
      await expect(
        lockRelease.connect(beneficiary1).release()
      ).to.be.revertedWith("NothingToRelease()");

      // deployer isn't a beneficiary, so shouldn't have any releasable funds
      expect(await lockRelease.getReleasable(deployer.address)).to.eq(0);
      await expect(lockRelease.connect(deployer).release()).to.be.revertedWith(
        "NothingToRelease()"
      );

      // Increase time to after vesting period
      await time.increaseTo(startTime + duration + 10);

      // deployer isn't a beneficiary, so shouldn't have any releasable funds
      expect(await lockRelease.getReleasable(deployer.address)).to.eq(0);
      await expect(lockRelease.connect(deployer).release()).to.be.revertedWith(
        "NothingToRelease()"
      );
    });
  });
});
