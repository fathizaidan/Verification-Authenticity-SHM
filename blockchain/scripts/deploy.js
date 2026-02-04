async function main() {
  console.log("Deploy script started");

  const hre = await import("hardhat");
  const { ethers } = hre.default;

  const SHMRegistry = await ethers.getContractFactory("SHMRegistry");

  const shm = await SHMRegistry.deploy({});

  await shm.waitForDeployment();

  console.log("SHM deployed to:", await shm.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
