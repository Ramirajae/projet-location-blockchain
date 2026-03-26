import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("RentalContract", function () {
  let rental, landlord, tenant, other;
  
  const MONTHLY_RENT = ethers.parseEther("1.0");
  const DEPOSIT_MONTHS = 2n;
  const DURATION_MONTHS = 12;
  const PENALTY_RATE = 1;
  const DESCRIPTION = "Appartement T3, 75m², Paris 15e";

  beforeEach(async function () {
    [landlord, tenant, other] = await ethers.getSigners();
    const RentalContract = await ethers.getContractFactory("RentalContract");
    rental = await RentalContract.deploy();
    await rental.waitForDeployment();
  });

  describe("1. Création du contrat", function () {
    it("Doit créer un contrat avec les bons paramètres", async function () {
      await rental.connect(landlord).createLease(
        tenant.address, MONTHLY_RENT, DEPOSIT_MONTHS,
        DURATION_MONTHS, PENALTY_RATE, DESCRIPTION
      );
      const lease = await rental.getLeaseDetails(0);
      expect(lease.landlord).to.equal(landlord.address);
      expect(lease.tenant).to.equal(tenant.address);
      expect(lease.monthlyRent).to.equal(MONTHLY_RENT);
      expect(lease.state).to.equal(0n);
      console.log("   ✅ Contrat créé avec succès");
    });

    it("Doit rejeter si loyer = 0", async function () {
      await expect(
        rental.connect(landlord).createLease(tenant.address, 0, 2, 12, 1, "Test")
      ).to.be.revertedWith("Loyer doit etre superieur a 0");
    });

    it("Doit rejeter si propriétaire = locataire", async function () {
      await expect(
        rental.connect(landlord).createLease(landlord.address, MONTHLY_RENT, 2, 12, 1, "Test")
      ).to.be.revertedWith("Proprietaire ne peut pas etre locataire");
    });
  });

  describe("2. Dépôt de garantie", function () {
    beforeEach(async function () {
      await rental.connect(landlord).createLease(
        tenant.address, MONTHLY_RENT, DEPOSIT_MONTHS,
        DURATION_MONTHS, PENALTY_RATE, DESCRIPTION
      );
    });

    it("Doit activer le contrat après paiement du dépôt", async function () {
      const depositAmount = MONTHLY_RENT * DEPOSIT_MONTHS;
      await rental.connect(tenant).payDeposit(0, { value: depositAmount });
      const lease = await rental.getLeaseDetails(0);
      expect(lease.state).to.equal(1n);
      console.log("   ✅ Dépôt payé, contrat activé");
    });

    it("Doit rejeter un dépôt incorrect", async function () {
      await expect(
        rental.connect(tenant).payDeposit(0, { value: ethers.parseEther("0.5") })
      ).to.be.reverted;
    });
  });

  describe("3. Résiliation", function () {
    beforeEach(async function () {
      await rental.connect(landlord).createLease(
        tenant.address, MONTHLY_RENT, DEPOSIT_MONTHS,
        DURATION_MONTHS, PENALTY_RATE, DESCRIPTION
      );
      await rental.connect(tenant).payDeposit(0, { 
        value: MONTHLY_RENT * DEPOSIT_MONTHS 
      });
    });

    it("Doit permettre au propriétaire de résilier", async function () {
      await rental.connect(landlord).terminateLease(0, "Non-paiement");
      const lease = await rental.getLeaseDetails(0);
      expect(lease.state).to.equal(2n);
      console.log("   ✅ Contrat résilié par le propriétaire");
    });

    it("Doit permettre au locataire de résilier", async function () {
      await rental.connect(tenant).terminateLease(0, "Demenagement");
      const lease = await rental.getLeaseDetails(0);
      expect(lease.state).to.equal(2n);
      console.log("   ✅ Contrat résilié par le locataire");
    });

    it("Doit rejeter une résiliation par un tiers", async function () {
      await expect(
        rental.connect(other).terminateLease(0, "Tentative frauduleuse")
      ).to.be.revertedWith("Acces reserve aux parties du contrat");
    });
  });
});