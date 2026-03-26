import hre from "hardhat";

async function main() {
  console.log("🚀 Déploiement du contrat RentalContract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📋 Déployeur: ${deployer.address}`);

  const RentalContract = await hre.ethers.getContractFactory("RentalContract");
  const rental = await RentalContract.deploy();
  await rental.waitForDeployment();

  const address = await rental.getAddress();
  console.log(`✅ Contrat déployé à: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});