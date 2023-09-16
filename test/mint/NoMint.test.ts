import { loadFixture } from "ethereum-waffle";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NoMint__factory } from "../../typechain";

describe("NoMint", async function () {
  async function deployNoMint() {
    const [owner] = await ethers.getSigners();
    const noMint = await new NoMint__factory(owner).deploy();
    return { noMint };
  };

  it("returns false", async function () {
    const { noMint } = await loadFixture(deployNoMint);
    expect(await noMint.authorizeMint(ethers.constants.AddressZero, 0)).to.be.false;
  });
});
