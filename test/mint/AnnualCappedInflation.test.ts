import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { AnnualCappedInflation__factory, DCNTToken__factory, UnlimitedMint__factory } from "../../typechain";

import time from "../time";
import { loadFixture } from "ethereum-waffle";

describe("AnnualCappedInflation", async function () {
  async function deployAnnualCappedInflation() {
    const [deployer, dao] = await ethers.getSigners();
    const dcnt = await new DCNTToken__factory(deployer).deploy(
      ethers.utils.parseEther("1000"),
      dao.address,
      (await new UnlimitedMint__factory(deployer).deploy()).address
    );
    const currentTime = await time.latest()
    const annualCappedInflation = await new AnnualCappedInflation__factory(deployer).deploy(dcnt.address, currentTime + 100, dao.address);
    await dcnt.connect(dao).updateMintAuthorization(annualCappedInflation.address);

    const [minimumMintInterval, mintCapBPs] = await Promise.all([annualCappedInflation.MINIMUM_MINT_INTERVAL(), annualCappedInflation.MINT_CAP_BPS()]);

    return { annualCappedInflation, dcnt, dao, minimumMintInterval, mintCapBPs };
  };

  describe("Getting authorization to mint more tokens", function () {
    let originalTotalSupply: BigNumber;
    let nextMint: BigNumber;

    beforeEach(async function () {
      const { annualCappedInflation, dcnt } = await loadFixture(deployAnnualCappedInflation);

      [originalTotalSupply, nextMint] =
        await Promise.all([
          dcnt.totalSupply(),
          annualCappedInflation.nextMint(),
        ]);

      const currentTime = await time.latest();

      if (nextMint.toNumber() > currentTime) {
        await time.increaseTo(nextMint.toNumber());
      }
    });

    describe("Depending on the amount", function () {
      let maxToMint: BigNumber;

      beforeEach(async function () {
        const { mintCapBPs } = await loadFixture(deployAnnualCappedInflation);

        // calculate the max amount of tokens that can be minted
        maxToMint = originalTotalSupply.mul(mintCapBPs).div(10000);
      });

      describe("Checking the view function", async function () {
        it("Should authorize minting max amount", async function () {
          const { annualCappedInflation } = await loadFixture(deployAnnualCappedInflation);
          const authorized = await annualCappedInflation.callStatic.canMint(ethers.constants.AddressZero, maxToMint);
          expect(authorized).to.be.true;
        });
  
        it("Should not authorize minting above max amount", async function () {
          const { annualCappedInflation } = await loadFixture(deployAnnualCappedInflation);
          let overMaxToMint = maxToMint.add(1);
          await expect(annualCappedInflation.callStatic.canMint(ethers.constants.AddressZero, overMaxToMint)).to.be.revertedWith("MintExceedsMaximum()");
        });
      });

      describe("Calling the authorization function", async function () {
        it("Should authorize minting max amount", async function () {
          const { annualCappedInflation, minimumMintInterval, dao } = await loadFixture(deployAnnualCappedInflation);
          await annualCappedInflation.connect(dao).authorizeMint(ethers.constants.AddressZero, maxToMint);
          const currentTime = await time.latest();
          const nextMintFromContract = await annualCappedInflation.nextMint();
          expect(nextMintFromContract).to.eq(minimumMintInterval + currentTime);
        });
  
        it("Should not authorize minting above max amount", async function () {
          const { annualCappedInflation, dao } = await loadFixture(deployAnnualCappedInflation);
          let overMaxToMint = maxToMint.add(1);
          const originalNextMintFromContract = await annualCappedInflation.nextMint();
          await expect(annualCappedInflation.connect(dao).authorizeMint(ethers.constants.AddressZero, overMaxToMint)).to.be.revertedWith("MintExceedsMaximum()");
          const nextMintFromContract = await annualCappedInflation.nextMint();
          expect(nextMintFromContract).to.eq(originalNextMintFromContract);
        });
      });
    });

    describe("Depending on the time", function () {
      beforeEach(async function () {
        const { annualCappedInflation, dao } = await loadFixture(deployAnnualCappedInflation);

        // dummy mint to set the timeout interval
        await annualCappedInflation.connect(dao).authorizeMint(dao.address, 0);
      });

      describe("Checking the view function", async function () {
        it("Should not authorize minting after having just minted", async function () {
          const { annualCappedInflation } = await loadFixture(deployAnnualCappedInflation);
          await expect(annualCappedInflation.callStatic.canMint(ethers.constants.AddressZero, 1)).to.be.revertedWith("MintTooSoon()");
        });
  
        it("Should authorize minting after the minimum mint interval", async function () {
          const { annualCappedInflation, minimumMintInterval } = await loadFixture(deployAnnualCappedInflation);
          await time.increase(minimumMintInterval);
          const toMint = 1;
          const authorized = await annualCappedInflation.callStatic.canMint(ethers.constants.AddressZero, toMint);
          expect(authorized).to.be.true
        });
      });

      describe("Calling the authorization function", async function () {
        it("Should not authorize minting after having just minted", async function () {
          const { annualCappedInflation, dao } = await loadFixture(deployAnnualCappedInflation);
          await expect(annualCappedInflation.connect(dao).authorizeMint(ethers.constants.AddressZero, 1)).to.be.revertedWith("MintTooSoon()");
        });
  
        it("Should authorize minting after the minimum mint interval", async function () {
          const { annualCappedInflation, minimumMintInterval, dao } = await loadFixture(deployAnnualCappedInflation);
          await time.increase(minimumMintInterval);
          const toMint = 1;
          await annualCappedInflation.connect(dao).authorizeMint(ethers.constants.AddressZero, toMint);
          const currentTime = await time.latest();
          const nextMintFromContract = await annualCappedInflation.nextMint();
          expect(nextMintFromContract).to.eq(minimumMintInterval + currentTime);
        });
      });
    });

    describe("Can only happen from the owner", function () {
      it("Fails if authorization is attemped by non-owner", async function () {
        const { annualCappedInflation, minimumMintInterval, dao } = await loadFixture(deployAnnualCappedInflation);
        await expect(annualCappedInflation.authorizeMint(ethers.constants.AddressZero, 0)).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });
  });
});
