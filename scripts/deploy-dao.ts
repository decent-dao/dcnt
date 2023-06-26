import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  GnosisSafe__factory as GnosisSafeFactory,
  GnosisSafeProxyFactory__factory as GnosisSafeProxyFactory,
  Azorius__factory as AzoriusFactory,
  LinearERC20Voting__factory as LinearERC20VotingFactory,
} from "@fractal-framework/fractal-contracts";
import {
  abi as moduleProxyFractoryABI,
  address as moduleProxyFactoryAddress,
} from "@fractal-framework/fractal-contracts/deployments/goerli/ModuleProxyFactory.json";
import {
  abi as azoriusMasterCopyABI,
  address as azoriusMasterCopyAddress,
} from "@fractal-framework/fractal-contracts/deployments/goerli/Azorius.json";
import {
  abi as linearERC20VotingMasterCopyABI,
  address as linearERC20VotingMasterCopyAddress,
} from "@fractal-framework/fractal-contracts/deployments/goerli/LinearERC20Voting.json";
import {
  buildSafeTransaction,
  buildSignatureBytes,
  calculateProxyAddress,
  getRandomBytes,
  ifaceSafe,
  predictGnosisSafeAddress,
  safeSignTypedData,
} from "./daoFunc/azorius";

const abiCoder = new ethers.utils.AbiCoder();

async function main() {
  const [deployer] = await ethers.getSigners();
  const DCNTTokenArtifact = await ethers.getContractFactory("DCNTToken");
  const LockReleaseArtifact = await ethers.getContractFactory("LockRelease");

  // First deploy DCNTToken and mint tokens to deployer address
  const initialSupply = ethers.utils.parseEther("10000"); // Supply for Token Generation Event
  const token = await DCNTTokenArtifact.deploy(initialSupply, deployer.address);
  await token.deployed();
  console.log(`DCNTToken deployed to: ${token.address}`);

  const mockedBeneficiaries = [
    {
      address: "0xMockBeneficiary1",
      lockedAmount: ethers.utils.parseEther("1000"),
    },
    {
      address: "0xMockBeneficiary2",
      lockedAmount: ethers.utils.parseEther("1000"),
    },
  ];

  const beneficiaries = mockedBeneficiaries;

  // Mocked amounts for beneficiaries
  const totalLockedAmount = beneficiaries.reduce(
    (a, b) => a.add(b.lockedAmount),
    ethers.BigNumber.from(0)
  );

  // Deploy LockRelease contract with token address, beneficiaries, amounts, start, and duration
  const beneficiaryAddresses = beneficiaries.map((b) => b.address);
  const start = Math.floor(Date.now() / 1000);
  const duration = 60 * 60 * 24 * 365; // 1 year

  const lockRelease = await LockReleaseArtifact.deploy(
    token.address,
    beneficiaryAddresses,
    beneficiaries.map((a) => a.lockedAmount),
    start,
    duration
  );
  await lockRelease.deployed();
  console.log(`LockRelease contract deployed to: ${lockRelease.address}`);

  // Make sure enough time has passed before minting new tokens
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 * 60 * 60 * 24 * 365)
  ); // Wait for a year

  // Mint and fund the lock contract with the locked token amounts
  await token.mint(lockRelease.address, totalLockedAmount);
  console.log(
    `Minted and transferred ${totalLockedAmount} tokens to LockRelease contract`
  );

  // Fractal DAO is deployed with token as the governance token, and the lock contract as the address on the strategy for governance
  // Deployer funds Fractal DAO with remaining tokens (these are unlocked)

  // ! create gnosis safe predicted address
  // @todo These addresses may need to get updated for mainnet; they are for goerli
  const gnosisFactoryAddress = "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2";
  const gnosisSingletonAddress = "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552";
  const saltNum = BigNumber.from(
    "0x856d90216588f9ffc124d1480a440e1c012c7a816952bc968d737bae5d4e139c"
  );

  const gnosisSafeProxyFactory = await ethers.getContractAt(
    GnosisSafeFactory.abi,
    gnosisFactoryAddress
  );

  const moduleProxyFactory = await ethers.getContractAt(
    moduleProxyFractoryABI,
    moduleProxyFactoryAddress
  );

  const createGnosisSetupCalldata = ifaceSafe.encodeFunctionData("setup", [
    [deployer], // ? @todo is this correct?
    1,
    ethers.constants.AddressZero,
    ethers.constants.HashZero,
    ethers.constants.AddressZero,
    ethers.constants.AddressZero,
    0,
    ethers.constants.AddressZero,
  ]);

  const predictedGnosisSafeAddress = await predictGnosisSafeAddress(
    gnosisSafeProxyFactory.address,
    createGnosisSetupCalldata,
    saltNum,
    gnosisSingletonAddress,
    gnosisSafeProxyFactory
  );

  await gnosisSafeProxyFactory.createProxyWithNonce(
    gnosisSingletonAddress,
    createGnosisSetupCalldata,
    saltNum
  );

  const gnosisSafe = await ethers.getContractAt(
    GnosisSafeProxyFactory.abi,
    predictedGnosisSafeAddress
  );

  const azoriusSalt = getRandomBytes();

  const azoriusMasterCopy = await ethers.getContractAt(
    azoriusMasterCopyABI,
    azoriusMasterCopyAddress
  );

  const azoriusSetupCalldata =
    // eslint-disable-next-line camelcase
    AzoriusFactory.createInterface().encodeFunctionData("setUp", [
      abiCoder.encode(
        ["address", "address", "address", "address[]", "uint32", "uint32"],
        [
          deployer, // ? @todo is this correct? // Gnosis Safe Owner
          gnosisSafe.address,
          gnosisSafe.address,
          [],
          60, // timelock period in blocks
          60, // execution period in blocks
        ]
      ),
    ]);

  await moduleProxyFactory.deployModule(
    azoriusMasterCopyAddress,
    azoriusSetupCalldata,
    azoriusSalt
  );

  const predictedAzoriusAddress = calculateProxyAddress(
    moduleProxyFactory,
    azoriusMasterCopyAddress,
    azoriusSetupCalldata,
    azoriusSalt
  );

  const azoriusContract = await ethers.getContractAt(
    azoriusMasterCopyABI,
    predictedAzoriusAddress
  );

  const linearERC20VotingSetupCalldata =
    // eslint-disable-next-line camelcase
    LinearERC20VotingFactory.createInterface().encodeFunctionData("setUp", [
      abiCoder.encode(
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
          deployer, // ? @todo is this correct? // Gnosis Safe Owner
          lockRelease.address, // governance token
          azoriusContract.address, // Azorius module
          60, // voting period in blocks
          300, // proposer weight
          500000, // quorom numerator, denominator is 1,000,000, so quorum percentage is 50%
          500000, // basis numerator, denominator is 1,000,000, so basis percentage is 50% (simple majority)
        ]
      ),
    ]);

  const linearERC20Salt = getRandomBytes();

  await moduleProxyFactory.deployModule(
    linearERC20VotingMasterCopyAddress,
    linearERC20VotingSetupCalldata,
    linearERC20Salt
  );

  const predictedLinearERC20VotingAddress = calculateProxyAddress(
    moduleProxyFactory,
    linearERC20VotingMasterCopyAddress,
    linearERC20VotingSetupCalldata,
    linearERC20Salt
  );

  const linearERC20Voting = await ethers.getContractAt(
    linearERC20VotingMasterCopyABI,
    predictedLinearERC20VotingAddress
  );

  await azoriusContract
    .connect(deployer)
    .enableStrategy(linearERC20Voting.address);

  // tx through to Safe
  // ?@todo snapshot url?
  // @todo update daoName
  // @todo linear 'setAzorius' tx
  // Create transaction on Gnosis Safe to setup Azorius module
  const enableAzoriusModuleData = gnosisSafe.interface.encodeFunctionData(
    "enableModule",
    [azoriusContract.address]
  );

  const enableAzoriusModuleTx = buildSafeTransaction({
    to: gnosisSafe.address,
    data: enableAzoriusModuleData,
    safeTxGas: 1000000, // ? @todo is this correct?
    nonce: (await gnosisSafe.nonce()).toNumber(),
  });

  const sigs = [
    await safeSignTypedData(deployer, gnosisSafe, enableAzoriusModuleTx),
  ];

  const signatureBytes = buildSignatureBytes(sigs);

  // @todo add Azorius Contract as owner
  // ?@todo remove other owners from Safe

  // execute transaction on Gnosis Safe to setup Azorius module
  await gnosisSafe.execTransaction(
    enableAzoriusModuleTx.to,
    enableAzoriusModuleTx.value,
    enableAzoriusModuleTx.data,
    enableAzoriusModuleTx.operation,
    enableAzoriusModuleTx.safeTxGas,
    enableAzoriusModuleTx.baseGas,
    enableAzoriusModuleTx.gasPrice,
    enableAzoriusModuleTx.gasToken,
    enableAzoriusModuleTx.refundReceiver,
    signatureBytes
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
