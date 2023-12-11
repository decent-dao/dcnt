/* eslint-disable @typescript-eslint/no-explicit-any */
import { SafeTransaction } from "./types";
import { buildContractCall, getRandomBytes } from "./utils";
import { Contract, Signer } from "ethers";
import { ethers, network } from "hardhat";
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
import {
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getCompatibilityFallbackHandlerDeployment,
} from "@safe-global/safe-deployments";

export const SAFE_VERSION = "1.3.0";
import MultiSend from "@safe-global/safe-deployments/dist/assets/v1.3.0/multi_send_call_only.json";
const MultiSendABI = MultiSend.abi;
const { ZeroAddress, ZeroHash } = ethers;

/* eslint-disable node/no-unsupported-features/es-syntax */
async function getFractalContractAddressesByNetworkName() {
  const contractsPath = `@fractal-framework/fractal-contracts/deployments/${network.name}`;

  const Azorius = await import(`${contractsPath}/Azorius.json`);
  const FractalRegistry = await import(`${contractsPath}/FractalRegistry.json`);
  const KeyValuePairs = await import(`${contractsPath}/KeyValuePairs.json`);
  const LinearERC20Voting = await import(
    `${contractsPath}/LinearERC20Voting.json`
  );
  const ModuleProxyFactory = await import(
    `${contractsPath}/ModuleProxyFactory.json`
  );
  return {
    Azorius,
    FractalRegistry,
    KeyValuePairs,
    LinearERC20Voting,
    ModuleProxyFactory,
  };
}
/* eslint-enable node/no-unsupported-features/es-syntax */

export const getMasterCopies = async (
  theDecentFoundation: Signer,
): Promise<{
  zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  fractalAzoriusMasterCopyContract: IAzorius;
  fractalRegistryContract: IFractalRegistry;
  linearVotingMasterCopyContract: ILinearERC20Voting;
  keyValuePairContract: IKeyValuePairs;
  multisendContract: Contract;
}> => {
  if (!network.config.chainId) {
    throw Error(`No chain ID found for: ${network.name}`);
  }

  const {
    Azorius,
    FractalRegistry,
    KeyValuePairs,
    LinearERC20Voting,
    ModuleProxyFactory,
  } = await getFractalContractAddressesByNetworkName();

  const zodiacModuleProxyFactoryContract = (await ethers.getContractAt(
    ModuleProxyFactory.abi as Record<string, any>[],
    ModuleProxyFactory.address
  )) as unknown as IModuleProxyFractory;

  const fractalAzoriusMasterCopyContract = (await ethers.getContractAt(
    Azorius.abi as Record<string, any>[],
    Azorius.address
  )) as unknown as IAzorius;

  const linearVotingMasterCopyContract = (await ethers.getContractAt(
    LinearERC20Voting.abi as Record<string, any>[],
    LinearERC20Voting.address
  )) as unknown as ILinearERC20Voting;

  const fractalRegistryContract = (await ethers.getContractAt(
    FractalRegistry.abi as Record<string, any>[],
    FractalRegistry.address
  )) as unknown as IFractalRegistry;

  const keyValuePairContract = (await ethers.getContractAt(
    KeyValuePairs.abi as Record<string, any>[],
    KeyValuePairs.address
  )) as unknown as IKeyValuePairs;

  const multisendSingletonDeployment = getMultiSendCallOnlyDeployment({
    version: SAFE_VERSION,
    network: network.config.chainId.toString(),
  });
  if (!multisendSingletonDeployment)
    throw new Error("Multisend contract not found");

  const multisendContract = await ethers.getContractAt(
    multisendSingletonDeployment.abi,
    multisendSingletonDeployment.defaultAddress
  );

  return {
    multisendContract,
    zodiacModuleProxyFactoryContract,
    fractalAzoriusMasterCopyContract,
    fractalRegistryContract,
    keyValuePairContract,
    linearVotingMasterCopyContract,
  };
};

export const getSafeData = async (
  multiSendContract: Contract
): Promise<{
  predictedSafeContract: GnosisSafe;
  createSafeTx: SafeTransaction;
}> => {
  if (!network.config.chainId) {
    throw Error(`No chain ID found for: ${network.name}`);
  }

  const gnosisFactory = getProxyFactoryDeployment({
    version: SAFE_VERSION,
    network: network.config.chainId.toString(),
  });
  if (!gnosisFactory) throw new Error("Gnosis factory not found");

  const saltNum = getRandomBytes();

  const gnosisSafeFactoryContract = (await ethers.getContractAt(
    GnosisSafeFactory.abi,
    gnosisFactory.defaultAddress
  )) as unknown as GnosisSafeProxyFactory;

  const gnosisSingleton = getSafeL2SingletonDeployment({
    version: SAFE_VERSION,
    network: network.config.chainId.toString(),
  });

  if (!gnosisSingleton) throw new Error("Gnosis singleton not found");

  const gnosisSafeSingletonContract = (await ethers.getContractAt(
    gnosisSingleton.abi,
    gnosisSingleton.defaultAddress
  )) as unknown as GnosisSafe;

  const compatibilityFallbackHandlerSingleton =
    getCompatibilityFallbackHandlerDeployment({
      version: SAFE_VERSION,
      network: network.config.chainId.toString(),
    });

  if (!compatibilityFallbackHandlerSingleton)
    throw new Error("Compatibility Fallback Handler singleton not found");

  // multisend contract is the only signer; this is removed later
  const signers = [await multiSendContract.getAddress()];

  const createGnosisCalldata =
    gnosisSafeSingletonContract.interface.encodeFunctionData("setup", [
      signers, // owners
      1, // threshold
      ZeroAddress, // to
      ZeroHash, // data
      compatibilityFallbackHandlerSingleton.defaultAddress, // fallback handler
      ZeroAddress, // payment token
      0, // payment
      ZeroAddress, // payment receiver
    ]);

  const predictedGnosisSafeAddress = ethers.getCreate2Address(
    await gnosisSafeFactoryContract.getAddress(),
    ethers.solidityPackedKeccak256(
      ["bytes", "uint256"],
      [ethers.solidityPackedKeccak256(["bytes"], [createGnosisCalldata]), saltNum]
    ),
    ethers.solidityPackedKeccak256(
      ["bytes", "uint256"],
      [
        await gnosisSafeFactoryContract.proxyCreationCode(),
        await gnosisSafeSingletonContract.getAddress(),
      ]
    )
  );

  const createSafeTx = await buildContractCall(
    gnosisSafeFactoryContract,
    "createProxyWithNonce",
    [await gnosisSafeSingletonContract.getAddress(), createGnosisCalldata, saltNum],
    0,
    false
  );

  const predictedSafeContract = gnosisSafeSingletonContract.attach(
    predictedGnosisSafeAddress
  );

  return { predictedSafeContract, createSafeTx };
};
