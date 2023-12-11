import { Signer } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DCNTToken, DCNTToken__factory, UnlimitedMint, UnlimitedMint__factory, NoMint__factory } from "../typechain-types";

const mintRole = ethers.keccak256(ethers.toUtf8Bytes('MINT_ROLE'));
const updateMintAuthorizationRole = ethers.keccak256(ethers.toUtf8Bytes('UPDATE_MINT_AUTHORIZATION_ROLE'));

describe("DCNTToken", async function () {
  let owner: Signer;
  let nonOwner: Signer;
  let dcnt: DCNTToken;

  const mintWhole = 1_000_000_000;
  const mintTotal = ethers.parseEther(mintWhole.toString());

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();

    dcnt = await new DCNTToken__factory(owner).deploy(
      mintTotal,
      await owner.getAddress(),
      await (await new UnlimitedMint__factory(owner).deploy()).getAddress(),
      "Test Token",
      "TEST"
    );
  });

  describe("Token features", function () {
    describe("Minting the correct amount of tokens at deployment", function () {
      let totalSupply: bigint;

      beforeEach(async function () {
        totalSupply = await dcnt.totalSupply();
      });

      it("Should mint the correct amount of tokens in wei (decimals)", async function () {
        expect(totalSupply).to.equal(mintTotal);
      });

      it("Should mint the correct amount of tokens in whole numbers", async function () {
        expect(parseInt(ethers.formatEther(totalSupply))).to.eq(
          mintWhole
        );
      });
    });

    describe("Burning tokens", function () {
      beforeEach(async function () {
        await dcnt.grantRole(mintRole, await owner.getAddress());
      });

      it("Should allow the MINT_ROLE to burn their own tokens", async function () {
        const totalSupply = await dcnt.totalSupply();
        const burnWhole = 500_000_000;
        const burnTotal = ethers.parseEther(burnWhole.toString());
        await dcnt.connect(owner).burn(burnTotal);

        expect(await dcnt.totalSupply()).to.eq(totalSupply - burnTotal);
        expect(await dcnt.balanceOf(await owner.getAddress())).to.eq(totalSupply - burnTotal);
      });

      it("Should not allow non-MINT_ROLE to burn their own tokens", async function () {
        const burnWhole = 1;
        const burnTotal = ethers.parseEther(burnWhole.toString());
        await expect(dcnt.connect(nonOwner).burn(burnTotal)).to.be.revertedWithCustomError(dcnt, "AccessControlUnauthorizedAccount");
      });
    });

    describe("Minting more tokens", function () {
      let originalTotalSupply: bigint;

      beforeEach(async function () {
        originalTotalSupply = await dcnt.totalSupply();
        await dcnt.grantRole(mintRole, await owner.getAddress());
      });

      describe("Depending on the caller address", function () {
        let oneWei: bigint;

        beforeEach(function () {
          oneWei = BigInt(1);
        });

        it("Should allow owner to mint 1 wei", async function () {
          await dcnt.mint(await owner.getAddress(), oneWei);
          expect(await dcnt.totalSupply()).to.eq(originalTotalSupply + oneWei);
        });

        it("Should not allow non-owner to mint 1 wei", async function () {
          await expect(
            dcnt.connect(nonOwner).mint(await owner.getAddress(), oneWei)
          ).to.be.revertedWithCustomError(dcnt, "AccessControlUnauthorizedAccount");
        });
      });

      describe("When not authorized", function () {
        beforeEach(async function () {
          // owner needs to be able to perform mint authorization updates,
          // to install the NoMint contract.
          await dcnt.grantRole(updateMintAuthorizationRole, await owner.getAddress());
        });

        it("Throws an error", async function () {
          let noMint = await new NoMint__factory(owner).deploy();
          await dcnt.updateMintAuthorization(await noMint.getAddress());
          await expect(dcnt.mint(await owner.getAddress(), 1)).to.be.revertedWithCustomError(dcnt, "UnauthorizedMint");
        });
      });
    });

    describe("Updating the MintAuthorization contract", function () {
      let newInstance: UnlimitedMint;

      beforeEach(async function () {
        newInstance = await new UnlimitedMint__factory(owner).deploy();
      });

      it("Should allow owner to update to a new instance", async function () {
        await dcnt.grantRole(updateMintAuthorizationRole, await owner.getAddress());
        await dcnt.updateMintAuthorization(await newInstance.getAddress());
        expect(await dcnt.mintAuthorization()).to.eq(await newInstance.getAddress());
      });

      it("Should not allow non-owner to update to a new instance", async function () {
        const originalMintAuthorizationAddress = await dcnt.mintAuthorization();

        await expect(
          dcnt.connect(nonOwner).updateMintAuthorization(await newInstance.getAddress())
        ).to.be.revertedWithCustomError(dcnt, "AccessControlUnauthorizedAccount");
        expect(await dcnt.mintAuthorization()).to.eq(originalMintAuthorizationAddress);
      });
    });

    describe("Revoking roles and testing behavior", function () {
      describe("Revoking the MINT_ROLE", function () {
        it("Doesn't allow any more minting", async function () {
          await dcnt.renounceRole(mintRole, await owner.getAddress());
          await expect(dcnt.mint(await owner.getAddress(), 1)).to.be.revertedWithCustomError(dcnt, "AccessControlUnauthorizedAccount");
        });
      });

      describe("Revoking the UPDATE_MINT_AUTHORIZATION_ROLE", function () {
        it("Doesn't allow updating the mint authorization contract", async function () {
          await dcnt.renounceRole(updateMintAuthorizationRole, await owner.getAddress());
          const newInstance = await new UnlimitedMint__factory(owner).deploy();
          await expect(dcnt.updateMintAuthorization(await newInstance.getAddress())).to.be.revertedWithCustomError(dcnt, "AccessControlUnauthorizedAccount");
        });
      });
    });
  });
});
