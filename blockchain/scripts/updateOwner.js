import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // ISI LANGSUNG
  const certNumber = "SHM001";
  const newOwner = "Andi Saputra";
  const newNIK = "99887766";

  const [signer] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("SHMRegistry", signer);
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const tx = await contract.updateOwner(certNumber, newOwner, newNIK);
  await tx.wait();

  console.log("OWNER UPDATED");
}

main().catch(console.error);
