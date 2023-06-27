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

  const { zodiacModuleProxyFactoryContract, fractalAzoriusMasterCopyContract } =
    await getMasterCopies();

  const { dcntTokenContract, lockReleaseContract } = await deployDecentToken();

  const azoriusBuild = new AzoriusTxBuilder(
    predictedSafeContract,
    dcntTokenContract,
    lockReleaseContract,
    multisendContract,
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract
  );

  const txs = [safeTx];
  const internalTxs = [];

  // ?@todo snapshot url?
  // @todo update daoName
  // @todo linear 'setAzorius' tx
}

createDAO()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
