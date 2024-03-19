//
//
const { expect } = require("chai");
const { ethers } = require("hardhat");
//
//
function to_ETH(x) {
    return ethers.parseUnits(x.toString(), "ether");
}
function to_NUM(x) {
    return parseInt(ethers.formatUnits(x, "ether"));
}
function tokens(x) {
    const y = parseFloat(ethers.formatUnits(x.toString(), "ether"));
    return fx(y);
}
function fx(x) {
    return parseFloat(x.toFixed(3));
}
//
//
describe("My NFT", () => {
    //
    //
    const ercName = "MyToken";
    const ercSymbol = "MTK";
    //
    const factionNftCost = 3;
    const factionNftName = "FactionNFT";
    const factionNftSymbol = "FNFT";
    const baseFactionTokenURI = "i101.app";
    //
    const gameNftCost = 1;
    const gameNftName = "GameNFT";
    const gameNftSymbol = "GNFT";
    const baseGameTokenURI = "i101.app";
    //
    let ercFactory;
    let ercContract;
    let ercAddress = "";
    //
    let gameNftFactory;
    let gameNftContract;
    //
    let factionNftFactory;
    let facionNftContract;
    //
    const swapName = "MySwap";
    let swapFactory;
    let swapContract;
    let swapAddress = "";
    //
    let deployer;
    let acct1;
    let acct2;
    let acct3;
    let acct4;
    //
    //
    let gameName = "TestGameToken";
    let gameAnte = 7;
    let playerLimit = 3;
    let encodedGameData;
    //
    //
    beforeEach(async () => {
        //
        [deployer, acct1, acct2, acct3, acct4] = await ethers.getSigners();
        //
        ercFactory = await ethers.getContractFactory(ercName);
        factionNftFactory = await ethers.getContractFactory(factionNftName);
        //
        facionNftContract = await factionNftFactory.deploy(
            factionNftName,
            factionNftSymbol,
            ercName,
            ercSymbol,
            baseFactionTokenURI
        );
        //
        ercAddress = await facionNftContract.getMyTokenAddress();
        ercContract = await ercFactory.attach(ercAddress);
        //
        swapFactory = await ethers.getContractFactory(swapName);
        swapAddress = await ercContract.getMySwapAddress();
        swapContract = await swapFactory.attach(swapAddress);
        //
        gameNftFactory = await ethers.getContractFactory(gameNftName);
        gameNftContract = await gameNftFactory.deploy(
            gameNftName,
            gameNftSymbol,
            baseGameTokenURI,
            ercAddress
        );
    });
    //
    //
    // describe("Token - deployment", () => {
    //     it("tracks the owner", async () => {
    //         const result = await ercContract.owner();
    //         expect(result).to.be.equal(facionNftContract.target);
    //     });
    //     it("tracks the name", async () => {
    //         const result = await ercContract.name();
    //         expect(result).to.be.equal(ercName);
    //     });
    //     it("tracks the symbol", async () => {
    //         const result = await ercContract.symbol();
    //         expect(result).to.be.equal(ercSymbol);
    //     });
    //     it("tracks the supply", async () => {
    //         const result = await ercContract.totalSupply();
    //         expect(result).to.be.equal(0);
    //     });
    //     it("tracks the swap address", async () => {
    //         const result = await ercContract.getMySwapAddress();
    //         expect(result).to.be.equal(swapAddress);
    //     });
    // });
    // describe("Faction NFT - deployment", () => {
    //     it("tracks the owner", async () => {
    //         const result = await facionNftContract.owner();
    //         expect(result).to.be.equal(deployer);
    //     });
    //     it("tracks the name", async () => {
    //         const result = await facionNftContract.name();
    //         expect(result).to.be.equal(factionNftName);
    //     });
    //     it("tracks the symbol", async () => {
    //         const result = await facionNftContract.symbol();
    //         expect(result).to.be.equal(factionNftSymbol);
    //     });
    //     it("tracks the token cost", async () => {
    //         const result = await facionNftContract.getTokenCost();
    //         console.log("Token cost - ", to_NUM(to_ETH(factionNftCost)), " - ETH");
    //         expect(result).to.be.equal(to_ETH(factionNftCost));
    //     });
    // });
    // describe("Faction NFT - mint", () => {
    //     beforeEach(async () => {
    //         //
    //         const tradeData = {
    //             tradeType: "buy",
    //             price: 100,
    //             timestamp: Date.now(),
    //             additionalInfo: "Some additional information",
    //         };
    //         const hexData = "0x" + Buffer.from(JSON.stringify(tradeData)).toString("hex");
    //         //
    //         // 1
    //         let mintTxn = await facionNftContract
    //             .connect(acct1)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 2
    //         mintTxn = await facionNftContract
    //             .connect(acct2)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 3
    //         mintTxn = await facionNftContract
    //             .connect(acct3)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 4
    //         mintTxn = await facionNftContract
    //             .connect(acct3)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 5
    //         mintTxn = await facionNftContract
    //             .connect(acct3)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 6
    //         mintTxn = await facionNftContract
    //             .connect(acct3)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 7
    //         mintTxn = await facionNftContract
    //             .connect(acct3)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //         //
    //         // 8
    //         mintTxn = await facionNftContract
    //             .connect(acct3)
    //             .mint(hexData, { value: to_ETH(factionNftCost) });
    //         await mintTxn.wait();
    //     });

    //     it("Returns token 1", async () => {
    //         const result = await facionNftContract.ownerOf(1);
    //         expect(result).to.be.equal(acct1.address);
    //     });
    //     it("Returns token 2", async () => {
    //         const result = await facionNftContract.ownerOf(2);
    //         expect(result).to.be.equal(acct2.address);
    //     });
    //     it("Returns token 8", async () => {
    //         const result = await facionNftContract.ownerOf(8);
    //         expect(result).to.be.equal(acct3.address);
    //     });
    //     it("Returns all tokens for [acct3]", async () => {
    //         const result = await facionNftContract.getTokensByUser(acct3.address);
    //         console.log(
    //             "       > [acct3] tokens - ",
    //             result.map((x) => parseInt(x.toString()))
    //         );
    //         // expect(result).to.be.equal(acct3.address);
    //     });
    //     it("Returns Account balance", async () => {
    //         const result = await facionNftContract.balanceOf(acct3.address);
    //         expect(result).to.be.equal(6);
    //     });
    //     it("Zero MTK balance ERC pre burn", async () => {
    //         const result = await ercContract.balanceOf(acct3.address);
    //         expect(result).to.be.equal(0);
    //     });
    //     it("Received [300] ERC after [3] burns", async () => {
    //         //
    //         let burnTxn = await facionNftContract.connect(acct3).burn(8);
    //         await burnTxn.wait();
    //         //
    //         burnTxn = await facionNftContract.connect(acct3).burn(6);
    //         await burnTxn.wait();
    //         //
    //         burnTxn = await facionNftContract.connect(acct3).burn(4);
    //         await burnTxn.wait();
    //         //
    //         const result = await facionNftContract.getTokensByUser(acct3.address);
    //         console.log(
    //             "       > [acct3] tokens - ",
    //             result.map((x) => parseInt(x.toString()))
    //         );
    //         //
    //         const expectedSupply = to_ETH(300);
    //         const tokenSupply = await ercContract.totalSupply();
    //         const expectedBalance = await ercContract.balanceOf(acct3.address);
    //         //
    //         expect(tokenSupply).to.be.equal(expectedSupply);
    //         expect(expectedBalance).to.be.equal(expectedSupply);
    //     });
    //     it("Gets and decodes data", async () => {
    //         //
    //         const encodedDataFromContract = await facionNftContract.getTokenData(8);
    //         const hexWithoutPrefix = encodedDataFromContract.slice(2);
    //         const dataBuffer = Buffer.from(hexWithoutPrefix, "hex");
    //         const jsonString = dataBuffer.toString("utf8");
    //         const decodedObject = JSON.parse(jsonString);
    //         //
    //         console.log("Decoded Object:", decodedObject);
    //     });
    // });
    // describe("Swap - deployment", () => {
    //     it("tracks the owner", async () => {
    //         const result = await swapContract.owner();
    //         expect(result).to.be.equal(ercContract.target);
    //     });
    //     it("tracks the name", async () => {
    //         const result = await swapContract.getName();
    //         expect(result).to.be.equal(swapName);
    //     });
    //     it("tracks the token balance", async () => {
    //         let result = await ercContract.totalSupply();
    //         expect(result).to.be.equal(0);
    //         //
    //         let buyTxn = await swapContract
    //             .connect(acct1)
    //             .buyTokens({ value: to_ETH(2) });
    //         let receipt = await buyTxn.wait();
    //         //
    //         expect(receipt.status).to.be.equal(1);

    //         result = await ercContract.totalSupply();
    //         expect(result).to.be.equal(to_ETH(20000));
    //     });
    //     it("Restricts 'buys' exclusively to the swap contract ", async () => {
    //         const buyTxn = ercContract.connect(acct1).buy(acct1.address, to_ETH(2));
    //         await expect(buyTxn).to.be.revertedWith("Swap contract only function");
    //     });
    //     it("Restricts 'mints' exclusively to the keyholder address ", async () => {
    //         const buyTxn = ercContract.connect(acct1).mint(acct1.address, to_ETH(2));
    //         await expect(buyTxn).to.be.revertedWith("Contract keyholder only function");
    //     });
    // });
    // describe("Game NFT - deployment", () => {
    //     it("tracks the owner", async () => {
    //         const result = await gameNftContract.owner();
    //         expect(result).to.be.equal(deployer);
    //     });
    //     it("tracks the name", async () => {
    //         const result = await gameNftContract.name();
    //         expect(result).to.be.equal(gameNftName);
    //     });
    //     it("tracks the symbol", async () => {
    //         const result = await gameNftContract.symbol();
    //         expect(result).to.be.equal(gameNftSymbol);
    //     });
    //     it("tracks the game token cost", async () => {
    //         const result = await gameNftContract.getGameCost();
    //         expect(result).to.be.equal(to_ETH(gameNftCost));
    //     });
    // });
    // describe("Game NFT - mint", () => {
    //     //
    //     beforeEach(async () => {
    //         //
    //         let mintTxn = await gameNftContract
    //             .connect(acct1)
    //             .initialize(gameName, to_ETH(gameAnte), playerLimit, {
    //                 value: to_ETH(gameNftCost + gameAnte),
    //             });
    //         //
    //         await mintTxn.wait();
    //         //
    //         mintTxn = await gameNftContract
    //             .connect(acct2)
    //             .initialize(gameName, to_ETH(gameAnte), playerLimit, {
    //                 value: to_ETH(gameNftCost + gameAnte),
    //             });
    //         //
    //         await mintTxn.wait();
    //     });
    //     //
    //     it("Returns game token 1 owner", async () => {
    //         const result = await gameNftContract.ownerOf(1);
    //         expect(result).to.be.equal(acct1.address);
    //     });
    //     it("Returns game token 2 owner", async () => {
    //         const result = await gameNftContract.ownerOf(2);
    //         expect(result).to.be.equal(acct2.address);
    //     });
    //     it("Returns game token count", async () => {
    //         const result = await gameNftContract.getGameCount();
    //         expect(result).to.be.equal(2);
    //     });
    //     it("Returns [acct1] balance", async () => {
    //         const result = await gameNftContract.balanceOf(acct1.address);
    //         expect(result).to.be.equal(1);
    //     });
    //     it("Returns [acct2] balance", async () => {
    //         const result = await gameNftContract.balanceOf(acct2.address);
    //         expect(result).to.be.equal(1);
    //     });
    // });
    // describe("Game NFT - join", () => {
    //     //
    //     const testGameId = 1;
    //     //
    //     beforeEach(async () => {
    //         //
    //         const mintTxn = await gameNftContract
    //             .connect(acct1)
    //             .initialize(gameName, to_ETH(gameAnte), playerLimit, {
    //                 value: to_ETH(gameNftCost + gameAnte),
    //             });
    //         //
    //         await mintTxn.wait();
    //         //
    //         const joinTxn = await gameNftContract
    //             .connect(acct2)
    //             .joinGame(testGameId, { value: to_ETH(gameAnte) });
    //         //
    //         await joinTxn.wait();
    //     });
    //     //
    //     it("Allows player to join game", async () => {
    //         const gamePlayers = await gameNftContract.getGamePlayers(testGameId);
    //         const chk1 = gamePlayers.includes(acct1.address);
    //         const chk2 = gamePlayers.includes(acct2.address);
    //         expect(chk1).to.be.equal(true);
    //         expect(chk2).to.be.equal(true);
    //     });
    //     it("Rejects [acct1] - already joined", async () => {
    //         //
    //         const joinTxn = gameNftContract
    //             .connect(acct1)
    //             .joinGame(testGameId, { value: to_ETH(gameAnte) });
    //         //
    //         await expect(joinTxn).to.be.revertedWith("user already joined this game");
    //     });
    //     it("Rejects [acct2] - already joined", async () => {
    //         //
    //         const joinTxn = gameNftContract
    //             .connect(acct2)
    //             .joinGame(testGameId, { value: to_ETH(gameAnte) });
    //         //
    //         await expect(joinTxn).to.be.revertedWith("user already joined this game");
    //     });
    //     it("Accepts [acct3] who has not already joined", async () => {
    //         //
    //         const joinTxn = await gameNftContract
    //             .connect(acct3)
    //             .joinGame(testGameId, { value: to_ETH(gameAnte) });
    //         //
    //         const receipt = await joinTxn.wait();
    //         //
    //         expect(receipt.status).to.be.equal(1);
    //     });
    //     it("Rejects attempts to join game if player limit reached", async () => {
    //         //
    //         const joinTxn1 = await gameNftContract
    //             .connect(acct3)
    //             .joinGame(testGameId, { value: to_ETH(gameAnte) });
    //         //
    //         await joinTxn1.wait();
    //         //
    //         //
    //         const joinTxn2 = gameNftContract
    //             .connect(acct4)
    //             .joinGame(testGameId, { value: to_ETH(gameAnte) });
    //         //
    //         await expect(joinTxn2).to.be.revertedWith("player limit reached");
    //     });
    //     it("Contract reflects correct balance", async () => {
    //         //
    //         const gamePlayers = await gameNftContract.getGamePlayers(testGameId);
    //         const contractBalance = await gameNftContract.getContractBalance();
    //         const expectedBalance = gameAnte * gamePlayers.length + gameNftCost;
    //         //
    //         expect(contractBalance).to.be.equal(to_ETH(expectedBalance));
    //     });
    //     it("Test game escrow balance reflects correct amount", async () => {
    //         //
    //         const gameData = await gameNftContract.getGameData(testGameId);
    //         const gamePlayers = await gameNftContract.getGamePlayers(testGameId);
    //         //
    //         const ante = to_NUM(gameData[2]);
    //         const escrow = to_NUM(gameData[4]);
    //         const expectedBalance = ante * gamePlayers.length;
    //         //
    //         expect(escrow).to.be.equal(expectedBalance);
    //     });
    // });
    describe("Game NFT - finalize", () => {
        //
        const testGameId = 1;
        //
        beforeEach(async () => {
            //
            const mintTxn = await gameNftContract
                .connect(acct1)
                .initialize(gameName, to_ETH(gameAnte), playerLimit, {
                    value: to_ETH(gameNftCost + gameAnte),
                });
            //
            await mintTxn.wait();
            //
            let joinTxn = await gameNftContract
                .connect(acct2)
                .joinGame(testGameId, { value: to_ETH(gameAnte) });
            //
            await joinTxn.wait();
            //
            joinTxn = await gameNftContract
                .connect(acct3)
                .joinGame(testGameId, { value: to_ETH(gameAnte) });
            //
            await joinTxn.wait();
        });
        //
        it("Contract has correct balance after three joins", async () => {
            //
            const gamePlayers = await gameNftContract.getGamePlayers(testGameId);
            const contractBalance = await gameNftContract.getContractBalance();
            const expectedBalance = gameAnte * gamePlayers.length + gameNftCost;
            //
            expect(contractBalance).to.be.equal(to_ETH(expectedBalance));
        });
        it("Allows owner-player to finalize game", async () => {
            //
            const finalizeTxn = await gameNftContract
                .connect(acct1)
                .finalize(testGameId, acct2.address);
            //
            const result = await finalizeTxn.wait();
            //
            expect(result.status).to.be.equal(1);
        });
        it("Distributes escrow to winner when finalized", async () => {
            //
            const gameData = await gameNftContract.getGameData(testGameId);
            //
            const acct2Balance_PRE = await ethers.provider.getBalance(acct2.address);
            //
            const finalizeTxn = await gameNftContract
                .connect(acct1)
                .finalize(testGameId, acct2.address);
            //
            const result = await finalizeTxn.wait();
            //
            const acct2Balance_POST = await ethers.provider.getBalance(acct2.address);
            //
            const x = to_NUM(acct2Balance_PRE);
            const y = to_NUM(gameData[4]);
            //
            expect(result.status).to.be.equal(1);
            expect(to_NUM(acct2Balance_POST)).to.be.equal(x + y);
        });
    });
});
