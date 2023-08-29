import { AzoriusTxBuilder } from "../DaoBuilder/AzoriusTxBuilder";
import { ethers } from "hardhat";

import { getMasterCopies, getSafeData } from "../DaoBuilder/daoUtils";
import { deployDCNTAndLockRelease } from "../DaoBuilder/dcntTokenDeploy";
import { encodeMultiSend } from "../DaoBuilder/utils";
import { decentDAOConfig } from "../DaoBuilder/dcntDAOConfig";
import { utils } from "ethers";
import { logDcntDaoTxt, logEthereumLogo } from "./graphics/graphics";

async function createDAO() {
  //
  // Deploy DCNT Token & Lock Release Contracts
  const [deployer] = await ethers.getSigners();
  const { dcntTokenContract, lockReleaseContract, totalLockedAmount } =
    await deployDCNTAndLockRelease(deployer, decentDAOConfig);

  //
  // Get predicted safe deployment address + transaction
  // This transaction will deploy a new Gnosis safe
  const {
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
    linearVotingMasterCopyContract,
    multisendContract,
  } = await getMasterCopies();

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
  const txs = [createSafeTx];
  const internalTxs = [
    azoriusTxBuilder.buildUpdateDAONameTx(),
    azoriusTxBuilder.buildUpdateDAOSnapshotURLTx(),
    azoriusTxBuilder.buildLinearVotingContractSetupTx(),
    azoriusTxBuilder.buildEnableAzoriusModuleTx(),
    azoriusTxBuilder.buildAddAzoriusContractAsOwnerTx(),
    azoriusTxBuilder.buildRemoveMultiSendOwnerTx(),
  ];
  console.log("Internal safe txs created");

  txs.push(azoriusTxBuilder.buildDeployStrategyTx());
  txs.push(azoriusTxBuilder.buildDeployAzoriusTx());
  txs.push(
    azoriusTxBuilder.buildExecInternalSafeTx(
      azoriusTxBuilder.signatures(),
      internalTxs
    )
  );
  const encodedTx = encodeMultiSend(txs);

  //
  // Execute all transactions via multisend
  const allTxsMultisendTx = await multisendContract.multiSend(encodedTx, {
    gasLimit: 5000000,
  });
  allTxsMultisendTx.wait();
  console.timeEnd(`Multisend tx executed ${allTxsMultisendTx.hash}`);

  logDcntDaoTxt();
  console.table({ daoAddress: predictedSafeContract.address });

  //
  // Transfer remaining unlocked DCNT supply to the DAO
  // This is equal to total DCNT supply minus tokens held in lock contract
  const amountToTransfer = utils
    .parseEther(decentDAOConfig.initialSupply)
    .sub(totalLockedAmount);
  const tokenTransfer = await dcntTokenContract.transfer(
    predictedSafeContract.address,
    amountToTransfer
  );
  await tokenTransfer.wait();

  console.log("DCNT Tokens transferred to Decent DAO:");
  console.table({
    amountToTransfer: ethers.utils.formatEther(amountToTransfer),
    hash: tokenTransfer.hash,
  });

  //
  // Transfer ownership of the DCNT Token
  // To the Decent DAO
  const transferTokenOwnership = await dcntTokenContract.transferOwnership(
    predictedSafeContract.address
  );
  await transferTokenOwnership.wait();
  console.log("DCNT Token ownership transferred to Decent DAO:");
  console.table({
    dao: predictedSafeContract.address,
    hash: transferTokenOwnership.hash,
  });
  logEthereumLogo();
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
