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
    linearVotingMasterCopyContract,
  } = await getMasterCopies();
  const [deployer] = await ethers.getSigners();
  const { dcntTokenContract, lockReleaseContract } = await deployDecentToken(
    deployer
  );
  console.log("Decent token deployed");
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
  const tx = {
    to: multisendContract.address,
    data: encodedTx,
    gasLimit: 5000000,
  };

  const execution = await deployer.sendTransaction(tx);
  execution.wait();
  console.log("DAO created", predictedSafeContract.address);
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
