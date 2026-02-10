require("@nomicfoundation/hardhat-toolbox");
const { task } = require("hardhat/config");

// ⛓️ CONTRACT ADDRESS (SATU SUMBER)
const { CONTRACT_ADDRESS } = require("./scripts/config.js");

// =======================
// TASK: TEST / VIEW SHM
// =======================
task("testSHM", "Tampilkan data SHM berdasarkan cert number")
  .addParam("cert", "Nomor Sertifikat SHM")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    console.log("👤 Signer:", signer.address);

    const Factory = await ethers.getContractFactory("SHMRegistry", signer);
    const contract = Factory.attach(CONTRACT_ADDRESS);

    try {
      const data = await contract.getSHM(args.cert);

      // 🔑 VALIDASI DATA
      if (!data[0] || data[0].length === 0) {
        console.log("❌ Data SHM tidak ditemukan");
        return;
      }

      console.log("\n📄 DATA SHM");
      console.log("================================");
      console.log("Cert Number :", data[0]);
      console.log("CID         :", data[1]);
      console.log("Doc Hash    :", data[2]);
      console.log("Owner Name  :", data[3]);
      console.log("Owner NIK   :", data[4]);
      console.log("Verified    :", data[5] ? "YA" : "TIDAK");
      console.log("Revoked     :", data[6] ? "YA" : "TIDAK");
      console.log("================================\n");
    } catch (e) {
      console.log("❌ Data SHM tidak ditemukan");
      if (e.reason) console.log("Reason:", e.reason);
    }
  });

// =======================
// TASK: UPDATE OWNER
// =======================
task("updateOwner", "Update owner SHM")
  .addParam("cert")
  .addParam("owner")
  .addParam("nik")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SHMRegistry", signer);
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const tx = await contract.updateOwner(args.cert, args.owner, args.nik);
    await tx.wait();

    console.log("✅ OWNER UPDATED");
  });

// =======================
// TASK: VERIFY SHM
// =======================
task("verifySHM", "Verify SHM")
  .addParam("cert")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SHMRegistry", signer);
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const tx = await contract.verifySHM(args.cert);
    await tx.wait();

    console.log("✅ SHM VERIFIED");
  });

// =======================
// TASK: HISTORY SHM
// =======================
task("history", "Show SHM audit trail")
  .addParam("cert")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const Factory = await ethers.getContractFactory("SHMRegistry");
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const [actions, actors, owners, niks, times] = await contract.getHistory(
      args.cert
    );

    if (!actions || actions.length === 0) {
      console.log("❌ Riwayat tidak tersedia");
      return;
    }

    console.log(`\n📜 RIWAYAT SHM ${args.cert}`);
    console.log("================================\n");

    for (let i = 0; i < actions.length; i++) {
      console.log(`${i + 1}. ${actions[i]}`);
      console.log(`   Owner : ${owners[i]}`);
      console.log(`   NIK   : ${niks[i]}`);
      console.log(`   By    : ${actors[i]}`);
      console.log(
        `   At    : ${new Date(Number(times[i]) * 1000).toLocaleString()}\n`
      );
    }
  });

// =======================
// HARDHAT CONFIG
// =======================
module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        // 🔐 PRIVATE KEY GANACHE (64 hex + 0x)
        "0xe580c13cf5464210dcec77afbe4fd57890c89144c2859688edfe03fc4ea2b095",
      ],
    },
  },
};
