/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildContractCall, encodeMultiSend } from "./utils";
import { BaseContract, Contract, ethers } from "ethers";
import {
  KeyValuePairs,
  FractalRegistry,
  Azorius as IAzorius,
  GnosisSafe,
  ModuleProxyFactory as IModuleProxyFractory,
  LinearERC20Voting,
} from "@fractal-framework/fractal-contracts";
import { DecentDAOConfig, MetaTransaction, SafeTransaction } from "./types";
import { DCNTToken, LockRelease } from "../typechain-types";

export class BaseTxBuilder {
  // set base contracts and master copies that are used in the tx
  readonly multiSendContract: BaseContract;
  readonly predictedSafeContract: GnosisSafe;
  readonly zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  readonly fractalAzoriusMasterCopyContract: IAzorius;
  readonly dcntTokenContract: DCNTToken;
  readonly lockReleaseContract: LockRelease;
  readonly fractalRegistryContract: FractalRegistry;
  readonly keyValuePairsContract: KeyValuePairs;
  readonly linearVotingMasterCopyContract: LinearERC20Voting;
  readonly decentDAOConfig: DecentDAOConfig;

  constructor(
    predictedSafeContract: GnosisSafe,
    dcntTokenContract: DCNTToken,
    lockReleaseContract: LockRelease,
    multiSendContract: BaseContract,
    zodiacModuleProxyFactoryContract: IModuleProxyFractory,
    fractalAzoriusMasterCopyContract: IAzorius,
    fractalRegistryContract: FractalRegistry,
    keyValuePairsContract: KeyValuePairs,
    linearVotingMasterCopyContract: LinearERC20Voting,
    decentDAOConfig: DecentDAOConfig
  ) {
    this.predictedSafeContract = predictedSafeContract;
    this.dcntTokenContract = dcntTokenContract;
    this.lockReleaseContract = lockReleaseContract;
    this.multiSendContract = multiSendContract;
    this.zodiacModuleProxyFactoryContract = zodiacModuleProxyFactoryContract;
    this.fractalAzoriusMasterCopyContract = fractalAzoriusMasterCopyContract;
    this.fractalRegistryContract = fractalRegistryContract;
    this.keyValuePairsContract = keyValuePairsContract;
    this.linearVotingMasterCopyContract = linearVotingMasterCopyContract;
    this.decentDAOConfig = decentDAOConfig;
  }

  buildUpdateDAONameTx(): Promise<SafeTransaction> {
    return buildContractCall(
      this.fractalRegistryContract as unknown as Contract,
      "updateDAOName",
      [this.decentDAOConfig.name],
      0,
      false
    );
  }

  buildUpdateDAOSnapshotURLTx(): Promise<SafeTransaction> {
    return buildContractCall(
      this.keyValuePairsContract as unknown as Contract,
      "updateValues",
      [["snapshotURL"], [this.decentDAOConfig.snapshotENS]],
      0,
      false
    );
  }

  async buildExecInternalSafeTx(
    signatures: string,
    internalTxs: MetaTransaction[]
  ): Promise<SafeTransaction> {
    const safeInternalTx = encodeMultiSend(internalTxs);
    return buildContractCall(
      this.predictedSafeContract as unknown as Contract,
      "execTransaction",
      [
        await this.multiSendContract.getAddress(), // to
        "0", // value
        this.multiSendContract.interface.encodeFunctionData("multiSend", [
          safeInternalTx,
        ]), // calldata
        "1", // operation
        "0", // tx gas
        "0", // base gas
        "0", // gas price
        ethers.ZeroAddress, // gas token
        ethers.ZeroAddress, // receiver
        signatures, // sigs
      ],
      0,
      false
    );
  }
}
