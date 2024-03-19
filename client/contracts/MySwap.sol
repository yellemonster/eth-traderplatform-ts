// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

import './MyToken.sol';

contract MySwap is Ownable {
    
    MyToken private myTokenContract;

    string private name = 'MySwap';
    uint32 private rate = 10000;


    event  TokenBuy(
        address indexed buyerAddress,
        address token,
        uint256 amount,
        uint256 rate
    );
    event  TokenSell(
        address indexed sellerAddress,
        address token,
        uint256 amount,
        uint256 rate
    );


    // Owner functions ------------------------------------------------------------
    constructor(address _tokenAddress) Ownable(msg.sender) {
        myTokenContract = MyToken(payable(address(_tokenAddress)));
    }

    // Public functions -----------------------------------------------------------
    function buyTokens() public payable {

        uint256 buyAmount = msg.value * rate;
        
        myTokenContract.buy(msg.sender, buyAmount);

        emit TokenBuy(msg.sender, address(myTokenContract), buyAmount, rate);
    }
    function forward() public {

        uint256 contractBalance = address(this).balance;
        
        require(contractBalance > 0, "No Ether to forward");

        payable(owner()).transfer(contractBalance);
    }

    // Data fetch -----------------------------------------------------------------
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function swapRate() public view returns (uint32) {
        return rate;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    // Fallback: ------------------------------------------------------------------
    receive() external payable {
        revert("Unauthorized Ether deposit reverted via Fallback function");
    }
} 