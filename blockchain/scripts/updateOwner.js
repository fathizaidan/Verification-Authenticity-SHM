import hre from "hardhat";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const { ethers } = hre;
const prompt = promptSync({ sigint: true });

async function main() {
  console.log("=== UPDATE OWNER SHM ===\n");

  const cert = prompt("Cert Number      : ");
  const owner = prompt("New Owner Name   : ");
  const nik = prompt("New Owner NIK    : ");

  if (!cert || !owner || !nik) {
    console.log("❌ Semua field wajib diisi");
    process.exit(1);
  }

  if (nik.length !== 16) {
    console.log("❌ NIK harus 16 digit");
    process.exit(1);
  }

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Contract = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Contract.attach(CONTRACT_ADDRESS);

  console.log("\n⏳ Mengupdate owner...");
  const tx = await contract.updateOwner(cert, owner, nik);
  await tx.wait();

  console.log("✅ OWNER UPDATED");

  const data = await contract.getSHM(cert);

  console.log("\n📄 DATA TERKINI");
  console.log("Owner :", data[3]);
  console.log("NIK   :", data[4]);
}

main().catch(console.error);
