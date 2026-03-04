const hre = require("hardhat");

async function main() {
  const EthazonShop = await hre.ethers.getContractFactory("EthazonShop");

  const shop = await EthazonShop.deploy();
  await shop.waitForDeployment();

  console.log("EthazonShop deployed to:", await shop.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});