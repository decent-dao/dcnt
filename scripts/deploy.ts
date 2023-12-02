import { AzoriusTxBuilder } from "../DaoBuilder/AzoriusTxBuilder";
import { ethers } from "hardhat";

import { getMasterCopies, getSafeData } from "../DaoBuilder/daoUtils";
import { deployDCNTAndLockRelease } from "../DaoBuilder/dcntTokenDeploy";
import { encodeMultiSend } from "../DaoBuilder/utils";
import { decentDAOConfig } from "../config/dcntDAOConfig";
import { SafeTransaction } from "../DaoBuilder/types";

async function createDAO() {
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
  const [deployer] = await ethers.getSigners();
  const { dcntTokenContract, lockReleaseContract, totalLockedAmount } =
    await deployDCNTAndLockRelease(deployer, decentDAOConfig);

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
  const allTxsMultisendTx = await multisendContract.multiSend(encodedTx);
  await allTxsMultisendTx.wait();

  //
  // Transfer remaining unlocked DCNT supply to the DAO
  // This is equal to total DCNT supply minus tokens held in lock contract
  const amountToTransfer = ethers.utils
    .parseEther(decentDAOConfig.initialSupply)
    .sub(totalLockedAmount);
  const tokenTransfer = await dcntTokenContract.transfer(
    predictedSafeContract.address,
    amountToTransfer
  );
  await tokenTransfer.wait();

  //
  // Assign MINT ability of the DCNT Token to the Decent DAO
  const transferTokenMintOwnership = await dcntTokenContract.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINT_ROLE")),
    predictedSafeContract.address
  );
  await transferTokenMintOwnership.wait();

  // Assign UPDATE_MINT_AUTHORIZATION_ROLE ability of the DCNT Token to the Decent DAO
  const transferTokenUpdateMintOwnership = await dcntTokenContract.grantRole(
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("UPDATE_MINT_AUTHORIZATION_ROLE")
    ),
    predictedSafeContract.address
  );
  await transferTokenUpdateMintOwnership.wait();

  // Revoke DEFAULT_ADMIN_ROLE of the DCNT Token from the deployer
  const renounceMintFromDeployer = await dcntTokenContract.renounceRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")),
    deployer.address
  );
  await renounceMintFromDeployer.wait();
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
