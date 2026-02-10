import hre from "hardhat";
import { CONTRACT_ADDRESS } from "./config.js";

async function main() {
  const { ethers } = hre;
  const cert = process.argv[2];

  if (!cert) {
    console.log(
      "Usage:\n" +
        "npx hardhat run scripts/history.js --network ganache <CERT_NUMBER>"
    );
    process.exit(1);
  }

  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const [actions, actors, owners, niks, times] = await contract.getHistory(
    cert
  );

  console.log(`\n📜 RIWAYAT SHM ${cert}`);
  console.log("=================================\n");

  let prevOwner = null;
  let prevNIK = null;

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const owner = owners[i];
    const nik = niks[i];
    const actor = actors[i];
    const time = new Date(Number(times[i]) * 1000).toLocaleString();

    console.log(`${i + 1}. ${action}`);
    console.log(`   By   : ${actor}`);
    console.log(`   At   : ${time}`);

    // ===============================
    // REGISTER
    // ===============================
    if (action === "REGISTER") {
      console.log("   📌 Data Registrasi:");
      console.log(`      - Owner : ${owner}`);
      console.log(`      - NIK   : ${nik}`);
    }

    // ===============================
    // UPDATE OWNER
    // ===============================
    else if (action === "UPDATE_OWNER") {
      console.log("   ✏️ Perubahan Data:");

      if (prevOwner && prevOwner !== owner) {
        console.log(`      - Owner : ${prevOwner} ➜ ${owner}`);
      }

      if (prevNIK && prevNIK !== nik) {
        console.log(`      - NIK   : ${prevNIK} ➜ ${nik}`);
      }
    }

    // ===============================
    // VERIFY
    // ===============================
    else if (action === "VERIFY") {
      console.log("   ✅ Sertifikat diverifikasi");
    }

    // ===============================
    // REVOKE
    // ===============================
    else if (action === "REVOKE") {
      console.log("   ⛔ Sertifikat dicabut");
    }

    console.log(""); // spasi antar event

    // simpan state sebelumnya
    prevOwner = owner;
    prevNIK = nik;
  }

  console.log("=================================\n");
}

main().catch((err) => {
  console.error("❌ Error:", err.reason || err.message);
});
