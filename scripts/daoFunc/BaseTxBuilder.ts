/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildContractCall, encodeMultiSend } from "./utils";
import { LockRelease } from "./../../typechain/LockRelease.d";
import { DCNTToken } from "./../../typechain/DCNTToken.d";
import { ethProvider } from "eth-provider";
import { constants, Contract } from "ethers";
import {
  KeyValuePairs,
  FractalRegistry,
  Azorius as IAzorius,
  GnosisSafe,
  ModuleProxyFactory as IModuleProxyFractory,
} from "@fractal-framework/fractal-contracts";
import { MetaTransaction, SafeTransaction } from "./types";

export class BaseTxBuilder {
  // set base contracts and master copies that are used in the tx
  readonly multiSendContract: Contract;
  readonly predictedSafeContract: GnosisSafe;
  readonly zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  readonly fractalAzoriusMasterCopyContract: IAzorius;
  readonly dcntTokenContract: DCNTToken;
  readonly lockReleaseContract: LockRelease;
  readonly fractalRegistryContract: FractalRegistry;
  readonly keyValuePairsContract: KeyValuePairs;

  readonly frame: any;
  constructor(
    predictedSafeContract: GnosisSafe,
    dcntTokenContract: DCNTToken,
    lockReleaseContract: LockRelease,
    multiSendContract: Contract,
    zodiacModuleProxyFactoryContract: IModuleProxyFractory,
    fractalAzoriusMasterCopyContract: IAzorius,
    fractalRegistryContract: FractalRegistry,
    keyValuePairsContract: KeyValuePairs
  ) {
    this.predictedSafeContract = predictedSafeContract;
    this.dcntTokenContract = dcntTokenContract;
    this.lockReleaseContract = lockReleaseContract;
    this.multiSendContract = multiSendContract;
    this.zodiacModuleProxyFactoryContract = zodiacModuleProxyFactoryContract;
    this.fractalAzoriusMasterCopyContract = fractalAzoriusMasterCopyContract;
    this.fractalRegistryContract = fractalRegistryContract;
    this.keyValuePairsContract = keyValuePairsContract;
    this.frame = ethProvider("frame");
  }

  buildUpdateDAONameTx(): SafeTransaction {
    return buildContractCall(
      this.fractalRegistryContract,
      "updateDAOName",
      ["Decent DAO"],
      0,
      false
    );
  }

  buildUpdateDAOSnapshotURLTx(): SafeTransaction {
    return buildContractCall(
      this.keyValuePairsContract,
      "updateValues",
      [["snapshotURL"], ""], // @todo update
      0,
      false
    );
  }

  buildExecInternalSafeTx(
    signatures: string,
    internalTxs: MetaTransaction[]
  ): SafeTransaction {
    const safeInternalTx = encodeMultiSend(internalTxs);
    return buildContractCall(
      this.predictedSafeContract,
      "execTransaction",
      [
        this.multiSendContract.defaultAddress, // to
        "0", // value
        this.multiSendContract.interface.encodeFunctionData("multiSend", [
          safeInternalTx,
        ]), // calldata
        "1", // operation
        "0", // tx gas
        "0", // base gas
        "0", // gas price
        constants.AddressZero, // gas token
        constants.AddressZero, // receiver
        signatures, // sigs
      ],
      0,
      false
    );
  }
}
