# Deploying Decent Token

### Configuration
Inside the `config` directory:
- `dcntDAOConfig.ts` - set configuration values for DCNT Token and Decent DAO.
- `beneficiaries.ts` - set beneficiaries to receive locked DCNT tokens

### Deploy
Running the main deploy script will deploy both the DCNT token contracts
(DCNT Token + Lock Contract) as well as the Decent DAO.

The Decent DAO deployment currently depends on the DCNT Token + Lock contract
deployments.

```
nvm use
npx hardhat compile

// Currently supported networks are goerli + mainnet.
npx hardhat run --network <network> scripts/deploy.ts
```

# Test
```
npm run test
```