import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const result = await contract.getHistory("SHM001");

  const actions = result[0];
  const actors = result[1];
  const owners = result[2];
  const niks = result[3];
  const times = result[4];

  console.log("HISTORY SHM001:\n");

  for (let i = 0; i < actions.length; i++) {
    const date = new Date(Number(times[i]) * 1000);

    console.log(`${i + 1}. ${actions[i]}`);
    console.log(`   Owner : ${owners[i]}`);
    console.log(`   NIK   : ${niks[i]}`);
    console.log(`   By    : ${actors[i]}`);
    console.log(`   At    : ${date.toLocaleString()}`);
    console.log("");
  }
}

main().catch(console.error);
