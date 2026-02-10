import hre from "hardhat";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const { ethers } = hre;
const prompt = promptSync({ sigint: true });

async function main() {
  console.log("=== CABUT SHM ===\n");

  const cert = prompt("Cert Number : ");

  if (!cert) {
    console.log("❌ Cert Number wajib diisi");
    process.exit(1);
  }

  const confirm = prompt("Yakin cabut SHM ini? (y/n): ");
  if (confirm.toLowerCase() !== "y") {
    console.log("❎ Dibatalkan");
    return;
  }

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Contract = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Contract.attach(CONTRACT_ADDRESS);

  console.log("\n⏳ Mencabut SHM...");
  const tx = await contract.revokeSHM(cert);
  await tx.wait();

  console.log("⛔ SHM BERHASIL DICABUT");
}

main().catch(console.error);
