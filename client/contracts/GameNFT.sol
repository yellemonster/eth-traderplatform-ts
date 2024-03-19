// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./MyToken.sol";

contract GameNFT is  ERC721, Ownable {

    MyToken private myTokenContract;

    uint256 private gameCost = qty(1);
    uint256 private gameId;

    string private baseTokenURI;


    mapping (uint256 => GameDat) private games;
    mapping (uint256 => address[]) private gamePlayers;
    mapping (uint256 => mapping (address => bool)) private playerHasJoined;

    mapping(address => uint256[]) private gamesByUser;

    // Events ------------------------------------------------------------
    event GameInitialized(uint256 gameId, address owner);
    event GameFinalized(uint256 gameId, address winner);
    event GameJoined(uint256 gameId, address player);


    struct GameDat {
        uint256 gameId;
        string  name;
        uint256 ante; 
        uint256 limit;
        uint256 escrow;
        address creator;
        bool isFini;
    }


    // Management functions -------------------------------------------------------
    constructor(
        string memory _nftName,
        string memory _nftSymbol,
        string memory _baseTokenURI,
        address _tokenAddress
    ) ERC721(_nftName, _nftSymbol) Ownable(msg.sender) {
        setBaseURI(_baseTokenURI);
        myTokenContract = MyToken(payable(address(_tokenAddress)));
    }
    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }


    // Public functions -----------------------------------------------------------
    function initialize(string memory _name, uint256 _ante, uint256 _playerLimit) public payable {

        require(msg.value == (gameCost + _ante),'Insufficient value passed thru');

        gameId++;

        _safeMint(msg.sender, gameId);

        games[gameId] = GameDat(
            gameId, 
            _name, 
            _ante, 
            _playerLimit, 
            _ante, 
            msg.sender, 
            false
        );

        gamesByUser[msg.sender].push(gameId);
        gamePlayers[gameId].push(msg.sender);
        playerHasJoined[gameId][msg.sender] = true;

        emit GameInitialized(gameId, msg.sender);
        emit GameJoined(gameId, msg.sender);
    }
    function joinGame(uint256 _gameId) public payable {

        GameDat memory _gameData = games[_gameId];

        require(_gameData.isFini == false, 'Game has already finished');
        require(msg.value == _gameData.ante, 'msg.value not equal to required ante');
        require(playerHasJoined[gameId][msg.sender] == false, 'user already joined this game');
        require(gamePlayers[_gameId].length < _gameData.limit, 'player limit reached');
        
        gamesByUser[msg.sender].push(_gameId);
        gamePlayers[_gameId].push(msg.sender);
        games[_gameId].escrow += msg.value;

        playerHasJoined[_gameId][msg.sender] = true;

        emit GameJoined(_gameId, msg.sender);
    }
    function finalize(uint256 _gameId, address winner) public {
        
        GameDat memory gameData = games[_gameId];

        require(_isApprovedOrOwner(msg.sender, _gameId), "Not approved or owner");
        require(gameData.isFini == false, 'Game has already finished');
        require(winner != address(0), "Invalid address");
        
        payable(winner).transfer(gameData.escrow);

        _burn(_gameId);

        emit GameFinalized(_gameId, winner);

        games[_gameId].isFini = true;
        games[_gameId].escrow = 0;
    }


    // Data fetch -----------------------------------------------------------------
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    function getTokenAddress() public view returns (address) {
        return address(myTokenContract);
    }
    function getGameCost() public view returns (uint256) {
        return gameCost;
    }
    function getGameCount() public view returns (uint256) {
        return gameId;
    }
    function getGameData(uint256 _gameId) public view returns (GameDat memory) {
        return games[_gameId];
    }
    function getGamePlayers(uint256 _gameId) public view returns (address[] memory) {
        return gamePlayers[_gameId];
    }
    function getGamesByUser(address _userAddr) public view returns (uint256[] memory) {
        return gamesByUser[_userAddr];
    }


    // Internals -----------------------------------------------------------------
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }


    // Data processing ------------------------------------------------------------
    function encodeGameData(
        string memory gameName,
        uint256 gameAnte, 
        uint256 playerLimit
    ) public pure returns (bytes memory) {
        bytes memory encodedData = abi.encode(gameName, gameAnte, playerLimit);
        return encodedData;
    }
    function decodeGameData(bytes calldata encodedData) public pure returns (string memory, uint256, uint256) {
        (
            string memory gameName,
            uint256 gameAnte,
            uint256 playerLimit
        ) = abi.decode(encodedData, (string, uint256, uint256));

        return (gameName, gameAnte, playerLimit);
    }
    function qty(uint256 val) public pure returns (uint256) {
        return val * 10 ** uint256(18);
    }
}
