import hre from "hardhat";

async function main() {
  console.log("Deploying Casino contract to Arc Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log(
    "Deployer balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  const Casino = await hre.ethers.getContractFactory("Casino");
  const casino = await Casino.deploy();

  await casino.waitForDeployment();

  const address = await casino.getAddress();
  console.log("Casino deployed at:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


