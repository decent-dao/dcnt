import { Contract, BigNumber, ethers } from "ethers";

export const predictGnosisSafeAddress = async (
  factory: string,
  calldata: string,
  saltNum: string | BigNumber,
  singleton: string,
  gnosisFactory: Contract
): Promise<string> => {
  return ethers.utils.getCreate2Address(
    factory,
    ethers.utils.solidityKeccak256(
      ["bytes", "uint256"],
      [ethers.utils.solidityKeccak256(["bytes"], [calldata]), saltNum]
    ),
    ethers.utils.solidityKeccak256(
      ["bytes", "uint256"],
      [
        // eslint-disable-next-line camelcase
        await gnosisFactory.proxyCreationCode(),
        singleton,
      ]
    )
  );
};

export const predictGnosisSafeCallbackAddress = async (
  factory: string,
  calldata: string,
  saltNum: string | BigNumber,
  callback: string,
  singleton: string,
  gnosisFactory: Contract
): Promise<string> => {
  return ethers.utils.getCreate2Address(
    factory,
    ethers.utils.solidityKeccak256(
      ["bytes", "bytes"],
      [
        ethers.utils.solidityKeccak256(["bytes"], [calldata]),
        ethers.utils.solidityKeccak256(
          ["uint256", "address"],
          [saltNum, callback]
        ),
      ]
    ),
    ethers.utils.solidityKeccak256(
      ["bytes", "uint256"],
      [
        // eslint-disable-next-line camelcase
        await gnosisFactory.proxyCreationCode(),
        singleton,
      ]
    )
  );
};
