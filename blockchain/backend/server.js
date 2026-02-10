const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const ABI = require("./SHMRegistry.json");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 RPC SEPOLIA (Alchemy / Infura)
const provider = new ethers.JsonRpcProvider(
  "https://eth-sepolia.g.alchemy.com/v2/API_KEY_ANDA"
);

// 🔐 ADMIN PRIVATE KEY (TANPA METAMASK UI)
const wallet = new ethers.Wallet("PRIVATE_KEY_ANDA", provider);

// 📦 CONTRACT
const CONTRACT_ADDRESS = "ADDRESS_HASIL_DEPLOY";
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ================= API =================

app.post("/register", async (req, res) => {
  try {
    const { certNumber, ownerName, ownerNIK } = req.body;

    const tx = await contract.registerSHM(
      certNumber,
      "CID",
      ethers.keccak256(ethers.toUtf8Bytes(certNumber)),
      ownerName,
      ownerNIK
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: receipt.hash,
      etherscan: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(3001, () =>
  console.log("🚀 Backend Ethereum aktif (tanpa MetaMask)")
);
