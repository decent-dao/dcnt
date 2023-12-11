import { AbiCoder, Contract, ethers } from "ethers";
import { BaseTxBuilder } from "./BaseTxBuilder";
import {
  Azorius,
  LinearERC20Voting,
  FractalRegistry,
  GnosisSafe,
  KeyValuePairs,
  ModuleProxyFactory as IModuleProxyFractory,
} from "@fractal-framework/fractal-contracts";
import { DecentDAOConfig, SafeTransaction } from "./types";
import {
  getRandomBytes,
  buildContractCall,
  generateContractByteCodeLinear,
  generateSalt,
} from "./utils";
import { DCNTToken, LockRelease } from "../typechain-types";

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
    decentDAOConfig: DecentDAOConfig,
    predictedSafeContract: GnosisSafe,
    dcntTokenContract: DCNTToken,
    lockReleaseContract: LockRelease,
    multiSendContract: Contract,
    zodiacModuleProxyFactoryContract: IModuleProxyFractory,
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
      linearVotingMasterCopyContract,
      decentDAOConfig
    );
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();
  }

  public async setup() {
    await this.setPredictedStrategyAddress();
    await this.setPredictedAzoriusAddress();
    this.setContracts();
  }

  public async buildLinearVotingContractSetupTx(): Promise<SafeTransaction> {
    if (!this.linearVotingContract)
      throw new Error("lockReleaseContract contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");

    return buildContractCall(
      this.linearVotingContract as unknown as Contract,
      "setAzorius", // contract function name
      [await this.azoriusContract.getAddress()],
      0,
      false
    );
  }

  public async buildEnableAzoriusModuleTx(): Promise<SafeTransaction> {
    if (!this.predictedSafeContract) throw new Error("Safe contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");
    return buildContractCall(
      this.predictedSafeContract as unknown as Contract,
      "enableModule",
      [await this.azoriusContract.getAddress()],
      0,
      false
    );
  }

  public async buildSwapOwnersTx(): Promise<SafeTransaction> {
    if (!this.predictedSafeContract) throw new Error("Safe contract not set");
    if (!this.azoriusContract) throw new Error("Azorius contract not set");
    return buildContractCall(
      this.predictedSafeContract as unknown as Contract,
      "swapOwner",
      [
        "0x0000000000000000000000000000000000000001",
        await this.multiSendContract.getAddress(),
        "0x000000000000000000000000000000000f2ac7a1",
      ],
      0,
      false
    );
  }

  public async buildDeployAzoriusTx(): Promise<SafeTransaction> {
    return buildContractCall(
      this.zodiacModuleProxyFactoryContract as unknown as Contract,
      "deployModule",
      [
        await this.fractalAzoriusMasterCopyContract.getAddress(),
        this.encodedSetupAzoriusData,
        this.azoriusNonce,
      ],
      0,
      false
    );
  }

  public async signatures(): Promise<string> {
    return (
      "0x000000000000000000000000" +
      (await this.multiSendContract.getAddress()).slice(2) +
      "0000000000000000000000000000000000000000000000000000000000000000" +
      "01"
    );
  };

  public async buildDeployStrategyTx(): Promise<SafeTransaction> {
    return buildContractCall(
      this.zodiacModuleProxyFactoryContract as unknown as Contract,
      "deployModule",
      [
        await this.linearVotingMasterCopyContract.getAddress(),
        this.encodedStrategySetupData,
        this.strategyNonce,
      ],
      0,
      false
    );
  }

  private async setPredictedStrategyAddress() {
    const coder = AbiCoder.defaultAbiCoder()
    const encodedStrategyInitParams = coder.encode(
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
        await this.predictedSafeContract.getAddress(), // owner
        await this.lockReleaseContract.getAddress(), // governance
        "0x0000000000000000000000000000000000000001", // Azorius module
        this.decentDAOConfig.votingPeriodBlocks, // voting period (blocks)
        this.decentDAOConfig.proposalRequiredWeightTokens, // proposer weight, how much is needed to create a proposal.
        this.decentDAOConfig.quorumBasisNumerator, // quorom numerator, denominator is 1,000,000
        this.decentDAOConfig.votingBasisNumerator, // basis numerator, denominator is 1,000,000
      ]
    );

    const encodedStrategySetupData =
      this.linearVotingMasterCopyContract.interface.encodeFunctionData(
        "setUp",
        [encodedStrategyInitParams]
      );

    const strategyByteCodeLinear = generateContractByteCodeLinear(
      (await this.linearVotingMasterCopyContract.getAddress()).slice(2)
    );

    const strategySalt = ethers.solidityPackedKeccak256(
      ["bytes32", "uint256"],
      [
        ethers.solidityPackedKeccak256(["bytes"], [encodedStrategySetupData]),
        this.strategyNonce,
      ]
    );

    this.encodedStrategySetupData = encodedStrategySetupData;

    this.predictedStrategyAddress = ethers.getCreate2Address(
      await this.zodiacModuleProxyFactoryContract.getAddress(),
      strategySalt,
      ethers.solidityPackedKeccak256(["bytes"], [strategyByteCodeLinear])
    );
  }

  private async setPredictedAzoriusAddress() {
    const coder = AbiCoder.defaultAbiCoder();
    const encodedInitAzoriusData = coder.encode(
      ["address", "address", "address", "address[]", "uint32", "uint32"],
      [
        await this.predictedSafeContract.getAddress(),
        await this.predictedSafeContract.getAddress(),
        await this.predictedSafeContract.getAddress(),
        [this.predictedStrategyAddress],
        this.decentDAOConfig.timeLockPeriodBlocks, // timelock period in blocks
        this.decentDAOConfig.executionPeriodBlocks, // execution period in blocks
      ]
    );
    
    const encodedSetupAzoriusData =
      this.fractalAzoriusMasterCopyContract.interface.encodeFunctionData(
        "setUp",
        [encodedInitAzoriusData]
      );

      
    const azoriusByteCodeLinear = generateContractByteCodeLinear(
      (await this.fractalAzoriusMasterCopyContract.getAddress()).slice(2)
    );
    const azoriusSalt = generateSalt(
      encodedSetupAzoriusData,
      this.azoriusNonce
    );

    this.encodedSetupAzoriusData = encodedSetupAzoriusData;
    this.predictedAzoriusAddress = ethers.getCreate2Address(
      await this.zodiacModuleProxyFactoryContract.getAddress(),
      azoriusSalt,
      ethers.solidityPackedKeccak256(["bytes"], [azoriusByteCodeLinear])
    );
  }

  private setContracts() {
    if (!this.predictedAzoriusAddress)
      throw new Error("Azorius address not set");
    if (!this.predictedStrategyAddress)
      throw new Error("Strategy address not set");

    this.azoriusContract = this.fractalAzoriusMasterCopyContract.attach(
      this.predictedAzoriusAddress
    );
    this.linearVotingContract = this.linearVotingMasterCopyContract.attach(
      this.predictedStrategyAddress
    );
  }
}
