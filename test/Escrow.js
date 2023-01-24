const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

    let buyer, seller, inspector, lender
    let realEstate, escrow


    // Run beforeEach() function before any of the deployment test cases run

    beforeEach(async () => {
        // Setup Test Accounts Provided by HardHat
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        // Deploy Real Estate NFT On Blockchain
        const RealEstate = await ethers.getContractFactory("RealEstate")
        realEstate = await RealEstate.deploy()

        // Mint A Single Property
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        // Deploy Escrow Contract on Blockchain
        const Escrow = await ethers.getContractFactory("Escrow")
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address,
        )
    })

    describe("Deployment", () => {
        it("Return the NFT Address", async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })
        it("Return the seller Address", async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })
        it("Return the lendor Address", async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })
        it("Return the insepctor Address", async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })
    })
})
