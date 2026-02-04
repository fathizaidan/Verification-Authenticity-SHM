import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const data = await contract.getSHM("SHM001");

  console.log("Cert:", data[0]);
  console.log("CID:", data[1]);
  console.log("Hash:", data[2]);
  console.log("Owner:", data[3]);
  console.log("NIK:", data[4]);
  console.log("Verified:", data[5]);
}

main().catch(console.error);
