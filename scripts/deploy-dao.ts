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
  const [predictedGnosisSafeAddress, safeTx] = await getSafeData(
    multisendContract
  );
  const predictedSafeContract = (await ethers.getContractAt(
    GnosisSafeFactory.abi,
    predictedGnosisSafeAddress
  )) as GnosisSafe;

  const {
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
  } = await getMasterCopies();

  const { dcntTokenContract, lockReleaseContract } = await deployDecentToken();

  const azoriusTxBuilder = new AzoriusTxBuilder(
    predictedSafeContract,
    dcntTokenContract,
    lockReleaseContract,
    multisendContract,
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract
  );

  const txs = [safeTx];
  const internalTxs = [
    azoriusTxBuilder.buildUpdateDAONameTx(),
    azoriusTxBuilder.buildUpdateDAOSnapshotURLTx(),
    azoriusTxBuilder.buildLinearVotingContractSetupTx(),
    azoriusTxBuilder.buildEnableAzoriusModuleTx(),
    azoriusTxBuilder.buildAddAzoriusContractAsOwnerTx(),
    azoriusTxBuilder.buildRemoveMultiSendOwnerTx(),
  ];

  txs.push(azoriusTxBuilder.buildDeployAzoriusTx());
  txs.push(
    azoriusTxBuilder.buildExecInternalSafeTx(
      azoriusTxBuilder.signatures(),
      internalTxs
    )
  );
  const encodedTx = encodeMultiSend(txs);
  const execution = await multisendContract.executeTransaction(encodedTx);
  execution.wait();
  console.log("DAO created", predictedSafeContract.address);
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
