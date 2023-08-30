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
    describe("Minting the correct amount of tokens at deployment", function () {
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
      let originalTotalSupply: BigNumber;

      beforeEach(async function () {
        originalTotalSupply = await dcnt.totalSupply();
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
          const mintRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINT_ROLE'));

          await expect(
            dcnt.connect(nonOwner).mint(owner.address, oneWei)
          ).to.be.revertedWith(`AccessControl: account ${nonOwner.address.toLowerCase()} is missing role ${mintRole}`);
        });
      });
    });
  });
});
