const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const contractJson = require("../artifacts/contracts/SHMRegistry.sol/SHMRegistry.json");
const ABI = contractJson.abi;

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔗 GANACHE RPC
// ============================
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// ============================
// 🔐 ADMIN WALLET (GANACHE)
// ============================
const ADMIN_PRIVATE_KEY =
  "0xe580c13cf5464210dcec77afbe4fd57890c89144c2859688edfe03fc4ea2b095";
const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

// ============================
// 📦 CONTRACT
// ============================
const CONTRACT_ADDRESS = "0xD6299Ac445cc67577D41103EdD7D4E3e45B2b975";
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

console.log("👤 Admin Wallet :", wallet.address);
console.log("📦 Contract     :", CONTRACT_ADDRESS);

// ============================
// 📝 REGISTER SHM
// ============================
app.post("/register", async (req, res) => {
  try {
    const { certNumber, ownerName, ownerNIK } = req.body;

    if (!certNumber || !ownerName || !ownerNIK) {
      return res.json({ success: false, error: "Data tidak lengkap" });
    }

    const documentHash = ethers.keccak256(ethers.toUtf8Bytes(certNumber));
    const cid = `CID-${certNumber}`;

    const tx = await contract.registerSHM(
      certNumber,
      cid,
      documentHash,
      ownerName,
      ownerNIK
    );
    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: receipt.hash,
    });
  } catch (e) {
    let message = "Registrasi gagal";
    if (e.reason) message = e.reason;
    res.json({ success: false, error: message });
  }
});

// ============================
// ✅ VERIFY SHM
// ============================
app.post("/verify", async (req, res) => {
  try {
    const { certNumber } = req.body;

    const tx = await contract.verifySHM(certNumber);
    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: receipt.hash,
    });
  } catch (e) {
    let message = "Verifikasi gagal";
    if (e.reason) message = e.reason;
    res.json({ success: false, error: message });
  }
});

// ============================
// 🔁 UPDATE OWNER
// ============================
app.post("/update", async (req, res) => {
  try {
    const { certNumber, ownerName, ownerNIK } = req.body;

    const tx = await contract.updateOwner(certNumber, ownerName, ownerNIK);
    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: receipt.hash,
    });
  } catch (e) {
    let message = "Update gagal";
    if (e.reason) message = e.reason;
    res.json({ success: false, error: message });
  }
});

// ============================
// ⛔ REVOKE SHM
// ============================
app.post("/revoke", async (req, res) => {
  try {
    const { certNumber } = req.body;

    const tx = await contract.revokeSHM(certNumber);
    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: receipt.hash,
    });
  } catch (e) {
    let message = "Pencabutan gagal";
    if (e.reason) message = e.reason;
    res.json({ success: false, error: message });
  }
});

// ============================
// 🔍 VIEW SHM (FIX)
// ============================
app.post("/view", async (req, res) => {
  try {
    const { certNumber } = req.body;

    const data = await contract.getSHM(certNumber);

    // ⛔ data kosong (string pertama kosong)
    if (!data[0] || data[0] === "") {
      return res.json({
        success: false,
        error: "Data tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: {
        certNumber: data[0],
        cid: data[1],
        documentHash: data[2],
        ownerName: data[3],
        ownerNIK: data[4],
        isVerified: data[5],
        isRevoked: data[6], // 🔑 INI YANG BIKIN ERROR SEBELUMNYA
      },
    });
  } catch (e) {
    console.error("View Error Detail:", e.message);
    res.json({
      success: false,
      error: "Gagal membaca data SHM",
    });
  }
});

// ============================
// 📜 HISTORY (FIX)
// ============================
app.post("/history", async (req, res) => {
  try {
    const { certNumber } = req.body;

    if (!certNumber) {
      return res.json({
        success: false,
        error: "Nomor sertifikat wajib diisi",
      });
    }

    const [actions, actors, owners, niks, times] = await contract.getHistory(
      certNumber
    );

    // 🔑 kalau belum pernah ada aksi sama sekali
    if (!actions || actions.length === 0) {
      return res.json({
        success: false,
        error: "Riwayat tidak tersedia",
      });
    }

    const history = actions.map((a, i) => ({
      action: a,
      actor: actors[i],
      owner: owners[i],
      nik: niks[i],
      timestamp: Number(times[i]),
    }));

    res.json({
      success: true,
      data: history,
    });
  } catch (e) {
    res.json({
      success: false,
      error: "Riwayat tidak tersedia",
    });
  }
});

// ============================
// 🚀 START SERVER
// ============================
app.listen(3001, () => {
  console.log("🚀 Backend SHM aktif (GANACHE)");
  console.log("🌐 http://localhost:3001");
});
