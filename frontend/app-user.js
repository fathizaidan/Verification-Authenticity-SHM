// ===== PUBLIC USER APP (READ-ONLY VIA BACKEND API) =====

const API_BASE = "http://localhost:3001";

// ===== DOM =====
const certNumberInput = document.getElementById("certNumber");
const searchBtn = document.getElementById("searchBtn");
const loadingState = document.getElementById("loadingState");
const resultCard = document.getElementById("resultCard");
const errorCard = document.getElementById("errorCard");
const statusBadge = document.getElementById("statusBadge");
const resultContent = document.getElementById("resultContent");
const errorMessage = document.getElementById("errorMessage");
const clearBtn = document.getElementById("clearBtn");
const clearErrorBtn = document.getElementById("clearErrorBtn");

// ===== API HELPER =====
async function postAPI(endpoint, payload) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ===== SEARCH SHM =====
async function searchSHM() {
  const certNumber = certNumberInput.value.trim();

  if (!certNumber) {
    showError("Nomor sertifikat wajib diisi");
    return;
  }

  hideAll();
  showLoading();

  try {
    const res = await postAPI("view", { certNumber });

    if (!res.success) {
      showError("Sertifikat tidak ditemukan atau belum terdaftar");
      return;
    }

    showResult(res.data);
  } catch (err) {
    console.error(err);
    showError("Gagal menghubungi server verifikasi");
  }
}

// ===== SHOW RESULT =====
function showResult(data) {
  hideLoading();

  // Status
  if (data.isRevoked) {
    statusBadge.className = "status-badge invalid";
    statusBadge.textContent = "✗ Sertifikat Dicabut";
  } else if (data.isVerified) {
    statusBadge.className = "status-badge valid";
    statusBadge.textContent = "✓ Terverifikasi & Sah";
  } else {
    statusBadge.className = "status-badge pending";
    statusBadge.textContent = "⏳ Belum Diverifikasi";
  }

  resultContent.innerHTML = `
    <div class="result-item">
      <span class="result-label">Nomor Sertifikat</span>
      <span class="result-value highlight">${data.certNumber}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Nama Pemilik</span>
      <span class="result-value">${data.ownerName}</span>
    </div>
    <div class="result-item">
      <span class="result-label">NIK Pemilik</span>
      <span class="result-value">${data.ownerNIK}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Status Verifikasi</span>
      <span class="result-value">
        ${data.isVerified ? "✅ Terverifikasi" : "⏳ Belum Diverifikasi"}
      </span>
    </div>
  `;

  resultCard.style.display = "block";
}

// ===== UI HELPERS =====
function showLoading() {
  loadingState.style.display = "block";
  searchBtn.disabled = true;
}

function hideLoading() {
  loadingState.style.display = "none";
  searchBtn.disabled = false;
}

function showError(msg) {
  hideLoading();
  errorMessage.textContent = msg;
  errorCard.style.display = "block";
}

function hideAll() {
  resultCard.style.display = "none";
  errorCard.style.display = "none";
}

function clearAll() {
  certNumberInput.value = "";
  hideAll();
  certNumberInput.focus();
}

// ===== EVENTS =====
searchBtn.addEventListener("click", searchSHM);

certNumberInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchSHM();
});

clearBtn.addEventListener("click", clearAll);
clearErrorBtn.addEventListener("click", clearAll);

window.addEventListener("load", () => {
  certNumberInput.focus();
});
