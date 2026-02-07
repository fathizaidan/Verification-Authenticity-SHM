import hre from "hardhat";
const { ethers } = hre;
import { CONTRACT_ADDRESS } from "./config.js";

async function main() {
  const Factory = await ethers.getContractFactory("SHMRegistry");
  const contract = Factory.attach(CONTRACT_ADDRESS);

  const tx = await contract.revokeSHM("SHM001");
  await tx.wait();

  console.log("SHM REVOKED");
}

main().catch(console.error);
