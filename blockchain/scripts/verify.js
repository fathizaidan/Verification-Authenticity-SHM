import hre from "hardhat";
const { ethers } = hre;
import { CONTRACT_ADDRESS } from "./config.js";

async function main() {
  const cert = process.argv[2];

  if (!cert) {
    console.log("Usage:");
    console.log("npx hardhat run scripts/verify.js --network localhost SHM001");
    return;
  }

  const [signer] = await ethers.getSigners();

  const Factory = await ethers.getContractFactory("SHMRegistry", signer);
  const contract = Factory.attach(CONTRACT_ADDRESS);

  // 1️⃣ VERIFY
  const tx = await contract.verifySHM(cert);
  await tx.wait();

  const raw = await ethers.provider.call({
    to: CONTRACT_ADDRESS,
    data: contract.interface.encodeFunctionData("getSHM", [cert]),
  });
  console.log("RAW:", raw);

  // 2️⃣ AMBIL DATA SETELAH VERIFY
  const data = await contract.getSHM(cert);

  console.log("\nSHM VERIFIED");
  console.log("Cert   :", data[0]);
  console.log("CID    :", data[1]);
  console.log("Hash   :", data[2]);
  console.log("Owner  :", data[3]);
  console.log("NIK    :", data[4]);
  console.log("Verified:", data[5]);
  console.log(process.argv);
}

main().catch(console.error);
