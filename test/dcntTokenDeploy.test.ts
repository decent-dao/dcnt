import { DCNTToken } from './../typechain/DCNTToken.d';
import { LockRelease } from './../typechain/LockRelease.d';
import { BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployDecentToken } from '../DaoBuilder/dcntTokenDeploy';
import { decentTestConfig } from './testDAOConfigs';

describe("deployDecentToken", function () {
  this.timeout(120000)
  let deployer: SignerWithAddress;
  let initialSupply: BigNumber;
  let totalLockedAmount: BigNumber;
  let token: DCNTToken;
  let lockRelease: LockRelease;

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();
    const result = await deployDecentToken(deployer, decentTestConfig);
    initialSupply = ethers.utils.parseEther(decentTestConfig.initialSupply);
    totalLockedAmount = result.totalLockedAmount;
    token = result.dcntTokenContract;
    lockRelease = result.lockReleaseContract;
  });

  it("should correctly deploy the DCNTToken and LockRelease contracts", async function () {
    expect(token.address).to.exist;
    expect(lockRelease.address).to.exist;
  });

  it("should mint the correct initialSupply of tokens", async function () {
    const balance = await token.balanceOf(deployer.address);
    const initialSupplySubLockedAmount = initialSupply.sub(totalLockedAmount);
    expect(balance).to.equal(initialSupplySubLockedAmount);
  });

  it("should transfer the correct amount to the LockRelease contract", async function () {
    const balance = await token.balanceOf(lockRelease.address);
    expect(balance).to.equal(totalLockedAmount);
  });
});
