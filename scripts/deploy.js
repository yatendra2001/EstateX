// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup Test Accounts Provided by HardHat
  [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Deploy Real Estate NFT On Blockchain
  const RealEstate = await ethers.getContractFactory("RealEstate")
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Real Estate Smart Contract Deployed at: ${realEstate.address}`)
  console.log("Minting 3 properties....")

  for (let index = 0; index < 3; index++) {
    const transaction = await realEstate.connect(seller).mint(`https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${index + 1}.json`);
    await transaction.wait()

  }


  // Deploy Escrow Contract
  const Escrow = await ethers.getContractFactory("Escrow")
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  for (let index = 0; index < 3; index++) {
    // Approve Properties
    let transaction = await realEstate.connect(seller).approve(escrow.address, index + 1);
    await transaction.wait()
  }

  console.log(`Escrow Smart Contract Deployed at: ${escrow.address}`)

  // Listing Properties
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5))
  await transaction.wait()

  console.log("Finished.")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
