import "@nomicfoundation/hardhat-toolbox";

export default {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      blockGasLimit: 30_000_000,
    },
  },
};
