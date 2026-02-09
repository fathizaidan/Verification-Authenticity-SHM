// ===== PUBLIC USER APP - READ-ONLY SHM VERIFICATION =====
// This script allows anyone to verify SHM certificates without MetaMask

// ===== CONFIGURATION =====
// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

// TODO: Replace with your SHMRegistry ABI
const CONTRACT_ABI = [
    // Paste your SHMRegistry ABI here
    // Example minimal ABI for getSHM function:
    {
        "inputs": [{"internalType": "string", "name": "_certificateNumber", "type": "string"}],
        "name": "getSHM",
        "outputs": [
            {"internalType": "string", "name": "certificateNumber", "type": "string"},
            {"internalType": "string", "name": "ownerName", "type": "string"},
            {"internalType": "string", "name": "ownerNIK", "type": "string"},
            {"internalType": "bool", "name": "isVerified", "type": "bool"},
            {"internalType": "bool", "name": "isRevoked", "type": "bool"},
            {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// ===== GLOBAL VARIABLES =====
let provider;
let contract;

// ===== DOM ELEMENTS =====
const certNumberInput = document.getElementById('certNumber');
const searchBtn = document.getElementById('searchBtn');
const loadingState = document.getElementById('loadingState');
const resultCard = document.getElementById('resultCard');
const errorCard = document.getElementById('errorCard');
const statusBadge = document.getElementById('statusBadge');
const resultContent = document.getElementById('resultContent');
const errorMessage = document.getElementById('errorMessage');
const clearBtn = document.getElementById('clearBtn');
const clearErrorBtn = document.getElementById('clearErrorBtn');

// ===== INITIALIZATION =====
async function init() {
    try {
        // Create read-only provider (no MetaMask required)
        // Using Infura/Alchemy or public RPC endpoint
        // TODO: Replace with your RPC URL (e.g., Infura, Alchemy, or local node)
        provider = new ethers.providers.JsonRpcProvider("YOUR_RPC_URL_HERE");
        
        // Alternative: Use MetaMask provider if available (but not required)
        // if (typeof window.ethereum !== 'undefined') {
        //     provider = new ethers.providers.Web3Provider(window.ethereum);
        // }

        // Create contract instance (read-only)
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log('✅ Read-only connection established');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Gagal terhubung ke blockchain. Silakan refresh halaman.');
    }
}

// ===== SEARCH FUNCTION =====
async function searchSHM() {
    const certNumber = certNumberInput.value.trim();
    
    // Validation
    if (!certNumber) {
        showError('Mohon masukkan nomor sertifikat');
        return;
    }

    // Reset UI
    hideAllCards();
    showLoading();

    try {
        // Call smart contract (read-only)
        const shmData = await contract.getSHM(certNumber);
        
        // Check if SHM exists
        if (!shmData.ownerName || shmData.ownerName === '') {
            showError('Sertifikat tidak ditemukan di database blockchain');
            return;
        }

        // Display results
        displayResults(shmData);
        
    } catch (error) {
        console.error('❌ Search error:', error);
        
        if (error.message.includes('SHM not found')) {
            showError('Nomor sertifikat tidak terdaftar di blockchain');
        } else {
            showError('Terjadi kesalahan saat memverifikasi. Silakan coba lagi.');
        }
    }
}

// ===== DISPLAY RESULTS =====
function displayResults(data) {
    hideLoading();
    
    // Determine validity
    const isValid = !data.isRevoked && data.ownerName !== '';
    
    // Set status badge
    if (isValid) {
        statusBadge.className = 'status-badge valid';
        statusBadge.textContent = '✓ Terdaftar & Asli';
    } else {
        statusBadge.className = 'status-badge invalid';
        statusBadge.textContent = '✗ Tidak Valid / Dicabut';
    }

    // Format timestamp
    const createdDate = new Date(data.createdAt.toNumber() * 1000);
    const formattedDate = createdDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Build result HTML
    resultContent.innerHTML = `
        <div class="result-item">
            <span class="result-label">Nomor Sertifikat</span>
            <span class="result-value highlight">${data.certificateNumber}</span>
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
            <span class="result-value">${data.isVerified ? '✅ Terverifikasi' : '⏳ Menunggu Verifikasi'}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Status Pencabutan</span>
            <span class="result-value">${data.isRevoked ? '⛔ Dicabut' : '✅ Aktif'}</span>
        </div>
        <div class="result-item">
            <span class="result-label">Tanggal Registrasi</span>
            <span class="result-value">${formattedDate}</span>
        </div>
    `;

    // Show result card
    resultCard.style.display = 'block';
}

// ===== UI HELPER FUNCTIONS =====
function showLoading() {
    loadingState.style.display = 'block';
    searchBtn.disabled = true;
}

function hideLoading() {
    loadingState.style.display = 'none';
    searchBtn.disabled = false;
}

function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    errorCard.style.display = 'block';
}

function hideAllCards() {
    resultCard.style.display = 'none';
    errorCard.style.display = 'none';
}

function clearSearch() {
    certNumberInput.value = '';
    hideAllCards();
    certNumberInput.focus();
}

// ===== EVENT LISTENERS =====
searchBtn.addEventListener('click', searchSHM);

// Allow Enter key to search
certNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchSHM();
    }
});

clearBtn.addEventListener('click', clearSearch);
clearErrorBtn.addEventListener('click', clearSearch);

// ===== AUTO-INITIALIZE =====
window.addEventListener('load', () => {
    init();
    certNumberInput.focus();
});

// ===== HELPER: FORMAT ADDRESS =====
function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// ===== EXPORT FOR DEBUGGING =====
window.debugSHM = {
    contract,
    provider,
    searchSHM
};
