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
    describe("Minting the correct amount of tokens", function () {
      let totalSupply: BigNumber;

      beforeEach(async function () {
        totalSupply = await dcnt.totalSupply();
      });

      it("Should mint the correct amount of tokens in wei (decimals)", async function () {
        expect(totalSupply).to.equal(mintTotal);
      });

      it("Should mint the correct amount of tokens in whole numbers", async function () {
        expect(parseInt(ethers.utils.formatEther(totalSupply))).to.eq(
          mintWhole
        );
      });
    });

    describe("Burning tokens", function () {
      it("Should allow users to burn their tokens", async function () {
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

    describe("Minting more tokens", function () {
      let originalTotalSupply: BigNumber,
        minimumMintInterval: number,
        mintCapBPs: number,
        nextMint: BigNumber;

      beforeEach(async function () {
        [originalTotalSupply, minimumMintInterval, mintCapBPs, nextMint] =
          await Promise.all([
            dcnt.totalSupply(),
            dcnt.MINIMUM_MINT_INTERVAL(),
            dcnt.MINT_CAP_BPS(),
            dcnt.nextMint(),
          ]);

        await time.increaseTo(nextMint.toNumber());
      });

      describe("Depending on the caller address", function () {
        let oneWei: number;

        beforeEach(function () {
          oneWei = 1;
        });

        it("Should allow owner to mint 1 wei", async function () {
          await dcnt.mint(owner.address, oneWei);
          expect(await dcnt.totalSupply()).to.eq(
            originalTotalSupply.add(oneWei)
          );
        });

        it("Should not allow non-owner to mint 1 wei", async function () {
          await expect(
            dcnt.connect(nonOwner).mint(owner.address, oneWei)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });

      describe("Depending on the amount", function () {
        let maxToMint: BigNumber;

        beforeEach(async function () {
          // calculate the max amount of tokens that can be minted
          maxToMint = originalTotalSupply.mul(mintCapBPs).div(10000);
        });

        describe("Max mint amount", function () {
          it("Should allow the owner to mint more tokens", async function () {
            await dcnt.mint(owner.address, maxToMint);
            expect(await dcnt.totalSupply()).to.eq(
              originalTotalSupply.add(maxToMint)
            );
          });
        });

        describe("Over max mint amount", function () {
          let overMaxToMint: BigNumber;

          beforeEach(function () {
            overMaxToMint = maxToMint.add(1);
          });

          it("Should not allow the owner to mint more tokens", async function () {
            await expect(
              dcnt.mint(owner.address, overMaxToMint)
            ).to.be.revertedWith("MintExceedsMaximum()");
          });
        });
      });

      describe("Depending on the time", function () {
        beforeEach(async function () {
          // dummy mint to set the timeout interval
          await dcnt.mint(owner.address, 0);
        });

        it("Should not allow the owner to mint after having just minted", async function () {
          await expect(dcnt.mint(owner.address, 1)).to.be.revertedWith(
            "MintTooSoon()"
          );
        });

        it("Should allow the owner to mint after the minimum mint interval", async function () {
          await time.increase(minimumMintInterval);
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
