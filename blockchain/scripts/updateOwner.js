import hre from "hardhat";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const prompt = promptSync();
const { ethers } = hre;

async function main() {
  const cert = prompt("Cert Number : ");
  const owner = prompt("New Owner Name : ");
  const nik = prompt("New Owner NIK  : ");

  const signers = await ethers.getSigners();

  // 🔐 ADMIN / BPN / NOTARIS
  const adminSigner = signers[0];

  const Factory = await ethers.getContractFactory("SHMRegistry", adminSigner);

  const contract = Factory.attach(CONTRACT_ADDRESS);

  const tx = await contract.updateOwner(cert, owner, nik);
  await tx.wait();

  console.log("\nOWNER UPDATED");
  console.log("Owner:", owner);
  console.log("NIK  :", nik);
}

main().catch(console.error);
