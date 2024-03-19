// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./MyToken.sol";

contract FactionNFT is  ERC721, Ownable {

    MyToken private myTokenContract;

    uint256 private _tokenCost = qty(3);
    uint256 private _tokenCount;

    mapping(address => uint256[]) private tokensByUser;
    mapping(uint256 => bytes) private tokenData;

    string private baseTokenURI;

    event TokenMinted(address indexed owner, uint256 tokenId);
    event TokenBurned(address indexed owner, uint256 tokenId);
    

    // Owner functions ------------------------------------------------------------
    constructor(
        string memory _nftName,
        string memory _nftSymbol,
        string memory _ercName,
        string memory _ercSymbol,
        string memory _baseTokenURI
    ) ERC721(_nftName, _nftSymbol) Ownable(msg.sender) {
        setBaseURI(_baseTokenURI);
        MyToken _tokenContract = new MyToken(_ercName, _ercSymbol);
        myTokenContract = MyToken(payable(address(_tokenContract)));
    }


    // Public functions -----------------------------------------------------------
    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
    function mint(bytes calldata _tokenData) public payable {

        require(msg.value == _tokenCost,'Insufficient message value');

        _tokenCount++;

        _safeMint(msg.sender, _tokenCount);

        tokenData[_tokenCount] = _tokenData;
        
        tokensByUser[msg.sender].push(_tokenCount);
        
        emit TokenMinted(msg.sender, _tokenCount);
    }
    function burn(uint256 _tokenId) public {
        
        require(_isApprovedOrOwner(msg.sender, _tokenId), "Not approved or owner");
        
        _burn(_tokenId);

        uint256[] storage _userTokenIds = tokensByUser[msg.sender];
        for (uint256 i = 0; i < _userTokenIds.length; i++) {
            if (_userTokenIds[i] == _tokenId) {
                _userTokenIds[i] = _userTokenIds[_userTokenIds.length - 1];
                _userTokenIds.pop();
                break;
            }
        }

        tokensByUser[msg.sender] = _userTokenIds;

        myTokenContract.mint(msg.sender, qty(100));

        emit TokenBurned(msg.sender, _tokenId);
    }
    function forward() public {

        uint256 contractBalance = address(this).balance;
        
        require(contractBalance > 0, "No Ether to forward");

        payable(owner()).transfer(contractBalance);
    }


    // Data fetch -----------------------------------------------------------------
    function getTokenCost() public view returns (uint256){
        return _tokenCost;
    }
    function getTokenCount() public view returns (uint256){
        return _tokenCount;
    }
    function getTokenData(uint256 _tokenId) public view returns (bytes memory) {
        return tokenData[_tokenId];
    }
    function getTokensByUser(address _owner) public view returns (uint256[] memory) {
        return tokensByUser[_owner];
    }
    function getMyTokenAddress() public view returns (address) {
        return address(myTokenContract);
    }


    // Internals -------------------------------------------------------
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }


    // Data processing --------------------------------------------------------------------------------------
    function encodeData(
        string memory stringValue, 
        uint256 uintValue, 
        address addressValue
    )  public pure returns (bytes memory) {
        
        bytes memory encodedData = abi.encode(stringValue, uintValue, addressValue);

        return encodedData;
    }
    function decodeData(
        bytes calldata encodedData
    ) internal pure returns (string memory, uint256, address) {

        (string memory stringValue, uint256 uintValue, address addressValue) = abi.decode(encodedData, (string, uint256, address));

        return (stringValue, uintValue, addressValue);
    }
    function qty(uint256 val) public pure returns (uint256) {
        return val * 10 ** uint256(18);
    }
}
