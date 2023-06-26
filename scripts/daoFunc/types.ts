import { BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";

export const EIP712_SAFE_TX_TYPE = {
  // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
  SafeTx: [
    { type: "address", name: "to" },
    { type: "uint256", name: "value" },
    { type: "bytes", name: "data" },
    { type: "uint8", name: "operation" },
    { type: "uint256", name: "safeTxGas" },
    { type: "uint256", name: "baseGas" },
    { type: "uint256", name: "gasPrice" },
    { type: "address", name: "gasToken" },
    { type: "address", name: "refundReceiver" },
    { type: "uint256", name: "nonce" },
  ],
};

export const EIP712_SAFE_MESSAGE_TYPE = {
  // "SafeMessage(bytes message)"
  SafeMessage: [{ type: "bytes", name: "message" }],
};

export interface MetaTransaction {
  to: string;
  value: string | number | BigNumber;
  data: string;
  operation: number;
}

export interface SafeTransaction extends MetaTransaction {
  safeTxGas: string | number;
  baseGas: string | number;
  gasPrice: string | number;
  gasToken: string;
  refundReceiver: string;
  nonce: string | number;
}

export interface SafeSignature {
  signer: string;
  data: string;
}

export const iface = new Interface([
  "function createProxyWithNonce(address _singleton, bytes memory initializer, uint256 saltNonce) returns (GnosisSafeProxy proxy)",
  "function createProxyWithCallback(address _singleton,bytes memory initializer,uint256 saltNonce,address callback) public returns (address proxy)",
]);

export const ifaceSafe = new Interface([
  "event RemovedOwner(address owner)",
  "function setup(address[] calldata _owners,uint256 _threshold,address to,bytes calldata data,address fallbackHandler,address paymentToken,uint256 payment,address payable paymentReceiver)",
  "function execTransaction(address to,uint256 value,bytes calldata data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address payable refundReceiver,bytes memory signatures) public payable returns (bool success)",
  "function setGuard(address guard) external",
  "function addOwnerWithThreshold(address owner, uint256 _threshold) external",
  "function swapOwner(address prevOwner,address oldOwner,address newOwner) external",
  "function changeThreshold(uint256 _threshold) external",
  "function removeOwner(address prevOwner,address owner,uint256 _threshold) external",
  "function isOwner(address owner) public view returns (bool)",
  "function enableModule(address module) public",
  "function nonce() public view returns (uint256)",
]);

export const ifaceMultiSend = new Interface([
  "function multiSend(bytes memory transactions) public payable",
]);

export const ifaceFactory = new Interface([
  "function deployModule(address masterCopy,bytes memory initializer,uint256 saltNonce) public returns (address proxy)",
  "event ModuleProxyCreation(address indexed proxy,address indexed masterCopy)",
]);

export const azoriusiface = new Interface([
  "function setUp(bytes memory initParams) public",
]);
