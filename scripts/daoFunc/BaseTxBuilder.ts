/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethProvider } from "eth-provider";
import { SingletonDeployment } from "@safe-global/safe-deployments";
import { Contract } from "ethers";
import {
  Azorius as IAzorius,
  GnosisSafe,
  LinearERC20Voting as ILinearERC20Voting,
  ModuleProxyFactory as IModuleProxyFractory,
} from "@fractal-framework/fractal-contracts";

export class BaseTxBuilder {
  // set base contracts and master copies that are used in the tx
  readonly multiSendContract: SingletonDeployment;
  readonly predictedSafeContract: Contract;
  readonly zodiacModuleProxyFactoryContract: IModuleProxyFractory;
  readonly votesTokenMasterCopyContract: any; // @todo update to DCNT Token
  readonly linearVotingMasterCopyContract: ILinearERC20Voting;
  readonly fractalAzoriusMasterCopyContract: IAzorius;
  readonly frame: any;
  constructor(
    multiSendContract: SingletonDeployment,
    predictedSafeContract: GnosisSafe,
    zodiacModuleProxyFactoryContract: IModuleProxyFractory,
    linearVotingMasterCopyContract: ILinearERC20Voting,
    fractalAzoriusMasterCopyContract: IAzorius
  ) {
    this.multiSendContract = multiSendContract;
    this.predictedSafeContract = predictedSafeContract;
    this.zodiacModuleProxyFactoryContract = zodiacModuleProxyFactoryContract;
    this.linearVotingMasterCopyContract = linearVotingMasterCopyContract;
    this.fractalAzoriusMasterCopyContract = fractalAzoriusMasterCopyContract;
    this.votesTokenMasterCopyContract = undefined; // @todo update to DCNT Token
    this.frame = ethProvider("frame");
  }
}
