const { task } = require("hardhat/config");
const { CONTRACT_ADDRESS } = require("./config");

task("history", "Show SHM audit trail")
  .addParam("cert", "Certificate number")
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
