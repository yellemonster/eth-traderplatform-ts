//
//
const hre = require("hardhat");
//
//
// const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";
//
//
function to_ETH(x) {
    return ethers.parseUnits(x.toString(), "ether");
}
function to_NUM(x) {
    return parseInt(ethers.formatUnits(x, "ether"));
}
function rInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const wait = (seconds) => {
    const milliseconds = seconds * 1000;
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
//
//
async function main() {
    // await Trade();
    await Mint();
}
//
//
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//
//
async function Trade() {
    //
    //
    const [deployer, acct1, acct2, acct3] = await ethers.getSigners();
    //
    //
    const Exchange_OBJ = await ethers.getContractFactory("MyExchange");
    const myExchange = await Exchange_OBJ.deploy(deployer, 10);
    await myExchange.waitForDeployment();
    //
    //
    const MyToken_OBJ = await ethers.getContractFactory("MyToken");
    const tokenSupply = to_ETH(1000000);
    const tokenSymbols = [
        { name: "Blue", sym: "BLU" },
        { name: "Green", sym: "GRN" },
        { name: "Red", sym: "RED" },
        { name: "Yellow", sym: "YLW" },
    ];
    //
    //
    for (let i = 0; i < tokenSymbols.length; i++) {
        //
        const { name, sym } = tokenSymbols[i];
        //
        const myToken = await MyToken_OBJ.deploy(name, sym, tokenSupply);
        await myToken.waitForDeployment();
        //
        const tokenAddr = myToken.target;
        //
        const newTokenListingTxn = await myExchange.listToken(tokenAddr, sym);
        const receipt = await newTokenListingTxn.wait();
        //
        const token_startQty1 = rInt(500, 1000);
        const token_startQty2 = rInt(500, 1000);
        const token_startQty3 = rInt(500, 1000);
        //
        await myToken.transfer(acct1.address, to_ETH(token_startQty1));
        await myToken.transfer(acct2.address, to_ETH(token_startQty2));
        await myToken.transfer(acct3.address, to_ETH(token_startQty3));
        //
        console.log(`*** >>> ${sym} deployed: ${tokenAddr}`);
        //
        if (receipt.status === 1) {
            console.log(`*** >>> ${sym} listed on exchange\n`);
        } else {
            console.log(`*** >>> ${sym} failed to list\n`);
        }
    }
    //
    //
    console.log(`\n*** >>> Deployed exchange contract at: ${myExchange.target}\n`);
    console.log("\n*** >>> Deployment fini\n");
    //
    //
}
async function Mint() {
    //
    const [deployer] = await ethers.getSigners();
    //
    const exchangeName = "MyExchange";
    //
    const ercName = "MyToken";
    const ercSymbol = "MTK";
    //
    const nftName = "FactionNFT";
    const nftSymbol = "FNFT";
    const baseURI = "i101.app";
    //
    // -------------------------------------
    const gameNftCost = 1;
    const gameNftName = "GameNFT";
    const gameNftSymbol = "GNFT";
    const baseGameTokenURI = "oligarch.app";
    // -------------------------------------
    //
    const nftFactory = await ethers.getContractFactory(nftName);
    const nftContract = await nftFactory.deploy(
        nftName,
        nftSymbol,
        ercName,
        ercSymbol,
        baseURI
    );
    await nftContract.waitForDeployment();
    //
    const exchangeFactory = await ethers.getContractFactory(exchangeName);
    const exchangeContract = await exchangeFactory.deploy(deployer, 10);
    await exchangeContract.waitForDeployment();
    //
    //
    const tokenAddress = await nftContract.getMyTokenAddress();
    const listTokenTxn = await exchangeContract.listToken(tokenAddress, ercSymbol);
    const tokenReceipt = await listTokenTxn.wait();
    //
    //
    if (tokenReceipt.status === 1) {
        console.log("Token listed on exchange");
    }
    //
    //
    gameNftFactory = await ethers.getContractFactory(gameNftName);
    gameNftContract = await gameNftFactory.deploy(
        gameNftName,
        gameNftSymbol,
        baseGameTokenURI,
        tokenAddress
    );
    await gameNftContract.waitForDeployment();
    //
    //
    console.log(`\n*** >>> Deployed [Game] contract at: ${gameNftContract.target}`);
    console.log(`*** >>> Deployed [ERC] contract at: ${tokenAddress}`);
    console.log(`*** >>> Deployed [NFT] contract at: ${nftContract.target}`);
    console.log(`*** >>> Deployed [exchange] contract at: ${exchangeContract.target}\n`);
}
