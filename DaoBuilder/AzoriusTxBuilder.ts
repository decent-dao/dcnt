import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { BaseTxBuilder } from "./BaseTxBuilder";
import {
  Azorius,
  LinearERC20Voting,
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
import { decentDAOConfig } from "./dcntDAOConfig";
import { DCNTToken, LockRelease } from "../typechain";

export class AzoriusTxBuilder extends BaseTxBuilder {
  private encodedSetupAzoriusData: string | undefined;
  private encodedStrategySetupData: string | undefined;

  private predictedStrategyAddress: string | undefined;
  private predictedAzoriusAddress: string | undefined;

  public linearVotingContract: LinearERC20Voting | undefined;
  public azoriusContract: Azorius | undefined;

  private azoriusNonce: string;
  private strategyNonce: string;

  constructor(
    private deployer: SignerWithAddress,
    predictedSafeContract: GnosisSafe,
    dcntTokenContract: DCNTToken,
    lockReleaseContract: LockRelease,
    multiSendContract: Contract,
    zodiacModuleProxyFactoryContract: ModuleProxyFractory,
    fractalAzoriusMasterCopyContract: Azorius,
    fractalRegistryContract: FractalRegistry,
    keyValuePairsContract: KeyValuePairs,
    linearVotingMasterCopyContract: LinearERC20Voting
  ) {
    super(
      predictedSafeContract,
      dcntTokenContract,
      lockReleaseContract,
      multiSendContract,
      zodiacModuleProxyFactoryContract,
      fractalAzoriusMasterCopyContract,
      fractalRegistryContract,
      keyValuePairsContract,
      linearVotingMasterCopyContract
    );
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();

    this.setPredictedStrategyAddress();
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
    if (!this.linearVotingContract)
      throw new Error("lockReleaseContract contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");

    return buildContractCall(
      this.linearVotingContract,
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

  public buildDeployStrategyTx(): SafeTransaction {
    return buildContractCall(
      this.zodiacModuleProxyFactoryContract,
      "deployModule",
      [
        this.linearVotingMasterCopyContract.address,
        this.encodedStrategySetupData,
        this.strategyNonce,
      ],
      0,
      false
    );
  }

  private setPredictedStrategyAddress() {
    console.log("Setting predicted strategy address");
    console.table({
      salt: this.strategyNonce,
      masterCopy: this.linearVotingMasterCopyContract.address,
      safeAddress: this.predictedSafeContract.address,
      proxyFactory: this.zodiacModuleProxyFactoryContract.address,
      lockRelease: this.lockReleaseContract.address,
    });
    const encodedStrategyInitParams = defaultAbiCoder.encode(
      [
        "address",
        "address",
        "address",
        "uint32",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        this.predictedSafeContract.address, // owner
        this.lockReleaseContract.address, // governance
        "0x0000000000000000000000000000000000000001", // Azorius module
        decentDAOConfig.votingPeriod, // voting period (blocks)
        decentDAOConfig.proposalRequiredWeight, // proposer weight, how much is needed to create a proposal.
        decentDAOConfig.quorum, // quorom numerator, denominator is 1,000,000, so quorum percentage is 50%
        decentDAOConfig.votingBasis, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
      ]
    );

    const encodedStrategySetupData =
      this.linearVotingMasterCopyContract.interface.encodeFunctionData(
        "setUp",
        [encodedStrategyInitParams]
      );

    const strategyByteCodeLinear = generateContractByteCodeLinear(
      this.linearVotingMasterCopyContract.address.slice(2)
    );

    const strategySalt = solidityKeccak256(
      ["bytes32", "uint256"],
      [
        solidityKeccak256(["bytes"], [encodedStrategySetupData]),
        this.strategyNonce,
      ]
    );

    this.encodedStrategySetupData = encodedStrategySetupData;

    this.predictedStrategyAddress = getCreate2Address(
      this.zodiacModuleProxyFactoryContract.address,
      strategySalt,
      solidityKeccak256(["bytes"], [strategyByteCodeLinear])
    );
  }

  private setPredictedAzoriusAddress() {
    const encodedInitAzoriusData = defaultAbiCoder.encode(
      ["address", "address", "address", "address[]", "uint32", "uint32"],
      [
        this.predictedSafeContract.address,
        this.predictedSafeContract.address,
        this.predictedSafeContract.address,
        [this.predictedStrategyAddress],
        decentDAOConfig.timeLockPeriod, // timelock period in blocks
        decentDAOConfig.executionPeriod, // execution period in blocks
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
    if (!this.predictedAzoriusAddress)
      throw new Error("Azorius address not set");
    if (!this.predictedStrategyAddress)
      throw new Error("Strategy address not set");

    console.log("Contracts set");
    console.table({
      azorius: this.predictedAzoriusAddress,
      strategy: this.predictedStrategyAddress,
    });

    this.azoriusContract = this.fractalAzoriusMasterCopyContract.attach(
      this.predictedAzoriusAddress
    );
    this.linearVotingContract = this.linearVotingMasterCopyContract.attach(
      this.predictedStrategyAddress
    );
  }
}
