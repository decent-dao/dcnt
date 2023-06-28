import { AzoriusTxBuilder } from "../DaoBuilder/AzoriusTxBuilder";
import { ethers } from "hardhat";

import { getMasterCopies, getSafeData } from "../DaoBuilder/daoUtils";
import { deployDecentToken } from "../DaoBuilder/dcntTokenDeploy";
import { encodeMultiSend } from "../DaoBuilder/utils";
import { decentDAOConfig } from "../DaoBuilder/dcntDAOConfig";
import { utils } from "ethers";

async function createDAO() {
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

  console.log("Master copies fetched");
  console.table({
    zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.address,
    fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.address,
    fractalRegistryContract: fractalRegistryContract.address,
    keyValuePairContract: keyValuePairContract.address,
    linearVotingMasterCopyContract: linearVotingMasterCopyContract.address,
    multisendContract: multisendContract.address,
  });

  // @todo update to to use frameProvider
  const [deployer] = await ethers.getSigners();
  const { dcntTokenContract, lockReleaseContract, totalLockedAmount } =
    await deployDecentToken(deployer, decentDAOConfig);

  console.log("Decent Token and Lock Release contracts deployed");
  console.table({
    dcntTokenContract: dcntTokenContract.address,
    lockReleaseContract: lockReleaseContract.address,
    totalLockedAmount: totalLockedAmount.toString(),
  });

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

  console.log("Azorius tx builder created");

  const txs = [createSafeTx];
  const internalTxs = [
    azoriusTxBuilder.buildUpdateDAONameTx(),
    // azoriusTxBuilder.buildUpdateDAOSnapshotURLTx(),
    azoriusTxBuilder.buildLinearVotingContractSetupTx(),
    azoriusTxBuilder.buildEnableAzoriusModuleTx(),
    azoriusTxBuilder.buildAddAzoriusContractAsOwnerTx(),
    azoriusTxBuilder.buildRemoveMultiSendOwnerTx(),
  ];
  console.log("Internal txs created");

  txs.push(azoriusTxBuilder.buildDeployStrategyTx());
  txs.push(azoriusTxBuilder.buildDeployAzoriusTx());
  txs.push(
    azoriusTxBuilder.buildExecInternalSafeTx(
      azoriusTxBuilder.signatures(),
      internalTxs
    )
  );
  console.log("Tx created");

  const encodedTx = encodeMultiSend(txs);

  console.time("Tx sent");
  const execution = await multisendContract.multiSend(encodedTx, {
    gasLimit: 5000000,
  });
  execution.wait();
  console.timeEnd(`tx executed ${execution.hash}`);

  console.log("DAO created", predictedSafeContract.address);

  console.log("Transfering remaining balance of DCNT to Decent DAO");
  const amountToTransfer = utils
    .parseEther(decentDAOConfig.initialSupply)
    .sub(totalLockedAmount);
  const tokenTransfer = await dcntTokenContract.transfer(
    predictedSafeContract.address,
    amountToTransfer
  );
  tokenTransfer.wait();

  console.log("Tokens transfered");
  console.table({
    amountToTransfer: amountToTransfer,
    hash: tokenTransfer.hash,
  });

  console.log("Transfering token ownership to Decent DAO");
  const transferTokenOwnership = await dcntTokenContract.transferOwnership(
    predictedSafeContract.address
  );
  transferTokenOwnership.wait();
  console.log("Token ownership transfered");
  console.table({
    dao: predictedSafeContract.address,
    hash: transferTokenOwnership.hash,
  });
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
