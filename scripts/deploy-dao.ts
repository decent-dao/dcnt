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
} from "./daoFunc/safe";
import { getMultiSendCallOnlyDeployment } from "@safe-global/safe-deployments";
import { deployDecentToken } from "./daoFunc/mint";
import { encodeMultiSend } from "./daoFunc/utils";

async function createDAO() {
  const singletonContract = getMultiSendCallOnlyDeployment({
    version: SAFE_VERSION,
    network: CHAIN_ID.toString(),
  });
  if (!singletonContract) throw new Error("Multisend contract not found");

  const multisendContract = await ethers.getContractAt(
    singletonContract.abi,
    singletonContract.defaultAddress
  );

  console.log("Multisend contract fetched");
  console.table({
    multisendContract: multisendContract.address,
  });

  const [predictedGnosisSafeAddress, safeTx] = await getSafeData(
    multisendContract
  );

  const predictedSafeContract = (await ethers.getContractAt(
    GnosisSafeFactory.abi,
    predictedGnosisSafeAddress
  )) as GnosisSafe;

  console.log("Safe contract fetched");
  console.table({
    predictedSafeContract: predictedSafeContract.address,
  });

  const {
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
    linearVotingMasterCopyContract,
  } = await getMasterCopies();

  console.log("Master copies fetched");
  console.table({
    zodiacModuleProxyFactoryContract: zodiacModuleProxyFactoryContract.address,
    fractalAzoriusMasterCopyContract: fractalAzoriusMasterCopyContract.address,
    fractalRegistryContract: fractalRegistryContract.address,
    keyValuePairContract: keyValuePairContract.address,
    linearVotingMasterCopyContract: linearVotingMasterCopyContract.address,
  });

  const [deployer] = await ethers.getSigners();
  const { dcntTokenContract, lockReleaseContract } = await deployDecentToken(
    deployer
  );

  console.log("Decent token deployed");
  console.table({
    dcntTokenContract: dcntTokenContract.address,
    lockReleaseContract: lockReleaseContract.address,
  });

  const azoriusTxBuilder = new AzoriusTxBuilder(
    deployer,
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

  const txs = [safeTx];
  const internalTxs = [
    azoriusTxBuilder.buildUpdateDAONameTx(),
    // azoriusTxBuilder.buildUpdateDAOSnapshotURLTx(),
    azoriusTxBuilder.buildLinearVotingContractSetupTx(),
    azoriusTxBuilder.buildEnableAzoriusModuleTx(),
    azoriusTxBuilder.buildAddAzoriusContractAsOwnerTx(),
    azoriusTxBuilder.buildRemoveMultiSendOwnerTx(),
  ];
  console.log("Internal txs created");

  txs.push(azoriusTxBuilder.buildDeployAzoriusTx());
  txs.push(
    azoriusTxBuilder.buildExecInternalSafeTx(
      azoriusTxBuilder.signatures(),
      internalTxs
    )
  );
  console.log("Tx created");

  const encodedTx = encodeMultiSend(txs);

  const execution = await multisendContract.multiSend(encodedTx);
  execution.wait();
  console.log("Tx sent", execution.hash);
  console.log("DAO created", predictedSafeContract.address);
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
