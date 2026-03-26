const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("RentalContractModule", (m) => {
  const rentalContract = m.contract("RentalContract");
  return { rentalContract };
});
