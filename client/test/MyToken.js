//
//
const { expect } = require("chai");
//
const EVM_REVERT = "Unauthorized Ether deposit reverted via Fallback function";
//
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
function calc_gasCost(result) {
    const gasUsed = parseInt(result.gasUsed.toString());
    const gasPriceInWei = parseFloat(result.gasPrice.toString());
    const gasCostInWei = gasUsed * gasPriceInWei;
    return tokens(gasCostInWei);
}
//
//
describe("Token Exchange", () => {
    //
    //
    const tokenName = "MyToken";
    const tokenSymbol = "MYT";
    const tokenSupply = 0;
    //
    const exchangeName = "MyExchange";
    const feePercent = 10;
    //
    let MyToken_OBJ;
    let Exchange_OBJ;
    //
    let myToken;
    let myExchange;
    //
    //
    let deployer;
    let acct1;
    let acct2;
    let acct3;
    //
    //
    beforeEach(async () => {
        //
        [deployer, feeAccount, acct1, acct2, acct3] = await ethers.getSigners();
        //
        //
        MyToken_OBJ = await ethers.getContractFactory(tokenName);
        Exchange_OBJ = await ethers.getContractFactory(exchangeName);
        //
        myToken = await MyToken_OBJ.connect(deployer).deploy(
            tokenName,
            tokenSymbol,
            to_ETH(tokenSupply)
        );
        myExchange = await Exchange_OBJ.deploy(feeAccount, feePercent);
        //
    });
    //
    //
    describe("MyToken - deployment", () => {
        //
        it("sets the token name", async () => {
            const result = await myToken.name();
            expect(result).to.be.equal(tokenName);
        });
        it("sets the token supply", async () => {
            const result = await myToken.totalSupply();
            expect(result).to.be.equal(to_ETH(tokenSupply));
        });
    });
    describe("MyExchange - deployment", () => {
        it("tracks the fee account", async () => {
            const result = await myExchange.feeAccount();
            expect(result).to.be.equal(feeAccount);
        });
        it("tracks the fee percent", async () => {
            const result = await myExchange.feePercent();
            expect(result.toString()).to.be.equal(feePercent.toString());
        });
    });

    describe("Exchange fallback", () => {
        it("reverts when Ether is sent", async () => {
            //
            const testTxn = acct1.sendTransaction({
                to: myExchange.target,
                value: to_ETH(1),
            });
            //
            await expect(testTxn).to.be.revertedWith(EVM_REVERT);
        });
    });
    describe("Token fallback", () => {
        it("reverts when Ether is sent", async () => {
            //
            const testTxn = acct1.sendTransaction({
                to: myToken.target,
                value: to_ETH(1),
            });
            //
            await expect(testTxn).to.be.revertedWith(EVM_REVERT);
        });
    });
});
