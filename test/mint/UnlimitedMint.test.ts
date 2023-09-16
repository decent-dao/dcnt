import { loadFixture } from "ethereum-waffle";
import { expect } from "chai";
import { ethers } from "hardhat";
import { UnlimitedMint__factory } from "../../typechain";

describe("UnlimitedMint", async function () {
  async function deployUnlimitedMint() {
    const [owner] = await ethers.getSigners();
    const unlimitedMint = await new UnlimitedMint__factory(owner).deploy();
    return { unlimitedMint };
  };

  it("returns true", async function () {
    const { unlimitedMint } = await loadFixture(deployUnlimitedMint);
    expect(await unlimitedMint.authorizeMint(ethers.constants.AddressZero, 0)).to.be.true;
  });
});
