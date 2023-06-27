import { BaseTxBuilder } from "./BaseTxBuilder";
import {
  Azorius,
  Azorius__factory as AzoriusFactory,
  GnosisSafe,
  LinearERC20Voting,
  LinearERC20Voting__factory as LinearVotingFactory,
  VotesERC20,
  VotesERC20__factory as VotesERC20Factory,
  ModuleProxyFactory as ModuleProxyFractory,
} from "@fractal-framework/fractal-contracts";
import { BigNumber } from "ethers";
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
import { SingletonDeployment } from "@safe-global/safe-deployments";

export class AzoriusTxBuilder extends BaseTxBuilder {
  private encodedSetupTokenData: string | undefined;
  private encodedStrategySetupData: string | undefined;
  private encodedSetupAzoriusData: string | undefined;

  private predictedTokenAddress: string | undefined;
  private predictedStrategyAddress: string | undefined;
  private predictedAzoriusAddress: string | undefined;

  public azoriusContract: Azorius | undefined;
  public linearVotingContract: LinearERC20Voting | undefined;
  public votesTokenContract: VotesERC20 | undefined;

  private tokenNonce: string;
  private strategyNonce: string;
  private azoriusNonce: string;

  constructor(
    predictedSafeContract: GnosisSafe,
    multiSendContract: SingletonDeployment,
    zodiacModuleProxyFactoryContract: ModuleProxyFractory,
    linearVotingMasterCopyContract: LinearERC20Voting,
    fractalAzoriusMasterCopyContract: Azorius
  ) {
    super(
      multiSendContract,
      predictedSafeContract,
      zodiacModuleProxyFactoryContract,
      linearVotingMasterCopyContract,
      fractalAzoriusMasterCopyContract
    );
    this.tokenNonce = getRandomBytes();
    this.strategyNonce = getRandomBytes();
    this.azoriusNonce = getRandomBytes();

    this.setEncodedSetupTokenData();
    this.setPredictedTokenAddress();

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
        [this.multiSendContract.defaultAddress, owner, 1],
        0,
        false
      )
    );
    return removeOwnerTxs;
  }

  public buildLinearVotingContractSetupTx(): SafeTransaction {
    if (!this.linearVotingContract)
      throw new Error("LinearVoting contract not set");
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
      [this.azoriusContract.address, this.multiSendContract.defaultAddress, 1],
      0,
      false
    );
  }

  public buildCreateTokenTx(): SafeTransaction {
    return buildContractCall(
      this.zodiacModuleProxyFactoryContract,
      "deployModule",
      [
        this.votesTokenMasterCopyContract.address, // @todo update this to DCNT token contract
        this.encodedSetupTokenData,
        this.tokenNonce,
      ],
      0,
      false
    );
  }

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
      this.multiSendContract.defaultAddress.slice(2) +
      "0000000000000000000000000000000000000000000000000000000000000000" +
      "01"
    );
  };

  private setEncodedSetupTokenData() {
    // TODO: update to DCNT token contract
  }

  private setPredictedTokenAddress() {
    // TODO: update to DCNT token contract
  }

  private setPredictedStrategyAddress() {
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
        this.predictedTokenAddress, // governance token
        "0x0000000000000000000000000000000000000001", // Azorius module
        BigNumber.from(50), // voting period (blocks)
        BigNumber.from(0), // proposer weight, how much is needed to create a proposal.
        BigNumber.from(4), // quorom numerator, denominator is 1,000,000, so quorum percentage is 50%
        BigNumber.from(500000), // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
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
    if (!this.predictedStrategyAddress)
      throw new Error("Strategy address not set");
    if (!this.predictedTokenAddress) throw new Error("Token address not set");

    this.azoriusContract = AzoriusFactory.connect(
      this.predictedAzoriusAddress,
      this.frame
    );

    this.linearVotingContract = LinearVotingFactory.connect(
      this.predictedStrategyAddress,
      this.frame
    );
    this.votesTokenContract = VotesERC20Factory.connect(
      this.predictedTokenAddress,
      this.frame
    );
  }
}
