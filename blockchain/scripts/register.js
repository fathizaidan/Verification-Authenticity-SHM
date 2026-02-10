import hre from "hardhat";
import fs from "fs";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const { ethers } = hre;
const prompt = promptSync({ sigint: true });

async function main() {
  console.log("=== REGISTRASI SHM ===\n");

  const cert = prompt("Cert Number  : ");
  const owner = prompt("Owner Name   : ");
  const nik = prompt("Owner NIK    : ");
  const cid = prompt("IPFS CID     : ");

  if (!cert || !owner || !nik || !cid) {
    console.log("❌ Semua field wajib diisi");
    process.exit(1);
  }

  if (nik.length !== 16) {
    console.log("❌ NIK harus 16 digit");
    process.exit(1);
  }

  // Hash dokumen
  const file = fs.readFileSync("./shm.pdf");
  const documentHash = ethers.keccak256(file);

  console.log("\n📄 Document Hash:", documentHash);

  // Admin signer
  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Contract = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Contract.attach(CONTRACT_ADDRESS);

  console.log("\n⏳ Mendaftarkan SHM...");
  const tx = await contract.registerSHM(cert, cid, documentHash, owner, nik);
  await tx.wait();

  console.log("✅ REGISTER BERHASIL");

  const data = await contract.getSHM(cert);

  console.log("\n📄 DATA SHM");
  console.log("Cert     :", data[0]);
  console.log("CID      :", data[1]);
  console.log("Hash     :", data[2]);
  console.log("Owner    :", data[3]);
  console.log("NIK      :", data[4]);
  console.log("Verified :", data[5] ? "YA" : "TIDAK");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
