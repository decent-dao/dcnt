import { AzoriusTxBuilder } from "../DaoBuilder/AzoriusTxBuilder";
import { ethers, run } from "hardhat";

import { getMasterCopies, getSafeData } from "../DaoBuilder/daoUtils";
import { deployDCNTAndLockRelease } from "../DaoBuilder/dcntTokenDeploy";
import { encodeMultiSend } from "../DaoBuilder/utils";
import { decentDAOConfig } from "../config/dcntDAOConfig";
import { SafeTransaction } from "../DaoBuilder/types";
import { Contract } from "ethers";

async function createDAO() {
  //
  // Get the various signers used for this deployment
  const [
    urbanTechFoundation,
    theDecentFoundation,
    twineAssetsLimited,
    decentTechLLC,
  ] = await ethers.getSigners();

  console.log(`UTF: ${urbanTechFoundation.address} (Urban Tech Foundation)`);
  console.log(`TDF: ${theDecentFoundation.address} (The Decent Foundation)`);
  console.log(`TAL: ${twineAssetsLimited.address} (Twine Assets Limited)`);
  console.log(`DTL: ${decentTechLLC.address} (Decent Technologies LLC)`);

  //
  // Get addresses for various master contracts needed in deployment
  const {
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
    linearVotingMasterCopyContract,
    multisendContract,
  } = await getMasterCopies();

  const { predictedSafeContract, createSafeTx } = await getSafeData(multisendContract);

  //
  // Deploy DCNT Token & Lock Release Contracts
  const {
    noMintContract,
    dcntTokenContract,
    dcntTokenConstructorArguments,
    lockReleaseContract,
    lockReleaseConstructorArguments,
    totalAmountToLock,
    amountToLockForInvestors,
    amountToLockForPurchasers,
  } = await deployDCNTAndLockRelease(urbanTechFoundation, decentDAOConfig);

  //
  // Transfer all tokens to be locked up from
  // Urban Tech Foundation to Twine Assets Limited
  const urbanTechToTwine = await dcntTokenContract.connect(urbanTechFoundation).transfer(twineAssetsLimited.address, totalAmountToLock);
  await urbanTechToTwine.wait();
  console.log(`${urbanTechFoundation.address} transferred ${ethers.formatEther(totalAmountToLock)} tokens to ${twineAssetsLimited.address} (UTF sending Investor and Purchaser tokens to TAL)`);

  //
  // Transfer tokens to be locked up for Investors
  // from Twine Assets Limited to Decent Technologies LLC
  const twineAssetsToDecentTech = await dcntTokenContract.connect(twineAssetsLimited).transfer(decentTechLLC.address, amountToLockForInvestors);
  await twineAssetsToDecentTech.wait();
  console.log(`${twineAssetsLimited.address} transferred ${ethers.formatEther(amountToLockForInvestors)} tokens to ${decentTechLLC.address} (TAL sending Investor tokens to DTL)`);

  // Lock up tokens for Investors
  // from Decent Technologies to the LockRelease contract
  const decentTechToLockRelease = await dcntTokenContract.connect(decentTechLLC).transfer(await lockReleaseContract.getAddress(), amountToLockForInvestors);
  await decentTechToLockRelease.wait();
  console.log(`${decentTechLLC.address} transferred ${ethers.formatEther(amountToLockForInvestors)} tokens to ${await lockReleaseContract.getAddress()} (DTL locking up Investor tokens)`);

  //
  // Lock up tokens for Purchasers
  // from Twine Assets Limited to the LockRelease contract
  const twineAssetsToLockRelease = await dcntTokenContract.connect(twineAssetsLimited).transfer(await lockReleaseContract.getAddress(), amountToLockForPurchasers);
  await twineAssetsToLockRelease.wait();
  console.log(`${twineAssetsLimited.address} transferred ${ethers.formatEther(amountToLockForPurchasers)} tokens to ${await lockReleaseContract.getAddress()} (TAL locking up Purchaser tokens)`);

  //
  // Build Token Voting Contract
  // The Lock Release will act as the Token Voting Strategy
  // The DCNT Token is the Token Voting Token
  const azoriusTxBuilder = new AzoriusTxBuilder(
    decentDAOConfig,
    predictedSafeContract,
    dcntTokenContract,
    lockReleaseContract,
    multisendContract,
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
    linearVotingMasterCopyContract
  );
  await azoriusTxBuilder.setup();

  //
  // Setup Gnosis Safe creation TX
  // With the internal TXs it should run post-deployment
  // As well as the strategy (lock release) deployment TX +
  // Token Voting module (Azorius)
  const txs: SafeTransaction[] = [];
  txs.push(createSafeTx);
  txs.push(await azoriusTxBuilder.buildDeployStrategyTx());
  txs.push(await azoriusTxBuilder.buildDeployAzoriusTx());
  txs.push(
    await azoriusTxBuilder.buildExecInternalSafeTx(await azoriusTxBuilder.signatures(), [
      await azoriusTxBuilder.buildUpdateDAONameTx(),
      await azoriusTxBuilder.buildUpdateDAOSnapshotURLTx(),
      await azoriusTxBuilder.buildLinearVotingContractSetupTx(),
      await azoriusTxBuilder.buildEnableAzoriusModuleTx(),
      await azoriusTxBuilder.buildSwapOwnersTx(),
    ])
  );
  const encodedTx = encodeMultiSend(txs);

  //
  // Execute all transactions via multisend
  const allTxsMultisendTx = await (multisendContract.connect(theDecentFoundation) as Contract).multiSend(encodedTx);
  await allTxsMultisendTx.wait();
  console.log(`${theDecentFoundation.address} deployed Fractal Safe to ${await predictedSafeContract.getAddress()} at ${allTxsMultisendTx.hash}`);

  //
  // Transfer remaining unlocked DCNT supply to the DAO
  // This is equal to total DCNT supply minus tokens held in lock contract
  const treasuryAmount = ethers.parseEther(decentDAOConfig.initialSupply) - totalAmountToLock;
  const tokenTransfer = await dcntTokenContract
    .connect(urbanTechFoundation)
    .transfer(await predictedSafeContract.getAddress(), treasuryAmount);
  await tokenTransfer.wait();
  console.log(`${urbanTechFoundation.address} transferred ${ethers.formatEther(treasuryAmount)} tokens to ${await predictedSafeContract.getAddress()} (UTF sending treasury to DAO)`);

  //
  // Assign MINT ability of the DCNT Token to the Decent DAO
  const transferTokenMintOwnership = await dcntTokenContract
    .connect(urbanTechFoundation)
    .grantRole(
      ethers.keccak256(ethers.toUtf8Bytes("MINT_ROLE")),
      await predictedSafeContract.getAddress()
    );
  await transferTokenMintOwnership.wait();
  console.log(`${urbanTechFoundation.address} granted MINT_ROLE to ${await predictedSafeContract.getAddress()}`);

  // Assign UPDATE_MINT_AUTHORIZATION_ROLE ability of the DCNT Token to the Decent DAO
  const transferTokenUpdateMintOwnership = await dcntTokenContract
    .connect(urbanTechFoundation)
    .grantRole(
      ethers.keccak256(ethers.toUtf8Bytes("UPDATE_MINT_AUTHORIZATION_ROLE")),
      await predictedSafeContract.getAddress()
    );
  await transferTokenUpdateMintOwnership.wait();
  console.log(`${urbanTechFoundation.address} granted UPDATE_MINT_AUTHORIZATION_ROLE to ${await predictedSafeContract.getAddress()}`);

  // Revoke DEFAULT_ADMIN_ROLE of the DCNT Token from the deployer
  const renounceMintFromDeployer = await dcntTokenContract
    .connect(urbanTechFoundation)
    .renounceRole(
      ethers.keccak256(ethers.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),
      urbanTechFoundation.address
    );
  await renounceMintFromDeployer.wait();
  console.log(`${urbanTechFoundation.address} renounced DEFAULT_ADMIN_ROLE`);

  await run("verify:verify", { address: await noMintContract.getAddress() });
  await run("verify:verify", {
    address: await dcntTokenContract.getAddress(),
    constructorArguments: dcntTokenConstructorArguments,
  });
  await run("verify:verify", {
    address: await lockReleaseContract.getAddress(),
    constructorArguments: lockReleaseConstructorArguments,
  });
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
