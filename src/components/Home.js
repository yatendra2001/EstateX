import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)


    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
        // --Buyer

        const buyer = await escrow.buyer(home.id)
        setBuyer(buyer)

        const hasBought = await escrow.approval(home.id, buyer)
        setHasBought(hasBought)

        // --Seller

        const seller = await escrow.seller()
        setSeller(seller)

        const hasSold = await escrow.approval(home.id, seller)
        setHasBought(hasSold)

        // --Lender

        const lender = await escrow.lender()
        setLender(lender)

        const hasLended = await escrow.approval(home.id, lender)
        setHasBought(hasLended)

        // --Inspector

        const inspector = await escrow.inspector()
        setInspector(inspector)

        const hasInspected = await escrow.inspectionPassed(home.id, inspector)
        setHasBought(hasInspected)
    }

    const fetchOwner = async () => {
        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id)
        const signer = await provider.getSigner() // Current Signed Account on MetaMask i.e, Hardhat #0


        // Buyer Deposit Earnest
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        // Buyer Approves
        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {

        const signer = await provider.getSigner() // Current Signed Account on MetaMask i.e, Hardhat #1

        // Inspector Updates Status
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
        await transaction.wait()

        setHasInspected(true)
    }

    const lendHandler = async () => {

        const signer = await provider.getSigner() // Current Signed Account on MetaMask i.e, Hardhat #2

        // Lender Approves
        const transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Lender sends funds to contract
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)
    }

    const sellHandler = async () => {

        const signer = await provider.getSigner() // Current Signed Account on MetaMask i.e, Hardhat #3

        // Seller Approves
        const transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Seller Finalise
        transaction = await escrow.connect(signer).finaliseSale(home.id)
        await transaction.wait()

        setHasSold(true)
    }


    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold]) // If has sold then again fetchDetails and fetchOwner will run

    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt='Home' />
                </div>
                <div className='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>

                    {
                        owner ? (
                            <div className='home__owned'>
                                Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                            </div>
                        ) : (
                            <div>
                                {
                                    (account === inspector) ? (
                                        <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                            Approve Inspection
                                        </button>
                                    ) : (account === lender) ? (
                                        <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                            Approve & Lend
                                        </button>
                                    ) : (account === seller) ? (
                                        <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                            Approve & Sale
                                        </button>
                                    ) : (
                                        <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                            Buy
                                        </button>
                                    )
                                }
                                <button className='home__contact'>
                                    Contact Agent
                                </button>
                            </div>
                        )
                    }

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />

                    <h2>Facts and Features</h2>
                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong>:{attribute.value}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={togglePop} className='home__close'>
                    <img src={close} alt='Close' />
                </button>
            </div>
        </div>
    );
}

export default Home;
