import { LockRelease } from "./../../typechain/LockRelease.d";
import { DCNTToken } from "./../../typechain/DCNTToken.d";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethProvider } from "eth-provider";
import { SingletonDeployment } from "@safe-global/safe-deployments";
import { Contract } from "ethers";
import {
  Azorius as IAzorius,
  GnosisSafe,
  ModuleProxyFactory as IModuleProxyFractory,
} from "@fractal-framework/fractal-contracts";

export class BaseTxBuilder {
  // set base contracts and master copies that are used in the tx
  readonly multiSendContract: SingletonDeployment;
  readonly predictedSafeContract: Contract;
  readonly zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  readonly fractalAzoriusMasterCopyContract: IAzorius;
  readonly dcntTokenContract: DCNTToken;
  readonly lockReleaseContract: LockRelease;
  readonly frame: any;
  constructor(
    predictedSafeContract: GnosisSafe,
    dcntTokenContract: DCNTToken,
    lockReleaseContract: LockRelease,
    multiSendContract: SingletonDeployment,
    zodiacModuleProxyFactoryContract: IModuleProxyFractory,
    fractalAzoriusMasterCopyContract: IAzorius
  ) {
    this.predictedSafeContract = predictedSafeContract;
    this.dcntTokenContract = dcntTokenContract;
    this.lockReleaseContract = lockReleaseContract;
    this.multiSendContract = multiSendContract;
    this.zodiacModuleProxyFactoryContract = zodiacModuleProxyFactoryContract;
    this.fractalAzoriusMasterCopyContract = fractalAzoriusMasterCopyContract;
    this.frame = ethProvider("frame");
  }
}
