// ===== ADMIN APP (NO METAMASK, VIA BACKEND API) =====

const API_BASE = "http://localhost:3001";

// ===== DOM =====
const navItems = document.querySelectorAll(".nav-item");
const contentSections = document.querySelectorAll(".content-section");
const txToast = document.getElementById("txToast");

// ===== NAVIGATION =====
function switchSection(sectionId) {
  contentSections.forEach((s) => s.classList.remove("active"));
  navItems.forEach((n) => n.classList.remove("active"));

  document.getElementById(`${sectionId}-section`)?.classList.add("active");

  const titles = {
    register: "Registrasi SHM Baru",
    verify: "Verifikasi SHM",
    update: "Update Data Pemilik",
    revoke: "Cabut SHM",
    view: "Lihat Data SHM",
    history: "Riwayat Transaksi",
  };

  document.getElementById("pageTitle").textContent =
    titles[sectionId] || "Dashboard Admin";
}

// ===== API HELPER =====
async function postAPI(endpoint, payload) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
}

// ===== REGISTER SHM =====
async function registerSHM(certNumber, ownerName, ownerNIK) {
  showToast("info", "Mengirim data", "Memproses ke blockchain...");

  const res = await postAPI("register", {
    certNumber,
    ownerName,
    ownerNIK,
  });

  if (res.success) {
    showToast("success", "SHM terdaftar", `Tx: ${res.txHash}`);
    document.getElementById("registerForm").reset();
  } else {
    showToast("error", "Gagal", res.error);
  }
}

// ===== VERIFY =====
async function verifySHM(certNumber) {
  const res = await postAPI("verify", { certNumber });
  res.success
    ? showToast("success", "Terverifikasi", res.txHash)
    : showToast("error", "Gagal", res.error);
}

// ===== UPDATE OWNER =====
async function updateOwner(certNumber, ownerName, ownerNIK) {
  const res = await postAPI("update", {
    certNumber,
    ownerName,
    ownerNIK,
  });

  res.success
    ? showToast("success", "Berhasil diupdate", res.txHash)
    : showToast("error", "Gagal", res.error);
}

// ===== REVOKE =====
async function revokeSHM(certNumber) {
  if (!confirm("Yakin ingin mencabut SHM ini?")) return;

  const res = await postAPI("revoke", { certNumber });

  res.success
    ? showToast("success", "SHM dicabut", res.txHash)
    : showToast("error", "Gagal", res.error);
}

// ===== VIEW =====
async function viewSHM(certNumber) {
  const res = await postAPI("view", { certNumber });

  if (!res.success) {
    alert("Data tidak ditemukan");
    return;
  }

  const d = res.data;
  document.getElementById("viewResult").innerHTML = `
    <p><b>Nama:</b> ${d.ownerName}</p>
    <p><b>NIK:</b> ${d.ownerNIK}</p>
    <p><b>Status:</b> ${d.isVerified ? "Terverifikasi" : "Belum"}</p>
  `;
  document.getElementById("viewResult").style.display = "block";
}

// ===== HISTORY =====
async function viewHistory(certNumber) {
  const res = await postAPI("history", { certNumber });

  if (!res.success) {
    alert("Tidak ada riwayat");
    return;
  }

  let html = "<ul>";
  res.data.forEach((h) => {
    html += `<li>${h.action} (${new Date(
      h.timestamp * 1000
    ).toLocaleString()})</li>`;
  });
  html += "</ul>";

  document.getElementById("historyResult").innerHTML = html;
  document.getElementById("historyResult").style.display = "block";
}

// ===== FORM HANDLERS =====
document.getElementById("registerForm").onsubmit = (e) => {
  e.preventDefault();
  registerSHM(reg_certNumber.value, reg_ownerName.value, reg_ownerNIK.value);
};

document.getElementById("verifyForm").onsubmit = (e) => {
  e.preventDefault();
  verifySHM(verify_certNumber.value);
};

document.getElementById("updateForm").onsubmit = (e) => {
  e.preventDefault();
  updateOwner(
    update_certNumber.value,
    update_ownerName.value,
    update_ownerNIK.value
  );
};

document.getElementById("revokeForm").onsubmit = (e) => {
  e.preventDefault();
  revokeSHM(revoke_certNumber.value);
};

document.getElementById("viewForm").onsubmit = (e) => {
  e.preventDefault();
  viewSHM(view_certNumber.value);
};

document.getElementById("historyForm").onsubmit = (e) => {
  e.preventDefault();
  viewHistory(history_certNumber.value);
};

// ===== NAV =====
navItems.forEach((item) =>
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    switchSection(item.dataset.section);
  })
);

// ===== TOAST =====
function showToast(type, title, msg) {
  txToast.querySelector(
    ".tx-toast-message"
  ).innerHTML = `<b>${title}</b><br>${msg}`;
  txToast.classList.add("show");
  setTimeout(() => txToast.classList.remove("show"), 4000);
}
