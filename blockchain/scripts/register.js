const hre = require("hardhat");
const fs = require("fs");
const promptSync = require("prompt-sync");
const { CONTRACT_ADDRESS } = require("./config.js");

const prompt = promptSync();
const { ethers } = hre;

async function main() {
  const CERT_NUMBER = prompt("Cert Number        : ");
  const OWNER_NAME = prompt("Owner Name         : ");
  const OWNER_NIK = prompt("Owner NIK          : ");
  const CID = prompt("IPFS CID           : ");

  console.log("\n--- Processing Registration ---");

  const file = fs.readFileSync("./shm.pdf");
  const documentHash = ethers.keccak256(file);

  console.log("PDF Hash :", documentHash);

  const signers = await ethers.getSigners();
  const callerIndex = process.env.CALLER_INDEX ?? "0";
  const signer = signers[Number(callerIndex)];

  console.log("CALLER ADDRESS :", signer.address);

  const Factory = await ethers.getContractFactory("SHMRegistry", signer);
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const tx = await contract.registerSHM(
    CERT_NUMBER,
    CID,
    documentHash,
    OWNER_NAME,
    OWNER_NIK,
  );

  console.log("⏳ Registering SHM...");
  await tx.wait();

  console.log("\n✅ REGISTER SUCCESS");

  const data = await contract.getSHM(CERT_NUMBER);

  console.log("\nCHECK AFTER REGISTER:");
  console.log("Cert     :", data[0]);
  console.log("CID      :", data[1]);
  console.log("Hash     :", data[2]);
  console.log("Owner    :", data[3]);
  console.log("NIK      :", data[4]);
  console.log("Verified :", data[5]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
