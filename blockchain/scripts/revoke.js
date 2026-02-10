import hre from "hardhat";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const prompt = promptSync({ sigint: true });

async function main() {
  const { ethers } = hre;

  console.log("=== CABUT SHM ===\n");

  const certNumber = prompt("Cert Number : ");
  const confirm = prompt("Yakin cabut SHM ini? (y/n): ");

  if (confirm.toLowerCase() !== "y") {
    console.log("❎ Dibatalkan");
    return;
  }

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Factory = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Factory.attach(CONTRACT_ADDRESS);

  console.log("⏳ Mencabut SHM...");
  const tx = await contract.revokeSHM(certNumber);
  await tx.wait();

  console.log("⛔ SHM BERHASIL DICABUT");
}

main().catch(console.error);
