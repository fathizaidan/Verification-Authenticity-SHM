import hre from "hardhat";
import { CONTRACT_ADDRESS } from "./config.js";

const { ethers } = hre;

async function main() {
  const cert = process.argv[2];

  if (!cert) {
    console.log("Usage:");
    console.log(
      "npx hardhat run scripts/verify.js --network localhost SHM-001"
    );
    process.exit(1);
  }

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Contract = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Contract.attach(CONTRACT_ADDRESS);

  console.log(`⏳ Verifying SHM ${cert}...`);
  const tx = await contract.verifySHM(cert);
  await tx.wait();

  console.log("✅ SHM VERIFIED");

  const data = await contract.getSHM(cert);

  console.log("\n📄 DATA SHM");
  console.log("Cert     :", data[0]);
  console.log("CID      :", data[1]);
  console.log("Hash     :", data[2]);
  console.log("Owner    :", data[3]);
  console.log("NIK      :", data[4]);
  console.log("Verified :", data[5] ? "YA" : "TIDAK");
}

main().catch(console.error);
