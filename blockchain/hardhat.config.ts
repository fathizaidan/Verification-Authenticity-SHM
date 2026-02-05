import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";

task("updateOwner", "Update owner SHM")
  .addParam("cert")
  .addParam("owner")
  .addParam("nik")
  .setAction(async (args, hre) => {
    const { ethers } = hre;

    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    const [signer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SHMRegistry", signer);
    const contract = Factory.attach(CONTRACT_ADDRESS);

    const tx = await contract.updateOwner(args.cert, args.owner, args.nik);
    await tx.wait();

    console.log("OWNER UPDATED");
  });

export default {
  solidity: "0.8.20",
};
