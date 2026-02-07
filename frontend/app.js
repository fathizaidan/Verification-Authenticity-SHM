// Contract addresses (update these after deployment)
const SHM_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example, replace with actual
const CERTIFICATE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Example, replace with actual

// ABIs (simplified from TypeChain)
const SHM_REGISTRY_ABI = [
  "function registerSHM(string certNumber, string cid, bytes32 documentHash, string ownerName, string ownerNIK) public",
  "function verifySHM(string certNumber) public",
  "function revokeSHM(string certNumber) public",
  "function updateOwner(string certNumber, string newOwner, string newNIK) public",
  "function getSHM(string certNumber) public view returns (string, string, bytes32, string, string, bool, bool, uint256)",
  "function getHistory(string certNumber) public view returns (string[] actions, address[] actors, string[] owners, string[] niks, uint256[] timestamps)",
  "function setRole(address user, uint8 role) public",
  "function roles(address) public view returns (uint8)",
];

const CERTIFICATE_ABI = [
  "function storeCertificate(string certNumber, string hashData) public",
  "function getCertificate(string certNumber) public view returns (string)",
  "function verifyCertificate(string certNumber, string hashData) public view returns (bool)",
];

let provider, signer, shmContract, certContract;

async function connectMetaMask() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      document.getElementById("accountInfo").innerText =
        `Connected: ${address}`;
      document.getElementById("connectButton").innerText = "Connected";

      // Initialize contracts
      shmContract = new ethers.Contract(
        SHM_REGISTRY_ADDRESS,
        SHM_REGISTRY_ABI,
        signer,
      );
      certContract = new ethers.Contract(
        CERTIFICATE_ADDRESS,
        CERTIFICATE_ABI,
        signer,
      );

      showResult("MetaMask connected successfully!");
    } catch (error) {
      showResult("Error connecting to MetaMask: " + error.message);
    }
  } else {
    showResult("MetaMask not installed. Please install MetaMask.");
  }
}

function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => section.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

async function computeHash(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return "0x" + hashHex;
}

document
  .getElementById("connectButton")
  .addEventListener("click", connectMetaMask);

// Register SHM
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const certNumber = document.getElementById("certNumber").value;
    const cid = document.getElementById("cid").value;
    const file = document.getElementById("documentFile").files[0];
    const ownerName = document.getElementById("ownerName").value;
    const ownerNIK = document.getElementById("ownerNIK").value;

    if (!file) {
      showResult("Please select a document file.");
      return;
    }

    try {
      const documentHash = await computeHash(file);
      const tx = await shmContract.registerSHM(
        certNumber,
        cid,
        documentHash,
        ownerName,
        ownerNIK,
      );
      await tx.wait();
      showResult(`SHM registered successfully! TX: ${tx.hash}`);
    } catch (error) {
      showResult("Error registering SHM: " + error.message);
    }
  });

// Verify SHM
document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const certNumber = document.getElementById("verifyCertNumber").value;

  try {
    const tx = await shmContract.verifySHM(certNumber);
    await tx.wait();
    showResult(`SHM verified successfully! TX: ${tx.hash}`);
  } catch (error) {
    showResult("Error verifying SHM: " + error.message);
  }
});

// Revoke SHM
document.getElementById("revokeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const certNumber = document.getElementById("revokeCertNumber").value;

  try {
    const tx = await shmContract.revokeSHM(certNumber);
    await tx.wait();
    showResult(`SHM revoked successfully! TX: ${tx.hash}`);
  } catch (error) {
    showResult("Error revoking SHM: " + error.message);
  }
});

// Update Owner
document
  .getElementById("updateOwnerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const certNumber = document.getElementById("updateCertNumber").value;
    const newOwner = document.getElementById("newOwnerName").value;
    const newNIK = document.getElementById("newOwnerNIK").value;

    try {
      const tx = await shmContract.updateOwner(certNumber, newOwner, newNIK);
      await tx.wait();
      showResult(`Owner updated successfully! TX: ${tx.hash}`);
    } catch (error) {
      showResult("Error updating owner: " + error.message);
    }
  });

// View SHM
document.getElementById("viewSHMForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const certNumber = document.getElementById("viewCertNumber").value;

  try {
    const shm = await shmContract.getSHM(certNumber);
    document.getElementById("shmDetails").innerHTML = `
            <p>Cert Number: ${shm[0]}</p>
            <p>CID: ${shm[1]}</p>
            <p>Document Hash: ${shm[2]}</p>
            <p>Owner Name: ${shm[3]}</p>
            <p>Owner NIK: ${shm[4]}</p>
            <p>Verified: ${shm[5]}</p>
            <p>Revoked: ${shm[6]}</p>
            <p>Created At: ${new Date(Number(shm[7]) * 1000).toLocaleString()}</p>
        `;
  } catch (error) {
    showResult("Error viewing SHM: " + error.message);
  }
});

// View History
document
  .getElementById("viewHistoryForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const certNumber = document.getElementById("historyCertNumber").value;

    try {
      const history = await shmContract.getHistory(certNumber);
      let html = "<ul>";
      for (let i = 0; i < history.actions.length; i++) {
        html += `<li>${history.actions[i]} by ${history.actors[i]} at ${new Date(Number(history.timestamps[i]) * 1000).toLocaleString()} - Owner: ${history.owners[i]}, NIK: ${history.niks[i]}</li>`;
      }
      html += "</ul>";
      document.getElementById("historyDetails").innerHTML = html;
    } catch (error) {
      showResult("Error viewing history: " + error.message);
    }
  });

// Set Role
document.getElementById("setRoleForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userAddress = document.getElementById("userAddress").value;
  const role = document.getElementById("role").value;

  try {
    const tx = await shmContract.setRole(userAddress, role);
    await tx.wait();
    showResult(`Role set successfully! TX: ${tx.hash}`);
  } catch (error) {
    showResult("Error setting role: " + error.message);
  }
});

function showResult(message) {
  document.getElementById("results").innerText = message;
}
