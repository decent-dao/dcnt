import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Mocked ABI and bytecode for the token and other contracts
  const MockTokenArtifact = await ethers.getContractFactory("MockToken");
  const LockContractArtifact = await ethers.getContractFactory("LockContract");
  const FractalDAOArtifact = await ethers.getContractFactory("FractalDAO");

  // 1. Deploy token and mint tokens to deployer address
  const token = await MockTokenArtifact.deploy();
  await token.deployed();
  console.log(`Token deployed to: ${token.address}`);

  const initialSupply = ethers.utils.parseEther("10000"); // Mocked initial supply
  await token.mint(deployer.address, initialSupply);
  console.log(`Minted ${initialSupply} tokens to ${deployer.address}`);

  // 2. Deploy lock contract with token address
  // Mocked locked token beneficiaries and their amounts
  const beneficiaries = ["0xMockBeneficiary1", "0xMockBeneficiary2"];
  const amounts = [
    ethers.utils.parseEther("1000"),
    ethers.utils.parseEther("1000"),
  ]; // Mocked amounts for beneficiaries

  const lockContract = await LockContractArtifact.deploy(
    token.address,
    beneficiaries,
    amounts
  );
  await lockContract.deployed();
  console.log(`Lock Contract deployed to: ${lockContract.address}`);

  // 3. Deployer funds lock contract with the locked token amounts
  const totalLockedAmount = amounts.reduce(
    (a, b) => a.add(b),
    BigNumber.from(0)
  );
  await token.transfer(lockContract.address, totalLockedAmount);
  console.log(`Transferred ${totalLockedAmount} tokens to Lock Contract`);

  // 4. Fractal DAO is deployed with token as the governance token, and the lock contract as the address on the strategy for governance
  const fractalDAO = await FractalDAOArtifact.deploy(
    token.address,
    lockContract.address
  );
  await fractalDAO.deployed();
  console.log(`Fractal DAO deployed to: ${fractalDAO.address}`);

  // 5. Deployer funds Fractal DAO with remaining tokens
  const remainingTokens = initialSupply.sub(totalLockedAmount);
  await token.transfer(fractalDAO.address, remainingTokens);
  console.log(`Transferred ${remainingTokens} tokens to Fractal DAO`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
