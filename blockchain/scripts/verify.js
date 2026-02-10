import hre from "hardhat";
import { CONTRACT_ADDRESS } from "./config.js";

async function main() {
  const { ethers } = hre;
  const cert = process.argv[2];

  if (!cert) {
    console.log(
      "Usage:\n" +
        "npx hardhat run scripts/verify.js --network ganache <CERT_NUMBER>"
    );
    process.exit(1);
  }

  const [admin] = await ethers.getSigners();
  console.log("👤 Admin:", admin.address);

  const Factory = await ethers.getContractFactory("SHMRegistry", admin);
  const contract = Factory.attach(CONTRACT_ADDRESS);

  console.log("⏳ Verifying SHM...");
  const tx = await contract.verifySHM(cert);
  await tx.wait();

  console.log("✅ SHM VERIFIED");
}

main().catch(console.error);
