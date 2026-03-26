// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RentalContract
 * @notice Contrat de location immobilier / matériel sur blockchain
 * @dev Gère: création, loyer mensuel, dépôt de garantie, pénalités, résiliation
 */
contract RentalContract {

    // ============================================================
    //  STRUCTURES & ENUMS
    // ============================================================

    enum ContractState { 
        PENDING,    // En attente de signature du locataire
        ACTIVE,     // Contrat actif
        TERMINATED, // Résilié
        EXPIRED     // Expiré naturellement
    }

    struct Lease {
        uint256 id;
        address payable landlord;      // Propriétaire
        address payable tenant;        // Locataire
        uint256 monthlyRent;           // Loyer mensuel (en wei)
        uint256 depositAmount;         // Dépôt de garantie (en wei)
        uint256 penaltyRate;           // Taux pénalité par jour de retard (en %)
        uint256 startDate;             // Date de début (timestamp)
        uint256 endDate;               // Date de fin (timestamp)
        uint256 nextPaymentDue;        // Prochaine échéance
        uint256 depositPaid;           // Dépôt versé
        uint256 totalPaid;             // Total loyers payés
        uint256 lastPaymentDate;       // Date du dernier paiement
        ContractState state;
        string propertyDescription;    // Description du bien
        bool depositReturned;          // Dépôt restitué
    }

    // ============================================================
    //  VARIABLES D'ÉTAT
    // ============================================================

    uint256 public leaseCounter;
    mapping(uint256 => Lease) public leases;
    mapping(address => uint256[]) public landlordLeases;
    mapping(address => uint256[]) public tenantLeases;

    uint256 public constant GRACE_PERIOD = 5 days;   // Délai de grâce avant pénalité
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant MONTH_IN_SECONDS = 30 days;

    // ============================================================
    //  ÉVÉNEMENTS
    // ============================================================

    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed landlord,
        address indexed tenant,
        uint256 monthlyRent,
        uint256 startDate,
        uint256 endDate
    );

    event DepositPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        uint256 timestamp
    );

    event RentPaid(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        uint256 penalty,
        uint256 timestamp
    );

    event PenaltyApplied(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 daysLate,
        uint256 penaltyAmount
    );

    event LeaseTerminated(
        uint256 indexed leaseId,
        address indexed initiator,
        string reason,
        uint256 timestamp
    );

    event DepositReturned(
        uint256 indexed leaseId,
        address indexed tenant,
        uint256 amount,
        uint256 deductions
    );

    // ============================================================
    //  MODIFICATEURS
    // ============================================================

    modifier onlyLandlord(uint256 _leaseId) {
        require(msg.sender == leases[_leaseId].landlord, "Seul le proprietaire peut effectuer cette action");
        _;
    }

    modifier onlyTenant(uint256 _leaseId) {
        require(msg.sender == leases[_leaseId].tenant, "Seul le locataire peut effectuer cette action");
        _;
    }

    modifier onlyParties(uint256 _leaseId) {
        require(
            msg.sender == leases[_leaseId].landlord || 
            msg.sender == leases[_leaseId].tenant,
            "Acces reserve aux parties du contrat"
        );
        _;
    }

    modifier leaseActive(uint256 _leaseId) {
        require(leases[_leaseId].state == ContractState.ACTIVE, "Le contrat n'est pas actif");
        _;
    }

    modifier leaseExists(uint256 _leaseId) {
        require(_leaseId < leaseCounter, "Contrat inexistant");
        _;
    }

    // ============================================================
    //  FONCTIONS PRINCIPALES
    // ============================================================

    /**
     * @notice Crée un nouveau contrat de location
     * @param _tenant Adresse du locataire
     * @param _monthlyRent Loyer mensuel en wei
     * @param _depositMonths Nombre de mois de caution (ex: 2 = 2 mois de loyer)
     * @param _durationMonths Durée du contrat en mois
     * @param _penaltyRate Taux de pénalité journalier en % (ex: 1 = 1%/jour)
     * @param _propertyDescription Description du bien
     */
    function createLease(
        address payable _tenant,
        uint256 _monthlyRent,
        uint256 _depositMonths,
        uint256 _durationMonths,
        uint256 _penaltyRate,
        string memory _propertyDescription
    ) external returns (uint256) {
        require(_tenant != address(0), "Adresse locataire invalide");
        require(_tenant != msg.sender, "Proprietaire ne peut pas etre locataire");
        require(_monthlyRent > 0, "Loyer doit etre superieur a 0");
        require(_durationMonths > 0, "Duree doit etre superieure a 0");
        require(_penaltyRate > 0 && _penaltyRate <= 10, "Taux penalite entre 1 et 10%");

        uint256 leaseId = leaseCounter++;
        uint256 startDate = block.timestamp;
        uint256 endDate = startDate + (_durationMonths * MONTH_IN_SECONDS);
        uint256 depositAmount = _monthlyRent * _depositMonths;

        leases[leaseId] = Lease({
            id: leaseId,
            landlord: payable(msg.sender),
            tenant: _tenant,
            monthlyRent: _monthlyRent,
            depositAmount: depositAmount,
            penaltyRate: _penaltyRate,
            startDate: startDate,
            endDate: endDate,
            nextPaymentDue: startDate + MONTH_IN_SECONDS,
            depositPaid: 0,
            totalPaid: 0,
            lastPaymentDate: 0,
            state: ContractState.PENDING,
            propertyDescription: _propertyDescription,
            depositReturned: false
        });

        landlordLeases[msg.sender].push(leaseId);
        tenantLeases[_tenant].push(leaseId);

        emit LeaseCreated(leaseId, msg.sender, _tenant, _monthlyRent, startDate, endDate);

        return leaseId;
    }

    /**
     * @notice Le locataire paie le dépôt de garantie pour activer le contrat
     * @param _leaseId ID du contrat
     */
    function payDeposit(uint256 _leaseId) 
        external 
        payable 
        leaseExists(_leaseId)
        onlyTenant(_leaseId) 
    {
        Lease storage lease = leases[_leaseId];
        require(lease.state == ContractState.PENDING, "Depot deja paye ou contrat non en attente");
        require(msg.value == lease.depositAmount, 
            string(abi.encodePacked("Montant incorrect. Requis: ", _toString(lease.depositAmount))));

        lease.depositPaid = msg.value;
        lease.state = ContractState.ACTIVE;

        emit DepositPaid(_leaseId, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Paiement du loyer mensuel avec calcul automatique des pénalités
     * @param _leaseId ID du contrat
     */
    function payRent(uint256 _leaseId) 
        external 
        payable 
        leaseExists(_leaseId)
        onlyTenant(_leaseId)
        leaseActive(_leaseId)
    {
        Lease storage lease = leases[_leaseId];
        
        // Vérifier si le contrat n'est pas expiré
        if (block.timestamp > lease.endDate) {
            lease.state = ContractState.EXPIRED;
            revert("Contrat expire");
        }

        uint256 penalty = 0;
        uint256 daysLate = 0;

        // Calcul des pénalités si en retard (après délai de grâce)
        if (block.timestamp > lease.nextPaymentDue + GRACE_PERIOD) {
            daysLate = (block.timestamp - lease.nextPaymentDue - GRACE_PERIOD) / SECONDS_PER_DAY;
            penalty = (lease.monthlyRent * lease.penaltyRate * daysLate) / 100;
            
            emit PenaltyApplied(_leaseId, msg.sender, daysLate, penalty);
        }

        uint256 totalDue = lease.monthlyRent + penalty;
        require(msg.value >= totalDue, 
            string(abi.encodePacked("Montant insuffisant. Du: ", _toString(totalDue))));

        // Rembourser l'excédent si trop payé
        uint256 excess = msg.value - totalDue;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        // Transférer le loyer au propriétaire
        lease.landlord.transfer(totalDue);
        
        // Mettre à jour l'état
        lease.totalPaid += totalDue;
        lease.lastPaymentDate = block.timestamp;
        lease.nextPaymentDue += MONTH_IN_SECONDS;

        emit RentPaid(_leaseId, msg.sender, lease.monthlyRent, penalty, block.timestamp);
    }

    /**
     * @notice Calcule le montant dû pour le prochain loyer (loyer + pénalités éventuelles)
     * @param _leaseId ID du contrat
     */
    function calculateAmountDue(uint256 _leaseId) 
        external 
        view 
        leaseExists(_leaseId)
        returns (uint256 rentAmount, uint256 penaltyAmount, uint256 totalAmount, uint256 daysLate) 
    {
        Lease storage lease = leases[_leaseId];
        rentAmount = lease.monthlyRent;
        
        if (block.timestamp > lease.nextPaymentDue + GRACE_PERIOD) {
            daysLate = (block.timestamp - lease.nextPaymentDue - GRACE_PERIOD) / SECONDS_PER_DAY;
            penaltyAmount = (lease.monthlyRent * lease.penaltyRate * daysLate) / 100;
        }
        
        totalAmount = rentAmount + penaltyAmount;
    }

    /**
     * @notice Résiliation du contrat par l'une des parties
     * @param _leaseId ID du contrat
     * @param _reason Raison de la résiliation
     */
    function terminateLease(uint256 _leaseId, string memory _reason) 
        external 
        leaseExists(_leaseId)
        onlyParties(_leaseId)
        leaseActive(_leaseId)
    {
        Lease storage lease = leases[_leaseId];
        lease.state = ContractState.TERMINATED;

        emit LeaseTerminated(_leaseId, msg.sender, _reason, block.timestamp);
    }

    /**
     * @notice Le propriétaire restitue le dépôt de garantie (avec déductions éventuelles)
     * @param _leaseId ID du contrat
     * @param _deductions Montant des déductions (dommages, loyers impayés, etc.)
     */
    function returnDeposit(uint256 _leaseId, uint256 _deductions) 
        external 
        leaseExists(_leaseId)
        onlyLandlord(_leaseId)
    {
        Lease storage lease = leases[_leaseId];
        require(
            lease.state == ContractState.TERMINATED || 
            lease.state == ContractState.EXPIRED,
            "Contrat doit etre termine ou expire"
        );
        require(!lease.depositReturned, "Depot deja restitue");
        require(_deductions <= lease.depositPaid, "Deductions superieures au depot");

        uint256 refundAmount = lease.depositPaid - _deductions;
        lease.depositReturned = true;

        if (refundAmount > 0) {
            lease.tenant.transfer(refundAmount);
        }
        
        // Les déductions vont au propriétaire
        if (_deductions > 0) {
            lease.landlord.transfer(_deductions);
        }

        emit DepositReturned(_leaseId, lease.tenant, refundAmount, _deductions);
    }

    // ============================================================
    //  FONCTIONS DE LECTURE (VIEW)
    // ============================================================

    /**
     * @notice Obtenir les détails complets d'un contrat
     */
    function getLeaseDetails(uint256 _leaseId) 
        external 
        view 
        leaseExists(_leaseId)
        returns (Lease memory) 
    {
        return leases[_leaseId];
    }

    /**
     * @notice Vérifier si un loyer est en retard
     */
    function isRentLate(uint256 _leaseId) external view leaseExists(_leaseId) returns (bool) {
        Lease storage lease = leases[_leaseId];
        return (lease.state == ContractState.ACTIVE && 
                block.timestamp > lease.nextPaymentDue + GRACE_PERIOD);
    }

    /**
     * @notice Obtenir tous les contrats d'un propriétaire
     */
    function getLandlordLeases(address _landlord) external view returns (uint256[] memory) {
        return landlordLeases[_landlord];
    }

    /**
     * @notice Obtenir tous les contrats d'un locataire
     */
    function getTenantLeases(address _tenant) external view returns (uint256[] memory) {
        return tenantLeases[_tenant];
    }

    // ============================================================
    //  FONCTIONS UTILITAIRES
    // ============================================================

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    receive() external payable {}
}