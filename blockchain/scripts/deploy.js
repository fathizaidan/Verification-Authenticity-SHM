import hre from "hardhat";

async function main() {
  const { ethers } = hre;

  console.log("🚀 Deploying to Ganache...");

  const SHMRegistry = await ethers.getContractFactory("SHMRegistry");
  const contract = await SHMRegistry.deploy();

  await contract.waitForDeployment();

  console.log("✅ SHMRegistry deployed at:");
  console.log(await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
