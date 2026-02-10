import hre from "hardhat";
import promptSync from "prompt-sync";
import { CONTRACT_ADDRESS } from "./config.js";

const prompt = promptSync({ sigint: true });

async function main() {
  const { ethers } = hre;

  console.log("=== REGISTRASI SHM (GANACHE) ===\n");

  const certNumber = prompt("Cert Number  : ");
  const ownerName = prompt("Owner Name  : ");
  const ownerNIK = prompt("Owner NIK   : ");
  const cid = prompt("CID (IPFS)  : ");

  if (!certNumber || !ownerName || !ownerNIK || !cid) {
    console.log("❌ Semua field wajib diisi");
    process.exit(1);
  }

  if (ownerNIK.length !== 16) {
    console.log("❌ NIK harus 16 digit");
    process.exit(1);
  }

  try {
    const [admin] = await ethers.getSigners();
    console.log("👤 Admin:", admin.address);

    const Factory = await ethers.getContractFactory("SHMRegistry", admin);
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const documentHash = ethers.keccak256(ethers.toUtf8Bytes(certNumber));

    console.log("⏳ Mendaftarkan SHM...");

    const tx = await contract.registerSHM(
      certNumber,
      cid,
      documentHash,
      ownerName,
      ownerNIK
    );

    await tx.wait();

    console.log("✅ SHM BERHASIL DIDAFTARKAN");
  } catch (e) {
    // =============================
    // 🔒 ERROR HANDLING MANUSIAWI
    // =============================
    let message = "Registrasi SHM gagal";

    if (e.reason) {
      // dari require("...")
      message = e.reason;
    } else if (e.error?.reason) {
      message = e.error.reason;
    } else if (e.code === "CALL_EXCEPTION") {
      message = "SHM sudah terdaftar atau sudah dicabut";
    }

    console.log("❌ GAGAL");
    console.log(message);
  }
}

main();
