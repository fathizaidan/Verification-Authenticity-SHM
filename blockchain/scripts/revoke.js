import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const tx = await contract.revokeSHM("SHM001");
  await tx.wait();

  console.log("SHM REVOKED");
}

main().catch(console.error);
