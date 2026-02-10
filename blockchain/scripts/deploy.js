import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Deploying SHMRegistry...\n");

  const Contract = await ethers.getContractFactory("SHMRegistry");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();

  console.log("✅ SHM deployed to:");
  console.log(await contract.getAddress());
}

main().catch((err) => {
  console.error("❌ Deploy error:", err);
  process.exit(1);
});
