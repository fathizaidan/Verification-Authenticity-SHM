import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const { ethers } = hre;

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Certificate = await ethers.getContractFactory("Certificate");
  const certificate = Certificate.attach(contractAddress);

  const tx = await certificate.storeCertificate(
    "CERT001",
    "HASH_SERTIFIKAT_ABC123",
  );

  await tx.wait();

  const result = await certificate.getCertificate("CERT001");
  console.log("Hash Sertifikat:", result);
}

main().catch(console.error);
