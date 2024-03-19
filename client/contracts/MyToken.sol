// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import './MySwap.sol';

contract MyToken is ERC20, Ownable {


    MySwap private mySwapContract;


    modifier onlySwap() {
        require(msg.sender == address(mySwapContract), 'Swap contract only function');
        _;
    }
    modifier ownerOnly() {
        require(msg.sender == owner(), 'Contract keyholder only function');
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        mySwapContract = new MySwap(address(this));
    }

    // Public functions ----------------------------------------------------------
    function setSwapContract(address _swapContract) public ownerOnly {
        mySwapContract = MySwap(payable(_swapContract));
    }
    function mint(address to, uint256 amount) public ownerOnly {
        _mint(to, amount);
    }
    function buy(address to, uint256 amount) public onlySwap {
        _mint(to, amount);
    }

    // Data fetch -----------------------------------------------------------------
    function getMySwapAddress() public view returns (address) {
        return address(mySwapContract);
    }

    // Fallback: ------------------------------------------------------------------
    receive() external payable {
        revert("Unauthorized Ether deposit reverted via Fallback function");
    }
    
}
