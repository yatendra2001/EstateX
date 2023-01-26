//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address payable public seller;
    address public nftAddress;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftId) {
        require(msg.sender == buyer[_nftId], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        seller = _seller;
        nftAddress = _nftAddress;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint _nftId, 
        address _buyer, 
        uint256 _purchasePrice, 
        uint256 _escrowAmount
        ) public payable onlySeller{

        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender,address(this),_nftId);

        isListed[_nftId] = true;
        purchasePrice[_nftId] = _purchasePrice;
        escrowAmount[_nftId] = _escrowAmount;
        buyer[_nftId] = _buyer;
    }

    // Put Under Contract (only buyer - seller escrow) - This is for sort of like a downpayment for a property
    function depositEarnest( uint256 _nftId) public payable onlyBuyer(_nftId){
        /*  msg.value is ether getting transfered during this transaction and
            we are checking if that amount is greater than atleast escrowamount(downpayment)  */
        require(msg.value >= escrowAmount[_nftId]);
    }


    // This will let smart contract receive ether: Lender can send funds here and increase the balance
    // Need below function in order to receive ether
    receive() external payable{

    }

    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }
}
