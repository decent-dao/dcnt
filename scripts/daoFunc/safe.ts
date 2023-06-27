import { SafeTransaction } from "./types";
import { buildContractCall, getRandomBytes } from "./utils";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import {
  GnosisSafeProxyFactory__factory as GnosisSafeFactory,
  Azorius as IAzorius,
  ModuleProxyFactory as IModuleProxyFractory,
  LinearERC20Voting as ILinearERC20Voting,
  KeyValuePairs as IKeyValuePairs,
  FractalRegistry as IFractalRegistry,
  GnosisSafe,
  GnosisSafeProxyFactory,
} from "@fractal-framework/fractal-contracts";
import ModuleProxyFactory from "@fractal-framework/fractal-contracts/deployments/goerli/ModuleProxyFactory.json";
import { getCreate2Address, solidityKeccak256 } from "ethers/lib/utils";
import {
  getProxyFactoryDeployment,
  getSafeSingletonDeployment,
} from "@safe-global/safe-deployments";
import Azorius from "@fractal-framework/fractal-contracts/deployments/goerli/Azorius.json";
import FractalRegistry from "@fractal-framework/fractal-contracts/deployments/goerli/FractalRegistry.json";
import KeyValuePairs from "@fractal-framework/fractal-contracts/deployments/goerli/KeyValuePairs.json";
import LinearERC20Voting from "@fractal-framework/fractal-contracts/deployments/goerli/LinearERC20Voting.json";
const { AddressZero, HashZero } = ethers.constants;
export const CHAIN_ID = 5;
export const SAFE_VERSION = "1.3.0";

export const getMasterCopies = async (): Promise<{
  zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  fractalAzoriusMasterCopyContract: IAzorius;
  fractalRegistryContract: IFractalRegistry;
  linearVotingMasterCopyContract: ILinearERC20Voting;
  keyValuePairContract: IKeyValuePairs;
}> => {
  const zodiacModuleProxyFactoryContract = (await ethers.getContractAt(
    ModuleProxyFactory.abi,
    ModuleProxyFactory.address
  )) as IModuleProxyFractory;

  const fractalAzoriusMasterCopyContract = (await ethers.getContractAt(
    Azorius.abi,
    Azorius.address
  )) as IAzorius;

  const linearVotingMasterCopyContract = (await ethers.getContractAt(
    LinearERC20Voting.abi,
    LinearERC20Voting.address
  )) as ILinearERC20Voting;

  const fractalRegistryContract = (await ethers.getContractAt(
    FractalRegistry.abi,
    FractalRegistry.address
  )) as IFractalRegistry;

  const keyValuePairContract = (await ethers.getContractAt(
    KeyValuePairs.abi,
    KeyValuePairs.address
  )) as IKeyValuePairs;

  return {
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
    linearVotingMasterCopyContract,
  };
};

export const getSafeData = async (
  multiSendContract: Contract
): Promise<[string, SafeTransaction]> => {
  const gnosisFactory = getProxyFactoryDeployment({
    version: SAFE_VERSION,
    network: CHAIN_ID.toString(),
  });
  if (!gnosisFactory) throw new Error("Gnosis factory not found");

  const saltNum = getRandomBytes();

  const gnosisSafeFactoryContract = (await ethers.getContractAt(
    GnosisSafeFactory.abi,
    gnosisFactory.defaultAddress
  )) as GnosisSafeProxyFactory;

  const gnosisSingleton = getSafeSingletonDeployment({
    version: SAFE_VERSION,
    network: CHAIN_ID.toString(),
  });

  if (!gnosisSingleton) throw new Error("Gnosis singleton not found");

  const gnosisSafeSingletonContract = (await ethers.getContractAt(
    gnosisSingleton.abi,
    gnosisSingleton.defaultAddress
  )) as GnosisSafe;

  const signers = [multiSendContract.address];

  const createGnosisCalldata =
    gnosisSafeSingletonContract.interface.encodeFunctionData("setup", [
      signers,
      1, // Threshold
      AddressZero,
      HashZero,
      AddressZero,
      AddressZero,
      0,
      AddressZero,
    ]);

  const predictedGnosisSafeAddress = getCreate2Address(
    gnosisSafeFactoryContract.address,
    solidityKeccak256(
      ["bytes", "uint256"],
      [solidityKeccak256(["bytes"], [createGnosisCalldata]), saltNum]
    ),
    solidityKeccak256(
      ["bytes", "uint256"],
      [
        await gnosisSafeFactoryContract.proxyCreationCode(),
        gnosisSafeSingletonContract.address,
      ]
    )
  );

  const createSafeTx = buildContractCall(
    gnosisSafeFactoryContract,
    "createProxyWithNonce",
    [gnosisSafeSingletonContract.address, createGnosisCalldata, saltNum],
    0,
    false
  );

  return [predictedGnosisSafeAddress, createSafeTx];
};
