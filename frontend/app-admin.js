// ===== ADMIN APP - FULL SHM MANAGEMENT WITH METAMASK =====
// This script handles all write operations requiring wallet connection

// ===== CONFIGURATION =====
// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

// TODO: Replace with your complete SHMRegistry ABI
const CONTRACT_ABI = [
    // Paste your complete SHMRegistry ABI here
    // Must include: registerSHM, verifySHM, revokeSHM, updateOwner, getSHM, getSHMHistory
    // Example structure:
    /*
    {
        "inputs": [...],
        "name": "registerSHM",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [...],
        "name": "verifySHM",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ... etc
    */
];

// ===== GLOBAL VARIABLES =====
let provider;
let signer;
let contract;
let userAddress;

// ===== DOM ELEMENTS =====
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletStatus = document.getElementById('walletStatus');
const txToast = document.getElementById('txToast');
const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

// ===== WALLET CONNECTION =====
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert('MetaMask tidak terdeteksi! Silakan install MetaMask terlebih dahulu.');
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Create contract instance with signer
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Update UI
        updateWalletUI();
        
        console.log('✅ Wallet connected:', userAddress);
        showToast('success', 'Wallet terhubung!', `Alamat: ${formatAddress(userAddress)}`);
        
    } catch (error) {
        console.error('❌ Connection error:', error);
        showToast('error', 'Koneksi gagal', 'Silakan coba lagi');
    }
}

// ===== UPDATE WALLET UI =====
function updateWalletUI() {
    walletStatus.innerHTML = `
        <div class="wallet-connected">
            <div class="status-dot"></div>
            <span class="wallet-address">${formatAddress(userAddress)}</span>
        </div>
    `;
}

// ===== NAVIGATION =====
function switchSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav items
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'register': 'Registrasi SHM Baru',
        'verify': 'Verifikasi SHM',
        'update': 'Update Data Pemilik',
        'revoke': 'Cabut SHM',
        'view': 'Lihat Data SHM',
        'history': 'Riwayat Transaksi'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard Admin';
}

// ===== CHECK WALLET CONNECTION =====
function requireWallet() {
    if (!contract || !userAddress) {
        alert('Silakan hubungkan wallet terlebih dahulu!');
        return false;
    }
    return true;
}

// ===== 1. REGISTER SHM =====
async function registerSHM(certNumber, ownerName, ownerNIK) {
    if (!requireWallet()) return;
    
    try {
        showToast('info', 'Mengirim transaksi...', 'Mohon konfirmasi di MetaMask');
        
        // Call contract function
        const tx = await contract.registerSHM(certNumber, ownerName, ownerNIK);
        
        showToast('info', 'Transaksi dikirim', 'Menunggu konfirmasi blockchain...');
        
        // Wait for confirmation
        const receipt = await tx.wait();
        
        console.log('✅ SHM registered:', receipt);
        showToast('success', 'SHM berhasil didaftarkan!', `Tx: ${formatAddress(receipt.transactionHash)}`);
        
        // Reset form
        document.getElementById('registerForm').reset();
        
    } catch (error) {
        console.error('❌ Register error:', error);
        handleTransactionError(error);
    }
}

// ===== 2. VERIFY SHM =====
async function verifySHM(certNumber) {
    if (!requireWallet()) return;
    
    try {
        showToast('info', 'Mengirim transaksi...', 'Mohon konfirmasi di MetaMask');
        
        const tx = await contract.verifySHM(certNumber);
        
        showToast('info', 'Transaksi dikirim', 'Menunggu konfirmasi blockchain...');
        
        const receipt = await tx.wait();
        
        console.log('✅ SHM verified:', receipt);
        showToast('success', 'SHM berhasil diverifikasi!', `Tx: ${formatAddress(receipt.transactionHash)}`);
        
        document.getElementById('verifyForm').reset();
        
    } catch (error) {
        console.error('❌ Verify error:', error);
        handleTransactionError(error);
    }
}

// ===== 3. UPDATE OWNER =====
async function updateOwner(certNumber, newOwnerName, newOwnerNIK) {
    if (!requireWallet()) return;
    
    try {
        showToast('info', 'Mengirim transaksi...', 'Mohon konfirmasi di MetaMask');
        
        const tx = await contract.updateOwner(certNumber, newOwnerName, newOwnerNIK);
        
        showToast('info', 'Transaksi dikirim', 'Menunggu konfirmasi blockchain...');
        
        const receipt = await tx.wait();
        
        console.log('✅ Owner updated:', receipt);
        showToast('success', 'Data pemilik berhasil diupdate!', `Tx: ${formatAddress(receipt.transactionHash)}`);
        
        document.getElementById('updateForm').reset();
        
    } catch (error) {
        console.error('❌ Update error:', error);
        handleTransactionError(error);
    }
}

// ===== 4. REVOKE SHM =====
async function revokeSHM(certNumber) {
    if (!requireWallet()) return;
    
    // Confirmation
    const confirm = window.confirm(`⚠️ PERINGATAN\n\nAnda akan MENCABUT sertifikat:\n${certNumber}\n\nTindakan ini bersifat PERMANEN di blockchain.\n\nLanjutkan?`);
    
    if (!confirm) {
        return;
    }
    
    try {
        showToast('info', 'Mengirim transaksi...', 'Mohon konfirmasi di MetaMask');
        
        const tx = await contract.revokeSHM(certNumber);
        
        showToast('info', 'Transaksi dikirim', 'Menunggu konfirmasi blockchain...');
        
        const receipt = await tx.wait();
        
        console.log('✅ SHM revoked:', receipt);
        showToast('success', 'SHM berhasil dicabut!', `Tx: ${formatAddress(receipt.transactionHash)}`);
        
        document.getElementById('revokeForm').reset();
        
    } catch (error) {
        console.error('❌ Revoke error:', error);
        handleTransactionError(error);
    }
}

// ===== 5. VIEW SHM =====
async function viewSHM(certNumber) {
    if (!requireWallet()) return;
    
    try {
        const viewResult = document.getElementById('viewResult');
        viewResult.style.display = 'none';
        
        // Call read function
        const data = await contract.getSHM(certNumber);
        
        if (!data.ownerName || data.ownerName === '') {
            alert('SHM tidak ditemukan!');
            return;
        }
        
        // Format date
        const createdDate = new Date(data.createdAt.toNumber() * 1000);
        const formattedDate = createdDate.toLocaleString('id-ID');
        
        // Display data
        viewResult.innerHTML = `
            <h3>Detail Sertifikat</h3>
            <div class="data-grid">
                <div class="data-row">
                    <span class="data-label">Nomor Sertifikat</span>
                    <span class="data-value">${data.certificateNumber}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Nama Pemilik</span>
                    <span class="data-value">${data.ownerName}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">NIK Pemilik</span>
                    <span class="data-value">${data.ownerNIK}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Status Verifikasi</span>
                    <span class="data-value">${data.isVerified ? '✅ Terverifikasi' : '⏳ Belum Diverifikasi'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Status Pencabutan</span>
                    <span class="data-value">${data.isRevoked ? '⛔ Dicabut' : '✅ Aktif'}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Tanggal Dibuat</span>
                    <span class="data-value">${formattedDate}</span>
                </div>
            </div>
        `;
        
        viewResult.style.display = 'block';
        
    } catch (error) {
        console.error('❌ View error:', error);
        alert('Gagal mengambil data SHM. Pastikan nomor sertifikat benar.');
    }
}

// ===== 6. VIEW HISTORY =====
async function viewHistory(certNumber) {
    if (!requireWallet()) return;
    
    try {
        const historyResult = document.getElementById('historyResult');
        historyResult.style.display = 'none';
        
        // Call contract function (if your contract has getSHMHistory)
        // If not, you can listen to events instead
        const history = await contract.getSHMHistory(certNumber);
        
        if (!history || history.length === 0) {
            alert('Tidak ada riwayat untuk sertifikat ini');
            return;
        }
        
        // Build history HTML
        let historyHTML = '<h3>Riwayat Transaksi</h3><div class="history-list">';
        
        history.forEach((item, index) => {
            const date = new Date(item.timestamp.toNumber() * 1000).toLocaleString('id-ID');
            
            historyHTML += `
                <div class="history-item">
                    <h4>#${index + 1} - ${item.action}</h4>
                    <p class="history-meta">
                        <strong>Oleh:</strong> ${formatAddress(item.actor)}<br>
                        <strong>Waktu:</strong> ${date}
                    </p>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        
        historyResult.innerHTML = historyHTML;
        historyResult.style.display = 'block';
        
    } catch (error) {
        console.error('❌ History error:', error);
        
        // Fallback: Just show a message
        const historyResult = document.getElementById('historyResult');
        historyResult.innerHTML = `
            <div class="warning-banner">
                ℹ️ Fitur riwayat memerlukan fungsi <code>getSHMHistory</code> di smart contract.
                Jika belum tersedia, Anda dapat menggunakan event logs dari blockchain explorer.
            </div>
        `;
        historyResult.style.display = 'block';
    }
}

// ===== FORM SUBMISSIONS =====
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const certNumber = document.getElementById('reg_certNumber').value.trim();
    const ownerName = document.getElementById('reg_ownerName').value.trim();
    const ownerNIK = document.getElementById('reg_ownerNIK').value.trim();
    
    if (ownerNIK.length !== 16) {
        alert('NIK harus 16 digit!');
        return;
    }
    
    registerSHM(certNumber, ownerName, ownerNIK);
});

document.getElementById('verifyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const certNumber = document.getElementById('verify_certNumber').value.trim();
    verifySHM(certNumber);
});

document.getElementById('updateForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const certNumber = document.getElementById('update_certNumber').value.trim();
    const ownerName = document.getElementById('update_ownerName').value.trim();
    const ownerNIK = document.getElementById('update_ownerNIK').value.trim();
    
    if (ownerNIK.length !== 16) {
        alert('NIK harus 16 digit!');
        return;
    }
    
    updateOwner(certNumber, ownerName, ownerNIK);
});

document.getElementById('revokeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const certNumber = document.getElementById('revoke_certNumber').value.trim();
    revokeSHM(certNumber);
});

document.getElementById('viewForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const certNumber = document.getElementById('view_certNumber').value.trim();
    viewSHM(certNumber);
});

document.getElementById('historyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const certNumber = document.getElementById('history_certNumber').value.trim();
    viewHistory(certNumber);
});

// ===== TOAST NOTIFICATIONS =====
function showToast(type, title, message) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    const toastIcon = txToast.querySelector('.tx-toast-icon');
    const toastMessage = txToast.querySelector('.tx-toast-message');
    
    toastIcon.textContent = icons[type] || 'ℹ️';
    toastMessage.innerHTML = `
        <strong>${title}</strong>
        <small>${message}</small>
    `;
    
    txToast.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        txToast.classList.remove('show');
    }, 5000);
}

// ===== ERROR HANDLER =====
function handleTransactionError(error) {
    if (error.code === 4001) {
        showToast('warning', 'Transaksi dibatalkan', 'Anda menolak transaksi di MetaMask');
    } else if (error.message.includes('insufficient funds')) {
        showToast('error', 'Saldo tidak cukup', 'Gas fee Anda tidak mencukupi');
    } else {
        showToast('error', 'Transaksi gagal', error.message.substring(0, 50) + '...');
    }
}

// ===== HELPER FUNCTIONS =====
function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// ===== EVENT LISTENERS =====
connectWalletBtn.addEventListener('click', connectWallet);

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        switchSection(section);
    });
});

// ===== AUTO-CONNECT ON PAGE LOAD =====
window.addEventListener('load', async () => {
    // Check if wallet was previously connected
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                // Auto-connect
                await connectWallet();
            }
        } catch (error) {
            console.log('No previous wallet connection');
        }
    }
    
    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // User disconnected
                location.reload();
            } else {
                // Account changed
                connectWallet();
            }
        });
        
        window.ethereum.on('chainChanged', () => {
            // Chain changed, reload page
            location.reload();
        });
    }
});

// ===== EXPORT FOR DEBUGGING =====
window.debugAdmin = {
    contract,
    provider,
    signer,
    userAddress
};
