import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    mainnet: {
      chainId: 1,
      url: process.env.MAINNET_PROVIDER || "",
      accounts:
        process.env.MAINNET_DEPLOYER_UTF_PRIVATE_KEY &&
        process.env.MAINNET_DEPLOYER_TDF_PRIVATE_KEY &&
        process.env.MAINNET_DEPLOYER_TAL_PRIVATE_KEY &&
        process.env.MAINNET_DEPLOYER_DTL_PRIVATE_KEY
          ? [
              process.env.MAINNET_DEPLOYER_UTF_PRIVATE_KEY,
              process.env.MAINNET_DEPLOYER_TDF_PRIVATE_KEY,
              process.env.MAINNET_DEPLOYER_TAL_PRIVATE_KEY,
              process.env.MAINNET_DEPLOYER_DTL_PRIVATE_KEY,
            ]
          : [],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_PROVIDER || "",
      accounts:
        process.env.GOERLI_DEPLOYER_UTF_PRIVATE_KEY &&
        process.env.GOERLI_DEPLOYER_TDF_PRIVATE_KEY &&
        process.env.GOERLI_DEPLOYER_TAL_PRIVATE_KEY &&
        process.env.GOERLI_DEPLOYER_DTL_PRIVATE_KEY
          ? [
              process.env.GOERLI_DEPLOYER_UTF_PRIVATE_KEY,
              process.env.GOERLI_DEPLOYER_TDF_PRIVATE_KEY,
              process.env.GOERLI_DEPLOYER_TAL_PRIVATE_KEY,
              process.env.GOERLI_DEPLOYER_DTL_PRIVATE_KEY,
            ]
          : [],
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
