import { SafeTransaction } from "./types";
import { buildContractCall } from "./utils";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import {
  GnosisSafe__factory as GnosisSafeFactory,
  Azorius as IAzorius,
  ModuleProxyFactory as IModuleProxyFractory,
  KeyValuePairs as IKeyValuePairs,
  FractalRegistry as IFractalRegistry,
} from "@fractal-framework/fractal-contracts";
import ModuleProxyFactory, {
  abi as moduleProxyFractoryABI,
  address as moduleProxyFactoryAddress,
} from "@fractal-framework/fractal-contracts/deployments/goerli/ModuleProxyFactory.json";
import { getCreate2Address, solidityKeccak256 } from "ethers/lib/utils";
import { getProxyFactoryDeployment } from "@safe-global/safe-deployments";
import Azorius from "@fractal-framework/fractal-contracts/deployments/goerli/Azorius.json";
import FractalRegistry from "@fractal-framework/fractal-contracts/deployments/goerli/FractalRegistry.json";
import KeyValuePairs from "@fractal-framework/fractal-contracts/deployments/goerli/KeyValuePairs.json";
const { AddressZero, HashZero } = ethers.constants;

export const CHAIN_ID = 5;
export const SAFE_VERSION = "1.3.0";

export const getMasterCopies = async (): Promise<{
  zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  fractalAzoriusMasterCopyContract: IAzorius;
  fractalRegistryContract: IFractalRegistry;
  keyValuePairContract: IKeyValuePairs;
}> => {
  const zodiacModuleProxyFactoryContract = (await ethers.getContractAt(
    ModuleProxyFactory.abi,
    ModuleProxyFactory.address
  )) as IModuleProxyFractory;
  // @todo update DCNT Token Deployment

  const fractalAzoriusMasterCopyContract = (await ethers.getContractAt(
    Azorius.abi,
    Azorius.address
  )) as IAzorius;
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

  const saltNum = BigNumber.from(
    "0x856d90216588f9ffc124d1480a440e1c012c7a816952bc968d737bae5d4e139c"
  );

  const gnosisSafeFactoryContract = await ethers.getContractAt(
    GnosisSafeFactory.abi,
    gnosisFactory.defaultAddress
  );

  const gnosisSafeSingletonContract = await ethers.getContractAt(
    moduleProxyFractoryABI,
    moduleProxyFactoryAddress
  );

  const signers = [multiSendContract.defaultAddress];

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
