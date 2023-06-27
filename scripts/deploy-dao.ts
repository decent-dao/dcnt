import { AzoriusTxBuilder } from "./daoFunc/AzoriusTxBuilder";
import { ethers } from "hardhat";
import {
  GnosisSafe,
  GnosisSafe__factory as GnosisSafeFactory,
} from "@fractal-framework/fractal-contracts";
import {
  CHAIN_ID,
  getMasterCopies,
  getSafeData,
  SAFE_VERSION,
} from "./daoFunc/azorius";
import { getMultiSendCallOnlyDeployment } from "@safe-global/safe-deployments";

const abiCoder = new ethers.utils.AbiCoder();

// @todo replace with real addresses and amounts
const beneficiaries = [
  {
    address: "0xMockBeneficiary1",
    lockedAmount: ethers.utils.parseEther("1000"),
  },
  {
    address: "0xMockBeneficiary2",
    lockedAmount: ethers.utils.parseEther("1000"),
  },
];

async function createDAO() {
  const multisendContract = getMultiSendCallOnlyDeployment({
    version: SAFE_VERSION,
    network: CHAIN_ID.toString(),
  });
  if (!multisendContract) throw new Error("Multisend contract not found");

  const [predictedGnosisSafeAddress, safeTx] = await getSafeData(
    multisendContract
  );
  const predictedSafeContract = (await ethers.getContractAt(
    GnosisSafeFactory.abi,
    predictedGnosisSafeAddress
  )) as GnosisSafe;

  const {
    zodiacModuleProxyFactoryContract,
    linearVotingMasterCopyContract,
    fractalAzoriusMasterCopyContract,
  } = await getMasterCopies();

  const azoriusBuild = new AzoriusTxBuilder(
    predictedSafeContract,
    multisendContract,
    zodiacModuleProxyFactoryContract,
    linearVotingMasterCopyContract,
    fractalAzoriusMasterCopyContract
  );

  const txs = [safeTx];
  const internalTxs = [];

  // ?@todo snapshot url?
  // @todo update daoName
  // @todo linear 'setAzorius' tx
}

// async function main() {
//   // get deployer address
//   const [deployer] = await ethers.getSigners();
//   const DCNTTokenArtifact = await ethers.getContractFactory("DCNTToken");
//   const LockReleaseArtifact = await ethers.getContractFactory("LockRelease");

//   // First deploy DCNTToken and mint tokens to deployer address
//   const initialSupply = ethers.utils.parseEther("10000"); // Supply for Token Generation Event
//   const token = await DCNTTokenArtifact.deploy(initialSupply, deployer.address);
//   await token.deployed();
//   console.log(`DCNTToken deployed to: ${token.address}`);

//   // Mocked amounts for beneficiaries
//   const totalLockedAmount = beneficiaries.reduce(
//     (a, b) => a.add(b.lockedAmount),
//     ethers.BigNumber.from(0)
//   );

//   // Deploy LockRelease contract with token address, beneficiaries, amounts, start, and duration
//   const beneficiaryAddresses = beneficiaries.map((b) => b.address);
//   const start = Math.floor(Date.now() / 1000);
//   const duration = 60 * 60 * 24 * 365; // 1 year

//   const lockRelease = await LockReleaseArtifact.deploy(
//     token.address,
//     beneficiaryAddresses,
//     beneficiaries.map((a) => a.lockedAmount),
//     start,
//     duration
//   );
//   await lockRelease.deployed();
//   console.log(`LockRelease contract deployed to: ${lockRelease.address}`);

//   // Make sure enough time has passed before minting new tokens
//   await new Promise((resolve) =>
//     setTimeout(resolve, 1000 * 60 * 60 * 24 * 365)
//   ); // Wait for a year

//   // Mint and fund the lock contract with the locked token amounts
//   await token.mint(lockRelease.address, totalLockedAmount);
//   console.log(
//     `Minted and transferred ${totalLockedAmount} tokens to LockRelease contract`
//   );

// }

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
