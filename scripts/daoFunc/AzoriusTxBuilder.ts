import { Contract } from "ethers";
import { LockRelease } from "./../../typechain/LockRelease.d";
import { DCNTToken } from "./../../typechain/DCNTToken.d";
import { BaseTxBuilder } from "./BaseTxBuilder";
import {
  Azorius,
  Azorius__factory as AzoriusFactory,
  FractalRegistry,
  GnosisSafe,
  KeyValuePairs,
  ModuleProxyFactory as ModuleProxyFractory,
} from "@fractal-framework/fractal-contracts";
import {
  defaultAbiCoder,
  getCreate2Address,
  solidityKeccak256,
} from "ethers/lib/utils";
import { SafeTransaction } from "./types";

import {
  getRandomBytes,
  buildContractCall,
  generateContractByteCodeLinear,
  generateSalt,
} from "./utils";

export class AzoriusTxBuilder extends BaseTxBuilder {
  private encodedSetupAzoriusData: string | undefined;

  private predictedAzoriusAddress: string | undefined;

  public azoriusContract: Azorius | undefined;

  private azoriusNonce: string;

  constructor(
    predictedSafeContract: GnosisSafe,
    dcntTokenContract: DCNTToken,
    lockReleaseContract: LockRelease,
    multiSendContract: Contract,
    zodiacModuleProxyFactoryContract: ModuleProxyFractory,
    fractalAzoriusMasterCopyContract: Azorius,
    fractalRegistryContract: FractalRegistry,
    keyValuePairsContract: KeyValuePairs
  ) {
    super(
      predictedSafeContract,
      dcntTokenContract,
      lockReleaseContract,
      multiSendContract,
      zodiacModuleProxyFactoryContract,
      fractalAzoriusMasterCopyContract,
      fractalRegistryContract,
      keyValuePairsContract
    );
    this.azoriusNonce = getRandomBytes();
    this.setPredictedAzoriusAddress();
    this.setContracts();
  }

  public buildRemoveOwners(owners: string[]): SafeTransaction[] {
    if (!this.predictedSafeContract) throw new Error("Safe contract not set");
    if (!this.multiSendContract) throw new Error("MultiSend contract not set");

    const removeOwnerTxs = owners.map((owner) =>
      buildContractCall(
        this.predictedSafeContract,
        "removeOwner",
        [this.multiSendContract.address, owner, 1],
        0,
        false
      )
    );
    return removeOwnerTxs;
  }

  public buildLinearVotingContractSetupTx(): SafeTransaction {
    if (!this.lockReleaseContract)
      throw new Error("lockReleaseContract contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");
    return buildContractCall(
      this.lockReleaseContract,
      "setAzorius", // contract function name
      [this.azoriusContract.address],
      0,
      false
    );
  }

  public buildEnableAzoriusModuleTx(): SafeTransaction {
    if (!this.predictedSafeContract) throw new Error("Safe contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");
    return buildContractCall(
      this.predictedSafeContract,
      "enableModule",
      [this.azoriusContract.address],
      0,
      false
    );
  }

  public buildAddAzoriusContractAsOwnerTx(): SafeTransaction {
    if (!this.predictedSafeContract) throw new Error("Safe contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");
    return buildContractCall(
      this.predictedSafeContract,
      "addOwnerWithThreshold",
      [this.azoriusContract.address, 1],
      0,
      false
    );
  }

  public buildRemoveMultiSendOwnerTx(): SafeTransaction {
    if (!this.predictedSafeContract) throw new Error("Safe contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");
    return buildContractCall(
      this.predictedSafeContract,
      "removeOwner",
      [this.azoriusContract.address, this.multiSendContract.address, 1],
      0,
      false
    );
  }

  public buildDeployAzoriusTx(): SafeTransaction {
    return buildContractCall(
      this.zodiacModuleProxyFactoryContract,
      "deployModule",
      [
        this.fractalAzoriusMasterCopyContract.address,
        this.encodedSetupAzoriusData,
        this.azoriusNonce,
      ],
      0,
      false
    );
  }

  public signatures = (): string => {
    return (
      "0x000000000000000000000000" +
      this.multiSendContract.address.slice(2) +
      "0000000000000000000000000000000000000000000000000000000000000000" +
      "01"
    );
  };

  private setPredictedAzoriusAddress() {
    const encodedInitAzoriusData = defaultAbiCoder.encode(
      ["address", "address", "address", "address[]", "uint32", "uint32"],
      [
        this.predictedSafeContract.address,
        this.predictedSafeContract.address,
        this.predictedSafeContract.address,
        [this.lockReleaseContract.address],
        0, // timelock period in blocks
        0, // execution period in blocks
      ]
    );

    const encodedSetupAzoriusData =
      this.fractalAzoriusMasterCopyContract.interface.encodeFunctionData(
        "setUp",
        [encodedInitAzoriusData]
      );

    const azoriusByteCodeLinear = generateContractByteCodeLinear(
      this.fractalAzoriusMasterCopyContract.address.slice(2)
    );
    const azoriusSalt = generateSalt(
      encodedSetupAzoriusData,
      this.azoriusNonce
    );

    this.encodedSetupAzoriusData = encodedSetupAzoriusData;
    this.predictedAzoriusAddress = getCreate2Address(
      this.zodiacModuleProxyFactoryContract.address,
      azoriusSalt,
      solidityKeccak256(["bytes"], [azoriusByteCodeLinear])
    );
  }

  private setContracts() {
    if (!this.frame) throw new Error("Frame not set");
    if (!this.predictedAzoriusAddress)
      throw new Error("Azorius address not set");

    this.azoriusContract = AzoriusFactory.connect(
      this.predictedAzoriusAddress,
      this.frame
    );
  }
}
