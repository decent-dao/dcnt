import { expect } from "chai";
import { ethers } from "hardhat";
import { AnnualCappedInflation, AnnualCappedInflation__factory, DCNTToken, DCNTToken__factory, UnlimitedMint__factory } from "../../typechain-types";

import { time } from "@nomicfoundation/hardhat-network-helpers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Signer } from "ethers";

const updateMintAuthorizationRole = ethers.keccak256(ethers.toUtf8Bytes('UPDATE_MINT_AUTHORIZATION_ROLE'));

describe("AnnualCappedInflation", async function () {
  async function deployAnnualCappedInflation() {
    const [_deployer, _dao] = await ethers.getSigners();
    const _dcnt = await new DCNTToken__factory(_deployer).deploy(
      ethers.parseEther("1000"),
      _dao.address,
      await (await new UnlimitedMint__factory(_deployer).deploy()).getAddress(),
      "Test Token",
      "TEST"
    );
    await _dcnt.connect(_dao).grantRole(updateMintAuthorizationRole, _dao.address);
    const currentTime = await time.latest()
    const _annualCappedInflation = await new AnnualCappedInflation__factory(_deployer).deploy(await _dcnt.getAddress(), currentTime + 100, _dao.address);
    await _dcnt.connect(_dao).updateMintAuthorization(await _annualCappedInflation.getAddress());

    const [_minimumMintInterval, _mintCapBPs] = await Promise.all([_annualCappedInflation.MINIMUM_MINT_INTERVAL(), _annualCappedInflation.MINT_CAP_BPS()]);

    return { _annualCappedInflation, _dcnt, _dao, _minimumMintInterval, _mintCapBPs, _deployer };
  };

  describe("Getting authorization to mint more tokens", function () {
    let dcnt: DCNTToken;
    let dao: Signer;
    let annualCappedInflation: AnnualCappedInflation;
    let minimumMintInterval: bigint;
    let originalTotalSupply: bigint;
    let nextMint: bigint;
    let mintCapBPs: bigint;

    beforeEach(async function () {
      const { _annualCappedInflation, _dcnt, _mintCapBPs, _minimumMintInterval, _dao } = await loadFixture(deployAnnualCappedInflation);
      annualCappedInflation = _annualCappedInflation;
      mintCapBPs = _mintCapBPs;
      dcnt = _dcnt;
      dao = _dao;
      minimumMintInterval = _minimumMintInterval;

      [originalTotalSupply, nextMint] =
        await Promise.all([
          dcnt.totalSupply(),
          annualCappedInflation.nextMint(),
        ]);

      const currentTime = await time.latest();
      if (nextMint > BigInt(currentTime)) {
        await time.increaseTo(Number(nextMint));
      }
    });

    describe("Depending on the amount", function () {
      let maxToMint: bigint;

      beforeEach(async function () {
        // calculate the max amount of tokens that can be minted
        maxToMint = originalTotalSupply * mintCapBPs / BigInt(10000);
      });

      describe("Checking the view function", async function () {
        it("Should authorize minting max amount", async function () {
          const authorized = await annualCappedInflation.canMint.staticCall(ethers.ZeroAddress, maxToMint);
          expect(authorized).to.be.true;
        });
  
        it("Should not authorize minting above max amount", async function () {
          let overMaxToMint = maxToMint + BigInt(1);
          await expect(annualCappedInflation.canMint.staticCall(ethers.ZeroAddress, overMaxToMint)).to.be.revertedWithCustomError(annualCappedInflation, "MintExceedsMaximum");
        });
      });

      describe("Calling the authorization function", async function () {
        it("Should authorize minting max amount", async function () {
          await annualCappedInflation.connect(dao).authorizeMint(ethers.ZeroAddress, maxToMint);
          const currentTime = await time.latest();
          const nextMintFromContract = await annualCappedInflation.nextMint();
          expect(nextMintFromContract).to.eq(BigInt(minimumMintInterval) + BigInt(currentTime));
        });
  
        it("Should not authorize minting above max amount", async function () {
          let overMaxToMint = maxToMint + BigInt(1);
          const originalNextMintFromContract = await annualCappedInflation.nextMint();
          await expect(annualCappedInflation.connect(dao).authorizeMint(ethers.ZeroAddress, overMaxToMint)).to.be.revertedWithCustomError(annualCappedInflation, "MintExceedsMaximum");
          const nextMintFromContract = await annualCappedInflation.nextMint();
          expect(nextMintFromContract).to.eq(originalNextMintFromContract);
        });
      });
    });

    describe("Depending on the time", function () {
      beforeEach(async function () {
        // dummy mint to set the timeout interval
        await annualCappedInflation.connect(dao).authorizeMint(await dao.getAddress(), 0);
      });

      describe("Checking the view function", async function () {
        it("Should not authorize minting after having just minted", async function () {
          await expect(annualCappedInflation.canMint.staticCall(ethers.ZeroAddress, 1)).to.be.revertedWithCustomError(annualCappedInflation, "MintTooSoon");
        });
  
        it("Should authorize minting after the minimum mint interval", async function () {
          await time.increase(Number(minimumMintInterval));
          const toMint = 1;
          const authorized = await annualCappedInflation.canMint.staticCall(ethers.ZeroAddress, toMint);
          expect(authorized).to.be.true
        });
      });

      describe("Calling the authorization function", async function () {
        it("Should not authorize minting after having just minted", async function () {
          await expect(annualCappedInflation.connect(dao).authorizeMint(ethers.ZeroAddress, 1)).to.be.revertedWithCustomError(annualCappedInflation, "MintTooSoon");
        });
  
        it("Should authorize minting after the minimum mint interval", async function () {
          await time.increase(Number(minimumMintInterval));
          const toMint = 1;
          await annualCappedInflation.connect(dao).authorizeMint(ethers.ZeroAddress, toMint);
          const currentTime = await time.latest();
          const nextMintFromContract = await annualCappedInflation.nextMint();
          expect(nextMintFromContract).to.eq(minimumMintInterval + BigInt(currentTime));
        });
      });
    });

    describe("Can only happen from the owner", function () {
      it("Fails if authorization is attemped by non-owner", async function () {
        await expect(annualCappedInflation.authorizeMint(ethers.ZeroAddress, 0)).to.be.revertedWithCustomError(annualCappedInflation, "OwnableUnauthorizedAccount");
      });
    });
  });
});
