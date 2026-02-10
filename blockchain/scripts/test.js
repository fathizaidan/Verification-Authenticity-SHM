import hre from "hardhat";
import { CONTRACT_ADDRESS } from "./config.js";

async function main() {
  const cert = process.argv[2];
  if (!cert) {
    console.log(
      "Usage: npx hardhat run scripts/view.js --network ganache SHM-2025-001"
    );
    process.exit(1);
  }

  const { ethers } = hre;
  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const data = await contract.getSHM(cert);

  if (!data[0]) {
    console.log("❌ Data tidak ditemukan");
    return;
  }

  console.log("\n📄 DATA SHM");
  console.log("Cert     :", data[0]);
  console.log("CID      :", data[1]);
  console.log("Hash     :", data[2]);
  console.log("Owner    :", data[3]);
  console.log("NIK      :", data[4]);
  console.log("Verified :", data[5]);
  console.log("Revoked  :", data[6]);
}

main().catch(console.error);
