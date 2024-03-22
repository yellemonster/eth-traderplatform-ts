//
//
import React from "react";
//
import { FaAngleDoubleRight, FaEthereum, FaFire } from "react-icons/fa";
import { RootCntxType, UseRoot, to_ETH, to_NUM } from "../../providers/RootCntx";
import { T, H, qBtn } from "../../../../__PKG__/X";
import { BiTransfer } from "react-icons/bi";
import { ethers } from "ethers";
//
import FactionNFT_ABI from "../../abis/FactionNFT.json";
import MyToken_ABI from "../../abis/MyToken.json";
import MySwap_ABI from "../../abis/MySwap.json";
import EthPrice from "../EthPrice";
import { EthCntxType, UseEth } from "../../providers/EthCntx";
//
const NFT_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//
//
const labelCls = "C-M4 FS-1-8 MB-05";
const valueCls = "BG-D8 SH-I FS-2 c-bs SP TXT-E";
//
//
function parse_events(eventFilter: any): {
    mints: T.Mint[];
    burns: T.Burn[];
} {
    //
    //
    const parse_mints = () => {
        //
        const _events = eventFilter.filter(
            (e: any) => e.fragment?.name === "TokenMinted"
        );
        //
        return _events.map((evt: any) => {
            //
            return {
                owner: evt.args[0].toLowerCase(),
                tokenId: parseInt(evt.args[1].toString()),
            };
        });
    };
    const parse_burns = () => {
        //
        const _events = eventFilter.filter(
            (e: any) => e.fragment?.name === "TokenBurned"
        );
        //
        return _events.map((evt: any) => {
            //
            return {
                owner: evt.args[0].toLowerCase(),
                tokenId: parseInt(evt.args[1].toString()),
            };
        });
    };
    //
    //
    return {
        mints: parse_mints(),
        burns: parse_burns(),
    };
}
//
//
export default function MintScreen() {
    //
    //
    const { provider, ethAddr } = UseEth() as EthCntxType;
    const { set_userAlerts } = UseRoot() as RootCntxType;
    //
    //
    const [nftContract, set_nftContract] = React.useState<any>(null);
    const [ercContract, set_ercContract] = React.useState<any>(null);
    const [swapContract, set_swapContract] = React.useState<any>(null);
    //
    const [nftName, set_nftName] = React.useState<string>("");
    const [nftCost, set_nftCost] = React.useState<number>(0);
    const [nftSupply, set_nftSupply] = React.useState<number>(0);
    const [nftSymbol, set_nftSymbol] = React.useState<string>("");
    const [nftBalance, set_nftBalance] = React.useState<number>(0);
    //
    const [ercName, set_ercName] = React.useState<string>("");
    const [ercSymbol, set_ercSymbol] = React.useState<string>("");
    const [ercSupply, set_ercSupply] = React.useState<number>(0);
    //
    const [swapName, set_swapName] = React.useState<string>("");
    const [swapRate, set_swapRate] = React.useState<number>(0);
    //
    const [cEthBal, set_cEthBal] = React.useState<number>(0);
    const [userNFTs, set_userNFTs] = React.useState<number[]>([]);
    const [userERCs, set_userERCs] = React.useState<number>(0);
    //
    const [mintEvents, set_mintEvents] = React.useState<T.Mint[]>([]);
    const [burnEvents, set_burnEvents] = React.useState<T.Burn[]>([]);
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const [tokenSwapQty, set_tokenSwapQty] = React.useState<number | null>(null);
    const [ethSwapAmt, set_ethSwapAmt] = React.useState<number | null>(null);
    //
    const tokenInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const x: number = parseFloat(event.target.value);
        const val = x / swapRate;
        set_ethSwapAmt(val);
        set_tokenSwapQty(x);
    };
    const ethInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const x: number = parseFloat(event.target.value);
        const val = x * swapRate;
        set_tokenSwapQty(val);
        set_ethSwapAmt(x);
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const load_balances = async (
        _provider: ethers.BrowserProvider,
        _ethAddr: string,
        _nftContract: any,
        _ercContract: any
    ) => {
        //
        //
        // -------------------------------------------------------
        let _ercSupply = await _ercContract.totalSupply();
        _ercSupply = to_NUM(_ercSupply);
        //
        let _nftCost = await _nftContract.getTokenCost();
        _nftCost = to_NUM(_nftCost);
        //
        let _nftSupply = await _nftContract.getTokenCount();
        _nftSupply = parseInt(_nftSupply.toString());
        //
        //
        set_ercSupply(_ercSupply);
        set_nftSupply(_nftSupply);
        set_nftCost(_nftCost);
        // -------------------------------------------------------
        //
        // -------------------------------------------------------
        const nftContractBal = await _provider.getBalance(_nftContract.target);
        const _nftBalance = to_NUM(nftContractBal.toString());
        set_nftBalance(_nftBalance);
        //
        const _userEthBal = await _provider.getBalance(ethAddr);
        const _cEthBal = to_NUM(_userEthBal.toString());
        set_cEthBal(_cEthBal);
        //
        let _userNFTs = await _nftContract.getTokensByUser(ethAddr);
        _userNFTs = _userNFTs.map((x: any) => parseInt(x.toString()));
        set_userNFTs(_userNFTs);
        //
        let _userERCs = await _ercContract.balanceOf(ethAddr);
        _userERCs = to_NUM(_userERCs);
        set_userERCs(_userERCs);
        // -------------------------------------------------------
        //
    };
    const load_contracts = async (_provider: ethers.BrowserProvider) => {
        //
        //
        const _nftContract = new ethers.Contract(NFT_ADDR, FactionNFT_ABI, _provider);
        const tokenAddress = await _nftContract.getMyTokenAddress();
        //
        const _ercContract = new ethers.Contract(tokenAddress, MyToken_ABI, _provider);
        //
        const _swapAddress = await _ercContract.getMySwapAddress();
        const _swapContract = new ethers.Contract(_swapAddress, MySwap_ABI, _provider);
        //
        const _nftName = await _nftContract.name();
        const _nftSymbol = await _nftContract.symbol();
        //
        const _ercName = await _ercContract.name();
        const _ercSymbol = await _ercContract.symbol();
        //
        set_nftContract(_nftContract);
        set_ercContract(_ercContract);
        //
        set_nftName(_nftName);
        set_nftSymbol(_nftSymbol);
        //
        set_ercName(_ercName);
        set_ercSymbol(_ercSymbol);
        //
        const _swapName = await _swapContract.getName();
        const _swapRate = await _swapContract.swapRate();
        //
        console.log("swapName - ", swapName);
        // console.log("swapRate - ", _swapRate);
        // console.log("swapContract - ", _swapContract);
        //
        set_swapName(_swapName);
        set_swapRate(parseInt(_swapRate.toString()));
        set_swapContract(_swapContract);
        //
        //
        return { _nftContract, _ercContract, _swapContract };
    };
    const load_events = async (_nftContract: any, _ercCntract: any) => {
        //
        //
        const filter = await _nftContract.queryFilter("*");
        const { mints, burns } = parse_events(filter);
        //
        set_mintEvents(mints);
        set_burnEvents(burns);
    };
    const RELOAD = async () => {
        //
        if (!provider) {
            return set_userAlerts([
                {
                    header: "No provider",
                    details: ["Please install Metamask or some other equivalent"],
                },
            ]);
        }
        //
        const { _nftContract, _ercContract } = await load_contracts(provider);
        load_balances(provider, ethAddr, _nftContract, _ercContract);
        load_events(_nftContract, _ercContract);
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const clk_confirmAndMint = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "New mint fail", details: ["No provider detected"] },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            // -----------------------------------------------------
            const signer = await provider.getSigner();
            const META_DATA = { value: to_ETH(nftCost) };
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const stringValue = "Hello, Ethereum!";
            const uintValue = 12345;
            const addressValue = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";
            //
            const encodedData = await nftContract
                .connect(signer)
                .encodeData(stringValue, uintValue, addressValue);
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const mintTxn = await nftContract
                .connect(signer)
                .mint(encodedData, META_DATA);
            //
            const receipt = await mintTxn.wait();
            // console.log("[mint] - receipt - ", receipt);
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([
                {
                    header: "NFT mint failed",
                    details: [error.reason],
                },
            ]);
        }
    };
    const clk_burn = async (tokenId: number) => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Burn attempt fail", details: ["No provider detected"] },
            ]);
        } else if (!tokenId) {
            return set_userAlerts([
                {
                    header: "Burn attempt fail",
                    details: ["No token ID provided"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            // -----------------------------------------------------
            const signer = await provider.getSigner();
            const burnTxn = await nftContract.connect(signer).burn(tokenId);
            const receipt = await burnTxn.wait();
            // -----------------------------------------------------
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([
                {
                    header: "NFT burn failed",
                    details: [error.reason],
                },
            ]);
        }
    };
    const clk_forward = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Forward attempt fail", details: ["No provider detected"] },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            // -----------------------------------------------------
            const signer = await provider.getSigner();
            const forwardTxn = await nftContract.connect(signer).forward();
            const receipt = await forwardTxn.wait();
            // -----------------------------------------------------
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([
                {
                    header: "NFT forward failed",
                    details: [error.reason],
                },
            ]);
        }
    };
    const clk_buyTokens = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                {
                    header: "Burn attempt fail",
                    details: ["No provider detected"],
                },
            ]);
        } else if (!ethSwapAmt) {
            return set_userAlerts([
                {
                    header: "Burn attempt fail",
                    details: ["No swap amount provided"],
                },
            ]);
        } else if (ethSwapAmt > cEthBal) {
            set_userAlerts([
                {
                    header: "No deal!",
                    details: ['"ETH swap value exceeds your balance"'],
                },
            ]);
            return;
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            // -----------------------------------------------------
            const META_DATA = { value: to_ETH(ethSwapAmt) };
            //
            const signer = await provider.getSigner();
            const buyTxn = await swapContract.connect(signer).buyTokens(META_DATA);
            const receipt = await buyTxn.wait();
            // -----------------------------------------------------
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([
                {
                    header: "Token buy failed",
                    details: [error.reason],
                },
            ]);
        }
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const ercPanel = () => {
        return (
            <div className="Panel-D SH">
                <div className="DF AC JSB BG-D9 P-1">
                    <div className="FS-2-4 c-o">ERC</div>
                </div>
                <div className="Split-1-2 AC GG-1 P-1">
                    <div className={labelCls}>Name</div>
                    <div className={valueCls}>{ercName}</div>
                    <div className={labelCls}>Symbol</div>
                    <div className={valueCls}>{ercSymbol}</div>
                    <div className={labelCls}>Supply</div>
                    <div className={valueCls}>{ercSupply}</div>
                </div>
            </div>
        );
    };
    const nftPanel = () => {
        //
        const forwardCls = "B-2-D0 DF AC JC P-05 HCP BG-D4 SH c-b H-2-B H-BG-D10";
        //
        return (
            <div className="Panel-D SH">
                <div className="DF AC JSB BG-D9 P-1">
                    <div className="FS-2-4 c-o">NFT</div>
                    <div className="SP-X-1">
                        <div className="DF AC JCE">
                            <FaEthereum size="1.6em" className="c-g" />
                            <div className="c-g FS-2 ML-05">{nftBalance}</div>
                        </div>
                        {nftBalance > 0 && (
                            <button onClick={clk_forward} className={forwardCls}>
                                <FaAngleDoubleRight size="2em" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="Split-1-2 AC GG-1 P-1">
                    <div className={labelCls}>Name</div>
                    <div className={valueCls}>{nftName}</div>
                    <div className={labelCls}>Symbol</div>
                    <div className={valueCls}>{nftSymbol}</div>
                    <div className={labelCls}>Supply</div>
                    <div className={valueCls}>{nftSupply}</div>
                    <div className={labelCls}>Cost</div>
                    <div className={valueCls}>{nftCost}</div>
                </div>
                <div className="P-1 BG-D9 DF AC JCE">
                    <button className={qBtn} onClick={clk_confirmAndMint}>
                        Mint
                    </button>
                </div>
            </div>
        );
    };
    const swapPanel = () => {
        //
        return (
            <div className="Panel-D SH">
                <div className="DF AC JSB BG-D9 P-1">
                    <div className="FS-2-4 c-o">Swap</div>
                    <div className="SP-X-05">
                        <div className="FS-1-6 c-blz">{ercSymbol}</div>
                        <div className="FS-1-6 c-ys">{H.fNum(swapRate)}</div>
                        <div className="FS-1-6 C-M10">:</div>
                        <EthPrice val={1} clr="c-blz" />
                    </div>
                </div>
                <div className="SP-X-1 ASS PX-1 MT-1">
                    <div>
                        <div className="FS-1-8 C-M10 MB-025">Tokens</div>
                        <input
                            type="number"
                            className="Input FG-1 SH-I SP PB-05 c-blz"
                            onChange={tokenInputHandler}
                            placeholder={ercSymbol}
                            disabled={false}
                            value={tokenSwapQty ? tokenSwapQty : ""}
                        />
                    </div>
                    <div className="DF AE JC">
                        <BiTransfer className="C-M10" size={"4em"} />
                    </div>
                    <div>
                        <div className="FS-1-8 TXT-E C-M10 MB-025">Ether</div>
                        <input
                            type="text"
                            className="Input TXT-E SH-I SP PR-1 PB-05 c-gs"
                            onChange={ethInputHandler}
                            placeholder="ETH"
                            disabled={true}
                            value={ethSwapAmt ? ethSwapAmt : ""}
                        />
                    </div>
                </div>
                <div className="P-1 SP-Y-1 LCR">
                    {/* <div className="BG-D7 B-1-D8 DF AC JC P-1-5">
                        {ethSwapAmt && tokenSwapQty ? (
                            <div className="FS-2 TXT-C c-ys">{`Swap ${H.fNum(
                                ethSwapAmt,
                                0,
                                3
                            )} ETH for ${H.fNum(tokenSwapQty, 0, 3)} ${ercSymbol}`}</div>
                        ) : (
                            ""
                        )}
                    </div> */}
                    <button className={qBtn} onClick={clk_buyTokens}>
                        Buy
                    </button>
                </div>
            </div>
        );
    };
    const userPanel = () => {
        //
        const burnCls = "B-2-D0 DF AC JC P-05 HCP BG-D4 SH c-r H-2-R H-BG-D10";
        //
        return (
            <div className="Panel-D SH">
                <div className="DF AC JSB BG-D9 P-1">
                    <div className="FS-2-4 c-o">User</div>
                    <div className="DF AC JCE">
                        <FaEthereum size="1.6em" className="c-g" />
                        <div className="c-g FS-2 ML-05">{H.toX(cEthBal, 3)}</div>
                    </div>
                </div>
                <div className="Split-1-2 AC GG-1 PX-1 MT-1">
                    <div className={labelCls}>NFTs</div>
                    <div className={valueCls}>{userNFTs.length}</div>
                </div>
                <div className="Split-1-2 AC GG-1 PX-1 MT-1">
                    <div className={labelCls}>ERCs</div>
                    <div className={valueCls}>{userERCs}</div>
                </div>
                {userNFTs.length > 0 ? (
                    <div className="SH-I BG-D9 MT-1">
                        {userNFTs.map((t, key) => {
                            //
                            const c1 = "DF AC JSB P-1 ";
                            const c2 = key === 0 ? " " : " BT-1-D6";
                            const c3 = key % 2 === 0 ? "" : " BG-D8";
                            const cls = c1 + c2 + c3;
                            //
                            return (
                                <div key={key} className={cls}>
                                    <div className="FS-2 c-blz TXT-E">FNFT: {t}</div>
                                    <button
                                        className={burnCls}
                                        onClick={() => clk_burn(t)}
                                    >
                                        <FaFire size="2em" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="TXT-C BG-D8 MT-1 P-1 FS-2 c-r">
                        No tokens on record
                    </div>
                )}
            </div>
        );
    };
    const mintPanel = () => {
        //
        // console.log("mints - ", mintEvents);
        //
        return (
            <div className="Panel-D SH">
                <div className={H.headerCls}>Mints</div>
                <div className="Scroll MPH-380 PR-1">
                    {mintEvents.map((m, key) => {
                        //
                        const c1 = "DF AC JSB SP";
                        const c2 = key % 2 === 0 ? "" : " BG-D5";
                        const cls = c1 + c2;
                        //
                        return (
                            <div key={key} className={cls}>
                                <div className="FS-2 c-blz">{m.tokenId}</div>
                                <div className="FS-1-6 c-b">{H.shortAcct(m.owner)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    const burnPanel = () => {
        //
        // console.log("burns - ", burnEvents);
        //
        return (
            <div className="Panel-D SH">
                <div className={H.headerCls}>Burns</div>
                <div className="Scroll MPH-380 PR-1">
                    {burnEvents.map((m, key) => {
                        //
                        const c1 = "DF AC JSB SP";
                        const c2 = key % 2 === 0 ? "" : " BG-D6";
                        const cls = c1 + c2;
                        //
                        return (
                            <div key={key} className={cls}>
                                <div className="FS-2 c-blz">{m.tokenId}</div>
                                <div className="FS-1-6 c-r">{H.shortAcct(m.owner)}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    React.useEffect(() => {
        RELOAD();
    }, [ethAddr]);
    // ---------------------------------------------------------------------------------
    //
    return (
        <div className="Split-4 GG-2 AS">
            <div className="SP-Y-2">
                {ercContract && ercPanel()}
                {nftContract && nftPanel()}
                {swapContract && swapPanel()}
            </div>
            {userPanel()}
            <div />
            <div className="Split-2R GG-2 AS">
                {mintEvents.length > 0 && mintPanel()}
                {burnEvents.length > 0 && burnPanel()}
            </div>
        </div>
    );
}
