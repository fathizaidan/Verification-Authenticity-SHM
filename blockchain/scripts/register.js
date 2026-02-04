import hre from "hardhat";
import fs from "fs";

const { ethers } = hre;

async function main() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  // Load file
  const file = fs.readFileSync("./shm.pdf");

  // Hash file → bytes32
  const hash = ethers.keccak256(file);

  console.log("Hash:", hash);

  const tx = await contract.registerSHM(
    "SHM001", // certNumber
    "bafyCID", // cid
    hash, // bytes32
    "Budi Santoso", // owner
    "321xxx", // nik
  );

  await tx.wait();

  console.log("REGISTERED");
}

main().catch(console.error);
