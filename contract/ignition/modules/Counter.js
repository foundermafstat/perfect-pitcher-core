const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CounterModule", (m) => {
  const counter = m.contract("Counter");

  return { counter };
});