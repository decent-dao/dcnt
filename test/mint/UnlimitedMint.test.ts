import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { UnlimitedMint__factory } from "../../typechain-types";

describe("UnlimitedMint", async function () {
  async function deployUnlimitedMint() {
    const [owner] = await ethers.getSigners();
    const unlimitedMint = await new UnlimitedMint__factory(owner).deploy();
    return { unlimitedMint };
  };

  it("returns true", async function () {
    const { unlimitedMint } = await loadFixture(deployUnlimitedMint);
    expect(await unlimitedMint.authorizeMint(ethers.ZeroAddress, 0)).to.be.true;
  });
});
