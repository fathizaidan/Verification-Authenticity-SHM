import hre from "hardhat";
import { CONTRACT_ADDRESS } from "./config.js";

const { ethers } = hre;

async function main() {
  const cert = process.argv[2];

  if (!cert) {
    console.log(
      "Usage: npx hardhat run scripts/history.js --network localhost SHM-001"
    );
    process.exit(1);
  }

  const Contract = await ethers.getContractFactory("SHMRegistry");
  const contract = Contract.attach(CONTRACT_ADDRESS);

  const [actions, actors, owners, niks, times] = await contract.getHistory(
    cert
  );

  console.log(`\n📜 RIWAYAT SHM ${cert}\n`);

  for (let i = 0; i < actions.length; i++) {
    const date = new Date(Number(times[i]) * 1000);
    console.log(`${i + 1}. ${actions[i]}`);
    console.log(`   Owner : ${owners[i]}`);
    console.log(`   NIK   : ${niks[i]}`);
    console.log(`   By    : ${actors[i]}`);
    console.log(`   At    : ${date.toLocaleString()}\n`);
  }
}

main().catch(console.error);
