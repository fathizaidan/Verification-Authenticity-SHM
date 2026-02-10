import hre from "hardhat";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const prompt = promptSync({ sigint: true });

async function main() {
  const { ethers } = hre;

  console.log("=== UPDATE OWNER SHM ===\n");

  const certNumber = prompt("Cert Number     : ");
  const ownerName = prompt("New Owner Name : ");
  const ownerNIK = prompt("New Owner NIK  : ");

  if (!certNumber || !ownerName || !ownerNIK) {
    console.log("❌ Semua field wajib diisi");
    process.exit(1);
  }

  if (ownerNIK.length !== 16) {
    console.log("❌ NIK harus 16 digit");
    process.exit(1);
  }

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Factory = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Factory.attach(CONTRACT_ADDRESS);

  console.log("⏳ Mengupdate owner...");
  const tx = await contract.updateOwner(certNumber, ownerName, ownerNIK);
  await tx.wait();

  console.log("✅ OWNER BERHASIL DIUPDATE");
}

main().catch(console.error);
