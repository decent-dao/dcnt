import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NoMint__factory } from "../../typechain-types";

describe("NoMint", async function () {
  async function deployNoMint() {
    const [owner] = await ethers.getSigners();
    const noMint = await new NoMint__factory(owner).deploy();
    return { noMint };
  };

  it("returns false", async function () {
    const { noMint } = await loadFixture(deployNoMint);
    expect(await noMint.authorizeMint(ethers.ZeroAddress, 0)).to.be.false;
  });
});
