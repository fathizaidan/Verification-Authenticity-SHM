require("@nomicfoundation/hardhat-toolbox");
const { task } = require("hardhat/config");
const { CONTRACT_ADDRESS } = require("./scripts/config.js");

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

    console.log("OWNER UPDATED");
  });

// =======================
// TASK: SET ROLE
// =======================
task("setRole", "Set role for user")
  .addParam("user")
  .addParam("role")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const [signer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SHMRegistry", signer);
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const tx = await contract.setRole(args.user, args.role);
    await tx.wait();

    console.log("ROLE UPDATED");
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

    const data = await contract.getSHM(args.cert);

    console.log("\nSHM VERIFIED");
    console.log("Cert    :", data[0]);
    console.log("CID     :", data[1]);
    console.log("Hash    :", data[2]);
    console.log("Owner   :", data[3]);
    console.log("NIK     :", data[4]);
    console.log("Verified:", data[5]);
  });

// =======================
// TASK: HISTORY / AUDIT TRAIL
// =======================
task("history", "Show SHM audit trail")
  .addParam("cert")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const Factory = await ethers.getContractFactory("SHMRegistry");
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const result = await contract.getHistory(args.cert);

    const actions = result[0];
    const actors = result[1];
    const owners = result[2];
    const niks = result[3];
    const times = result[4];

    console.log(`\n📜 HISTORY ${args.cert}\n`);

    for (let i = 0; i < actions.length; i++) {
      const date = new Date(Number(times[i]) * 1000);
      console.log(`${i + 1}. ${actions[i]}`);
      console.log(`   Owner : ${owners[i]}`);
      console.log(`   NIK   : ${niks[i]}`);
      console.log(`   By    : ${actors[i]}`);
      console.log(`   At    : ${date.toLocaleString()}`);
      console.log("");
    }
  });

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337, // ✅ ini sudah benar untuk Ganache
    },
  },
};
