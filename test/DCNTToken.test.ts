import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DCNTToken, DCNTToken__factory, UnlimitedMint, UnlimitedMint__factory, NoMint__factory } from "../typechain";

const mintRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINT_ROLE'));
const updateMintAuthorizationRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('UPDATE_MINT_AUTHORIZATION_ROLE'));

describe("DCNTToken", async function () {
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let dcnt: DCNTToken;

  const mintWhole = 1_000_000_000;
  const mintTotal = ethers.utils.parseEther(mintWhole.toString());

  beforeEach(async function () {
    [owner, nonOwner] = await ethers.getSigners();

    dcnt = await new DCNTToken__factory(owner).deploy(
      mintTotal,
      owner.address,
      (await new UnlimitedMint__factory(owner).deploy()).address
    );
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
      beforeEach(async function () {
        await dcnt.grantRole(mintRole, owner.address);
      });

      it("Should allow the MINT_ROLE to burn their own tokens", async function () {
        const totalSupply = await dcnt.totalSupply();
        const burnWhole = 500_000_000;
        const burnTotal = ethers.utils.parseEther(burnWhole.toString());
        await dcnt.connect(owner).burn(burnTotal);

        expect(await dcnt.totalSupply()).to.eq(totalSupply.sub(burnTotal));
        expect(await dcnt.balanceOf(owner.address)).to.eq(
          totalSupply.sub(burnTotal)
        );
      });

      it("Should not allow non-MINT_ROLE to burn their own tokens", async function () {
        const burnWhole = 1;
        const burnTotal = ethers.utils.parseEther(burnWhole.toString());
        await expect(dcnt.connect(nonOwner).burn(burnTotal)).to.be.revertedWith(`AccessControl: account ${nonOwner.address.toLowerCase()} is missing role ${mintRole}`);
      });
    });

    describe("Minting more tokens", function () {
      let originalTotalSupply: BigNumber;

      beforeEach(async function () {
        originalTotalSupply = await dcnt.totalSupply();
        await dcnt.grantRole(mintRole, owner.address);
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
          ).to.be.revertedWith(`AccessControl: account ${nonOwner.address.toLowerCase()} is missing role ${mintRole}`);
        });
      });

      describe("When not authorized", function () {
        beforeEach(async function () {
          // owner needs to be able to perform mint authorization updates,
          // to install the NoMint contract.
          await dcnt.grantRole(updateMintAuthorizationRole, owner.address);
        });

        it("Throws an error", async function () {
          let noMint = await new NoMint__factory(owner).deploy();
          await dcnt.updateMintAuthorization(noMint.address);
          await expect(dcnt.mint(owner.address, 1)).to.be.revertedWith("UnauthorizedMint()");
        });
      });
    });

    describe("Updating the MintAuthorization contract", function () {
      let newInstance: UnlimitedMint;

      beforeEach(async function () {
        newInstance = await new UnlimitedMint__factory(owner).deploy();
      });

      it("Should allow owner to update to a new instance", async function () {
        await dcnt.grantRole(updateMintAuthorizationRole, owner.address);
        await dcnt.updateMintAuthorization(newInstance.address);
        expect(await dcnt.mintAuthorization()).to.eq(newInstance.address);
      });

      it("Should not allow non-owner to update to a new instance", async function () {
        const originalMintAuthorizationAddress = await dcnt.mintAuthorization();

        await expect(
          dcnt.connect(nonOwner).updateMintAuthorization(newInstance.address)
        ).to.be.revertedWith(`AccessControl: account ${nonOwner.address.toLowerCase()} is missing role ${updateMintAuthorizationRole}`);
        expect(await dcnt.mintAuthorization()).to.eq(originalMintAuthorizationAddress);
      });
    });

    describe("Revoking roles and testing behavior", function () {
      describe("Revoking the MINT_ROLE", function () {
        it("Doesn't allow any more minting", async function () {
          await dcnt.renounceRole(mintRole, owner.address);
          await expect(dcnt.mint(owner.address, 1)).to.be.revertedWith(`AccessControl: account ${owner.address.toLowerCase()} is missing role ${mintRole}`);
        });
      });

      describe("Revoking the UPDATE_MINT_AUTHORIZATION_ROLE", function () {
        it("Doesn't allow updating the mint authorization contract", async function () {
          await dcnt.renounceRole(updateMintAuthorizationRole, owner.address);
          const newInstance = await new UnlimitedMint__factory(owner).deploy();
          await expect(dcnt.updateMintAuthorization(newInstance.address)).to.be.revertedWith(`AccessControl: account ${owner.address.toLowerCase()} is missing role ${updateMintAuthorizationRole}`);
        });
      });
    });
  });
});
