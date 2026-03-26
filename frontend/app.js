// ============================================================
//  CONFIG — Adresse du contrat déployé
// ============================================================
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ============================================================
//  ABI du contrat RentalContract
// ============================================================
const ABI = [
  {
    "inputs": [
      { "internalType": "address payable", "name": "_tenant", "type": "address" },
      { "internalType": "uint256", "name": "_monthlyRent", "type": "uint256" },
      { "internalType": "uint256", "name": "_depositMonths", "type": "uint256" },
      { "internalType": "uint256", "name": "_durationMonths", "type": "uint256" },
      { "internalType": "uint256", "name": "_penaltyRate", "type": "uint256" },
      { "internalType": "string", "name": "_propertyDescription", "type": "string" }
    ],
    "name": "createLease",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_leaseId", "type": "uint256" }],
    "name": "payDeposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_leaseId", "type": "uint256" }],
    "name": "payRent",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_leaseId", "type": "uint256" },
      { "internalType": "string", "name": "_reason", "type": "string" }
    ],
    "name": "terminateLease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_leaseId", "type": "uint256" },
      { "internalType": "uint256", "name": "_deductions", "type": "uint256" }
    ],
    "name": "returnDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_leaseId", "type": "uint256" }],
    "name": "calculateAmountDue",
    "outputs": [
      { "internalType": "uint256", "name": "rentAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "penaltyAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "daysLate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_leaseId", "type": "uint256" }],
    "name": "getLeaseDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address payable", "name": "landlord", "type": "address" },
          { "internalType": "address payable", "name": "tenant", "type": "address" },
          { "internalType": "uint256", "name": "monthlyRent", "type": "uint256" },
          { "internalType": "uint256", "name": "depositAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "penaltyRate", "type": "uint256" },
          { "internalType": "uint256", "name": "startDate", "type": "uint256" },
          { "internalType": "uint256", "name": "endDate", "type": "uint256" },
          { "internalType": "uint256", "name": "nextPaymentDue", "type": "uint256" },
          { "internalType": "uint256", "name": "depositPaid", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPaid", "type": "uint256" },
          { "internalType": "uint256", "name": "lastPaymentDate", "type": "uint256" },
          { "internalType": "enum RentalContract.ContractState", "name": "state", "type": "uint8" },
          { "internalType": "string", "name": "propertyDescription", "type": "string" },
          { "internalType": "bool", "name": "depositReturned", "type": "bool" }
        ],
        "internalType": "struct RentalContract.Lease",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_leaseId", "type": "uint256" }],
    "name": "isRentLate",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_landlord", "type": "address" }],
    "name": "getLandlordLeases",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_tenant", "type": "address" }],
    "name": "getTenantLeases",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "leaseId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "landlord", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "monthlyRent", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "startDate", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "endDate", "type": "uint256" }
    ],
    "name": "LeaseCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "leaseId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "penalty", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "RentPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "leaseId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "initiator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "LeaseTerminated",
    "type": "event"
  }
];

// ============================================================
//  VARIABLES GLOBALES
// ============================================================
let provider, signer, contract;

// ============================================================
//  FONCTIONS UTILITAIRES
// ============================================================
function log(msg, type = "info") {
  const div = document.getElementById("log");
  const entry = document.createElement("div");
  entry.className = `log-entry log-${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  div.prepend(entry);
}

function showLoading(btn, text = "En cours...") {
  btn.disabled = true;
  btn.dataset.original = btn.textContent;
  btn.textContent = text;
}

function hideLoading(btn) {
  btn.disabled = false;
  btn.textContent = btn.dataset.original;
}

// ============================================================
//  CONNEXION WALLET
// ============================================================
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask n'est pas installé ! Installez-le sur https://metamask.io");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    document.getElementById("walletInfo").innerHTML = `
      ✅ <strong>${address.slice(0,6)}...${address.slice(-4)}</strong> 
      | ${parseFloat(ethers.utils.formatEther(balance)).toFixed(4)} ETH 
      | Réseau: ${network.name} (${network.chainId})
    `;
    document.getElementById("connectBtn").textContent = "✅ Connecté";
    document.getElementById("connectBtn").style.background = "#065f46";

    log(`Wallet connecté: ${address}`, "success");

    // Écouter les événements
    contract.on("LeaseCreated", (id, landlord, tenant, rent) => {
      log(`🏠 Nouveau contrat #${id} créé | Loyer: ${ethers.utils.formatEther(rent)} ETH`, "success");
    });

    contract.on("RentPaid", (id, tenant, amount, penalty) => {
      log(`💰 Loyer payé pour contrat #${id} | Pénalité: ${ethers.utils.formatEther(penalty)} ETH`, "success");
    });

    contract.on("LeaseTerminated", (id, initiator, reason) => {
      log(`❌ Contrat #${id} résilié: ${reason}`, "error");
    });

  } catch (e) {
    log(`❌ Erreur connexion: ${e.message}`, "error");
  }
}

// ============================================================
//  CRÉER UN CONTRAT
// ============================================================
async function createLease() {
  if (!contract) { log("❌ Connectez votre wallet d'abord !", "error"); return; }

  const btn = document.querySelector('[onclick="createLease()"]');
  showLoading(btn, "Création...");

  try {
    const tenant = document.getElementById("tenantAddr").value.trim();
    const rent = document.getElementById("rent").value;
    const depositMonths = document.getElementById("depositMonths").value;
    const duration = document.getElementById("duration").value;
    const penalty = document.getElementById("penalty").value;
    const description = document.getElementById("description").value;

    if (!tenant || !rent || !depositMonths || !duration || !penalty || !description) {
      log("❌ Remplissez tous les champs !", "error");
      hideLoading(btn);
      return;
    }

    const tx = await contract.createLease(
      tenant,
      ethers.utils.parseEther(rent),
      depositMonths,
      duration,
      penalty,
      description
    );

    log("⏳ Transaction envoyée, en attente de confirmation...", "info");
    const receipt = await tx.wait();
    log(`✅ Contrat créé ! TX: ${receipt.transactionHash.slice(0,20)}...`, "success");

  } catch (e) {
    log(`❌ Erreur: ${e.reason || e.message}`, "error");
  } finally {
    hideLoading(btn);
  }
}

// ============================================================
//  PAYER LE DÉPÔT
// ============================================================
async function payDeposit() {
  if (!contract) { log("❌ Connectez votre wallet d'abord !", "error"); return; }

  const btn = document.querySelector('[onclick="payDeposit()"]');
  showLoading(btn, "Paiement...");

  try {
    const id = document.getElementById("leaseId").value;
    const lease = await contract.getLeaseDetails(id);
    const depositAmount = lease.depositAmount;

    log(`💰 Paiement caution: ${ethers.utils.formatEther(depositAmount)} ETH`, "info");

    const tx = await contract.payDeposit(id, { value: depositAmount });
    await tx.wait();
    log(`✅ Caution payée ! Contrat #${id} maintenant ACTIF`, "success");

  } catch (e) {
    log(`❌ Erreur: ${e.reason || e.message}`, "error");
  } finally {
    hideLoading(btn);
  }
}

// ============================================================
//  PAYER LE LOYER
// ============================================================
async function payRent() {
  if (!contract) { log("❌ Connectez votre wallet d'abord !", "error"); return; }

  const btn = document.querySelector('[onclick="payRent()"]');
  showLoading(btn, "Paiement...");

  try {
    const id = document.getElementById("leaseId").value;
    const [rentAmount, penaltyAmount, totalAmount, daysLate] = await contract.calculateAmountDue(id);

    if (penaltyAmount > 0) {
      log(`⚠️ Retard de ${daysLate} jours ! Pénalité: ${ethers.utils.formatEther(penaltyAmount)} ETH`, "error");
    }

    log(`💰 Total à payer: ${ethers.utils.formatEther(totalAmount)} ETH`, "info");

    const tx = await contract.payRent(id, { value: totalAmount });
    await tx.wait();
    log(`✅ Loyer payé pour contrat #${id}`, "success");

  } catch (e) {
    log(`❌ Erreur: ${e.reason || e.message}`, "error");
  } finally {
    hideLoading(btn);
  }
}

// ============================================================
//  VOIR LES DÉTAILS
// ============================================================
async function getDetails() {
  if (!contract) { log("❌ Connectez votre wallet d'abord !", "error"); return; }

  try {
    const id = document.getElementById("leaseId").value;
    const lease = await contract.getLeaseDetails(id);
    const [, penaltyAmount, totalAmount, daysLate] = await contract.calculateAmountDue(id);
    const isLate = await contract.isRentLate(id);

    const states = [
      "⏳ En attente de caution",
      "✅ Actif",
      "❌ Résilié",
      "⌛ Expiré"
    ];

    const stateColors = ["#78350f", "#065f46", "#7f1d1d", "#1e3a5f"];

    document.getElementById("detailsCard").style.display = "block";
    document.getElementById("leaseDetails").innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">ID</p>
          <p><strong>#${lease.id}</strong></p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">État</p>
          <span style="background:${stateColors[lease.state]}; padding:4px 10px; border-radius:12px; font-size:0.8rem;">
            ${states[lease.state]}
          </span>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Propriétaire</p>
          <p style="font-size:0.8rem;">${lease.landlord.slice(0,10)}...${lease.landlord.slice(-6)}</p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Locataire</p>
          <p style="font-size:0.8rem;">${lease.tenant.slice(0,10)}...${lease.tenant.slice(-6)}</p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Loyer mensuel</p>
          <p><strong>${ethers.utils.formatEther(lease.monthlyRent)} ETH</strong></p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Caution</p>
          <p><strong>${ethers.utils.formatEther(lease.depositAmount)} ETH</strong></p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Total payé</p>
          <p style="color:#6ee7b7;"><strong>${ethers.utils.formatEther(lease.totalPaid)} ETH</strong></p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Pénalité/jour</p>
          <p>${lease.penaltyRate}%</p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Début</p>
          <p>${new Date(Number(lease.startDate) * 1000).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Fin</p>
          <p>${new Date(Number(lease.endDate) * 1000).toLocaleDateString('fr-FR')}</p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Prochaine échéance</p>
          <p style="color:${isLate ? '#fca5a5' : '#6ee7b7'};">
            ${new Date(Number(lease.nextPaymentDue) * 1000).toLocaleDateString('fr-FR')}
            ${isLate ? '⚠️ EN RETARD' : '✅'}
          </p>
        </div>
        <div>
          <p style="color:#94a3b8; font-size:0.8rem;">Montant dû maintenant</p>
          <p style="color:#60a5fa; font-size:1.1rem;"><strong>${ethers.utils.formatEther(totalAmount)} ETH</strong></p>
        </div>
      </div>
      ${daysLate > 0 ? `<div style="background:#7f1d1d; padding:10px; border-radius:8px; margin-top:12px;">
        ⚠️ <strong>${daysLate} jours de retard</strong> — Pénalité: ${ethers.utils.formatEther(penaltyAmount)} ETH
      </div>` : ''}
      <div style="margin-top:12px; padding:10px; background:#0f172a; border-radius:8px;">
        <p style="color:#94a3b8; font-size:0.8rem;">Description du bien</p>
        <p>${lease.propertyDescription}</p>
      </div>
    `;

    log(`🔍 Détails contrat #${id} chargés`, "info");

  } catch (e) {
    log(`❌ Erreur: ${e.reason || e.message}`, "error");
  }
}

// ============================================================
//  RÉSILIER LE CONTRAT
// ============================================================
async function terminateLease() {
  if (!contract) { log("❌ Connectez votre wallet d'abord !", "error"); return; }

  const reason = prompt("Raison de la résiliation:");
  if (!reason) return;

  const btn = document.querySelector('[onclick="terminateLease()"]');
  showLoading(btn, "Résiliation...");

  try {
    const id = document.getElementById("leaseId").value;
    const tx = await contract.terminateLease(id, reason);
    await tx.wait();
    log(`✅ Contrat #${id} résilié: "${reason}"`, "success");

  } catch (e) {
    log(`❌ Erreur: ${e.reason || e.message}`, "error");
  } finally {
    hideLoading(btn);
  }
}

// ============================================================
//  RESTITUER LE DÉPÔT
// ============================================================
async function returnDeposit() {
  if (!contract) { log("❌ Connectez votre wallet d'abord !", "error"); return; }

  const btn = document.querySelector('[onclick="returnDeposit()"]');
  showLoading(btn, "Restitution...");

  try {
    const id = document.getElementById("leaseId").value;
    const deductionsInput = document.getElementById("deductions").value || "0";
    const deductions = ethers.utils.parseEther(deductionsInput);

    const tx = await contract.returnDeposit(id, deductions);
    await tx.wait();
    log(`✅ Caution restituée pour contrat #${id} (déductions: ${deductionsInput} ETH)`, "success");

  } catch (e) {
    log(`❌ Erreur: ${e.reason || e.message}`, "error");
  } finally {
    hideLoading(btn);
  }
}