import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DCNTToken } from "../typechain";

import time from "./time";

describe("DCNTToken", async function () {
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let dcnt: DCNTToken;

  const mintWhole = 1_000_000_000;
  const mintTotal = ethers.utils.parseEther(mintWhole.toString());

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();

    // Deploy token contract
    const _DCNTToken = await ethers.getContractFactory("DCNTToken");
    dcnt = await _DCNTToken.deploy(mintTotal, owner.address);
    await dcnt.deployed();
  });

  describe("Token features", function () {
    context("on deployment", function () {
      let totalSupply: BigNumber;

      beforeEach(async function () {
        totalSupply = await dcnt.totalSupply();
      });

      it("should mint the correct amount of tokens in wei (decimals)", async function () {
        expect(totalSupply).to.equal(mintTotal);
      });

      it("should mint the correct amount of tokens in whole numbers", async function () {
        expect(parseInt(ethers.utils.formatEther(totalSupply))).to.eq(
          mintWhole
        );
      });
    });

    describe("burn", function () {
      it("should allow users to burn their tokens", async function () {
        const totalSupply = await dcnt.totalSupply();
        const burnWhole = 500_000_000;
        const burnTotal = ethers.utils.parseEther(burnWhole.toString());
        await dcnt.connect(owner).burn(burnTotal);

        expect(await dcnt.totalSupply()).to.eq(totalSupply.sub(burnTotal));
        expect(await dcnt.balanceOf(owner.address)).to.eq(
          totalSupply.sub(burnTotal)
        );
      });
    });

    describe("mint", function () {
      let originalTotalSupply: BigNumber,
        minimumMintInterval: number,
        mintCapBPs: number,
        nextMint: BigNumber,
        maxToMint: BigNumber;

      beforeEach(async function () {
        [originalTotalSupply, minimumMintInterval, mintCapBPs, nextMint] =
          await Promise.all([
            dcnt.totalSupply(),
            dcnt.MINIMUM_MINT_INTERVAL(),
            dcnt.MINT_CAP_BPS(),
            dcnt.nextMint(),
          ]);

        maxToMint = originalTotalSupply.mul(mintCapBPs).div(10000);

        await time.increaseTo(nextMint.toNumber());
      });

      context("when caller address is the owner", function () {
        it("mints 1 wei", async function() {
          await dcnt.mint(owner.address, 1);
          expect(await dcnt.totalSupply()).to.eq(
            originalTotalSupply.add(1)
          );
        });
      });


      context("when caller address is non-owner", function() {
        it("reverts with correct error message", async function () {
          await expect(
            dcnt.connect(nonOwner).mint(owner.address, 1)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });

      context("when minting the max tokens allowed", function () {
        it("should allow the owner to mint more tokens", async function() {
          await dcnt.mint(owner.address, maxToMint);
          expect(await dcnt.totalSupply()).to.eq(
            originalTotalSupply.add(maxToMint)
          );
        });
      });

      context("when minting over the max mint amount", function () {
        it("should not allow the owner to mint more tokens", async function () {
          await expect(
            dcnt.mint(owner.address, maxToMint.add(1))
          ).to.be.revertedWith("MintExceedsMaximum()");
        });
      });

      context("after new mint", function () {
        beforeEach(async function () {
          // dummy mint to set the timeout interval
          await dcnt.mint(owner.address, 0);
        });

        it("should not allow the owner to mint after having just minted", async function () {
          await expect(dcnt.mint(owner.address, 1)).to.be.revertedWith(
            "MintTooSoon()"
          );
        });

        context("after minimum interval has passed since last mint", function() {
          beforeEach(async function() {
            await time.increase(minimumMintInterval);
          });

          it("should allow the owner to mint after the minimum mint interval", async function() {
            const toMint = 1;
            await dcnt.mint(owner.address, toMint);
            expect(await dcnt.totalSupply()).to.eq(
              originalTotalSupply.add(toMint)
            );
          });
        });
      });
    });
  });
});
