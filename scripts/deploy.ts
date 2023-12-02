import { AzoriusTxBuilder } from "../DaoBuilder/AzoriusTxBuilder";
import { ethers } from "hardhat";

import { getMasterCopies, getSafeData } from "../DaoBuilder/daoUtils";
import { deployDCNTAndLockRelease } from "../DaoBuilder/dcntTokenDeploy";
import { encodeMultiSend } from "../DaoBuilder/utils";
import { decentDAOConfig } from "../config/dcntDAOConfig";
import { SafeTransaction } from "../DaoBuilder/types";

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
  const urbanTechToTwine = await dcntTokenContract
    .connect(urbanTechFoundation)
    .transfer(twineAssetsLimited.address, totalAmountToLock);
  await urbanTechToTwine.wait();
  console.log(
    `${urbanTechFoundation.address} transferred ${ethers.utils.formatEther(
      totalAmountToLock
    )} tokens to ${
      twineAssetsLimited.address
    } (UTF sending Investor and Purchaser tokens to TAL)`
  );

  //
  // Transfer tokens to be locked up for Investors
  // from Twine Assets Limited to Decent Technologies LLC
  const twineAssetsToDecentTech = await dcntTokenContract
    .connect(twineAssetsLimited)
    .transfer(decentTechLLC.address, amountToLockForInvestors);
  await twineAssetsToDecentTech.wait();
  console.log(
    `${twineAssetsLimited.address} transferred ${ethers.utils.formatEther(
      amountToLockForInvestors
    )} tokens to ${decentTechLLC.address} (TAL sending Investor tokens to DTL)`
  );

  // Lock up tokens for Investors
  // from Decent Technologies to the LockRelease contract
  const decentTechToLockRelease = await dcntTokenContract
    .connect(decentTechLLC)
    .transfer(lockReleaseContract.address, amountToLockForInvestors);
  await decentTechToLockRelease.wait();
  console.log(
    `${decentTechLLC.address} transferred ${ethers.utils.formatEther(
      amountToLockForInvestors
    )} tokens to ${
      lockReleaseContract.address
    } (DTL locking up Investor tokens)`
  );

  //
  // Lock up tokens for Purchasers
  // from Twine Assets Limited to the LockRelease contract
  const twineAssetsToLockRelease = await dcntTokenContract
    .connect(twineAssetsLimited)
    .transfer(lockReleaseContract.address, amountToLockForPurchasers);
  await twineAssetsToLockRelease.wait();
  console.log(
    `${twineAssetsLimited.address} transferred ${ethers.utils.formatEther(
      amountToLockForPurchasers
    )} tokens to ${
      lockReleaseContract.address
    } (TAL locking up Purchaser tokens)`
  );

  const { predictedSafeContract, createSafeTx } = await getSafeData(
    multisendContract
  );

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

  //
  // Setup Gnosis Safe creation TX
  // With the internal TXs it should run post-deployment
  // As well as the strategy (lock release) deployment TX +
  // Token Voting module (Azorius)
  const txs: SafeTransaction[] = [];
  txs.push(createSafeTx);
  txs.push(azoriusTxBuilder.buildDeployStrategyTx());
  txs.push(azoriusTxBuilder.buildDeployAzoriusTx());
  txs.push(
    azoriusTxBuilder.buildExecInternalSafeTx(azoriusTxBuilder.signatures(), [
      azoriusTxBuilder.buildUpdateDAONameTx(),
      azoriusTxBuilder.buildUpdateDAOSnapshotURLTx(),
      azoriusTxBuilder.buildLinearVotingContractSetupTx(),
      azoriusTxBuilder.buildEnableAzoriusModuleTx(),
      azoriusTxBuilder.buildSwapOwnersTx(),
    ])
  );
  const encodedTx = encodeMultiSend(txs);

  //
  // Execute all transactions via multisend
  const allTxsMultisendTx = await multisendContract
    .connect(theDecentFoundation)
    .multiSend(encodedTx);
  await allTxsMultisendTx.wait();
  console.log(
    `${theDecentFoundation.address} deployed Fractal Safe to ${predictedSafeContract.address} at ${allTxsMultisendTx.hash}`
  );
  //
  // Transfer remaining unlocked DCNT supply to the DAO
  // This is equal to total DCNT supply minus tokens held in lock contract
  const treasuryAmount = ethers.utils
    .parseEther(decentDAOConfig.initialSupply)
    .sub(totalAmountToLock);
  const tokenTransfer = await dcntTokenContract
    .connect(urbanTechFoundation)
    .transfer(predictedSafeContract.address, treasuryAmount);
  await tokenTransfer.wait();
  console.log(
    `${urbanTechFoundation.address} transferred ${ethers.utils.formatEther(
      treasuryAmount
    )} tokens to ${predictedSafeContract.address} (UTF sending treasury to DAO)`
  );

  //
  // Assign MINT ability of the DCNT Token to the Decent DAO
  const transferTokenMintOwnership = await dcntTokenContract
    .connect(urbanTechFoundation)
    .grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT_ROLE")),
      predictedSafeContract.address
    );
  await transferTokenMintOwnership.wait();
  console.log(
    `${urbanTechFoundation.address} granted MINT_ROLE to ${predictedSafeContract.address}`
  );

  // Assign UPDATE_MINT_AUTHORIZATION_ROLE ability of the DCNT Token to the Decent DAO
  const transferTokenUpdateMintOwnership = await dcntTokenContract
    .connect(urbanTechFoundation)
    .grantRole(
      ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("UPDATE_MINT_AUTHORIZATION_ROLE")
      ),
      predictedSafeContract.address
    );
  await transferTokenUpdateMintOwnership.wait();
  console.log(
    `${urbanTechFoundation.address} granted UPDATE_MINT_AUTHORIZATION_ROLE to ${predictedSafeContract.address}`
  );

  // Revoke DEFAULT_ADMIN_ROLE of the DCNT Token from the deployer
  const renounceMintFromDeployer = await dcntTokenContract
    .connect(urbanTechFoundation)
    .renounceRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),
      urbanTechFoundation.address
    );
  await renounceMintFromDeployer.wait();
  console.log(`${urbanTechFoundation.address} renounced DEFAULT_ADMIN_ROLE`);
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
