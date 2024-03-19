//
//
import React from "react";
import MyInput from "../../hooks/MyInput";
import MySelect from "../../hooks/MySelect";
//
import MyToken_ABI from "../../abis/MyToken.json";
import GameNFT_ABI from "../../abis/GameNFT.json";
//
import { ethers } from "ethers";
import { H, T, qBtn } from "../../../../__PKG__/X";
import { FaAngleDown, FaAngleUp, FaEthereum } from "react-icons/fa";
import { RootCntxType, UseRoot, to_ETH, to_NUM } from "../../providers/RootCntx";
//
//
const GameNFT_ADDR = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
//
//
const labelCls = "C-M4 FS-1-8 MB-05";
const valueCls = "BG-D8 SH-I FS-2 c-bs SP TXT-E";
//
//
function parse_events(eventFilter: any): {
    inits: T.GameInit[];
    finis: T.GameFini[];
    joins: T.GameJoin[];
} {
    //
    //
    const parse_inits = (): T.GameInit[] => {
        //
        const _events = eventFilter.filter(
            (e: any) => e.fragment?.name === "GameInitialized"
        );
        //
        return _events.map((evt: any) => {
            //
            return {
                gameId: parseInt(evt.args[0].toString()),
                owner: evt.args[1].toLowerCase(),
            };
        });
    };
    const parse_finis = (): T.GameFini[] => {
        //
        const _events = eventFilter.filter(
            (e: any) => e.fragment?.name === "GameFinalized"
        );
        //
        return _events.map((evt: any) => {
            //
            return {
                gameId: parseInt(evt.args[0].toString()),
                winner: evt.args[1].toLowerCase(),
            };
        });
    };
    const parse_joins = (): T.GameJoin[] => {
        //
        const _events = eventFilter.filter((e: any) => e.fragment?.name === "GameJoined");
        //
        return _events.map((evt: any) => {
            //
            return {
                gameId: parseInt(evt.args[0].toString()),
                player: evt.args[1].toLowerCase(),
            };
        });
    };
    //
    //
    return {
        inits: parse_inits(),
        finis: parse_finis(),
        joins: parse_joins(),
    };
}
//
//
//
export default function GameScreen() {
    //
    const { provider, ethAddr, set_userAlerts } = UseRoot() as RootCntxType;
    //
    const [nftContract, set_nftContract] = React.useState<any>(null);
    const [ercContract, set_ercContract] = React.useState<any>(null);
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
    const [cEthBal, set_cEthBal] = React.useState<number>(0);
    const [userNFTs, set_userNFTs] = React.useState<number[]>([]);
    const [userERCs, set_userERCs] = React.useState<number>(0);
    //
    const [allGames, set_allGames] = React.useState<T.GameDat[]>([]);
    //
    const [initEvents, set_initEvents] = React.useState<T.GameInit[]>([]);
    const [finiEvents, set_finiEvents] = React.useState<T.GameFini[]>([]);
    const [joinEvents, set_joinEvents] = React.useState<T.GameJoin[]>([]);
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const [newGameAnte, set_newGameAnte] = React.useState<number>(1);
    const [playerLimit, set_playerLimit] = React.useState<number>(2);
    //
    const [selGame, set_selGame] = React.useState<T.GameDat | null>(null);
    const [selGamePlyrs, set_selGamePlyrs] = React.useState<string[]>([]);
    //
    // const alias_input = MyInput("enter player alias", "", false, T.InpType.TXT, "SP");
    const gameName_input = MyInput("enter game name", "", false, T.InpType.TXT, "SP");
    //
    const [selWinPlyr, winnerSelect] = MySelect(selGamePlyrs);
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
        //
        let _nftCost = await _nftContract.getGameCost();
        _nftCost = to_NUM(_nftCost);
        //
        //
        let _nftSupply = await _nftContract.getGameCount();
        _nftSupply = parseInt(_nftSupply.toString());
        //
        //
        let _allGames = [];
        for (let i = 1; i <= _nftSupply; i++) {
            //
            const g = await _nftContract.getGameData(i);
            //
            const gDat: T.GameDat = {
                gameId: parseInt(g[0].toString()),
                name: g[1],
                ante: to_NUM(g[2]),
                limit: parseInt(g[3].toString()),
                escrow: to_NUM(g[4]),
                creator: g[5],
                isFini: g[6],
            };
            //
            _allGames.push(gDat);
        }
        //
        //
        set_ercSupply(_ercSupply);
        set_nftSupply(_nftSupply);
        set_nftCost(_nftCost);
        //
        //
        set_allGames(_allGames);
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
        let _userNFTs = await _nftContract.getGamesByUser(ethAddr);
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
        const _gameContract = new ethers.Contract(GameNFT_ADDR, GameNFT_ABI, _provider);
        const tokenAddress = await _gameContract.getTokenAddress();
        //
        const _ercContract = new ethers.Contract(tokenAddress, MyToken_ABI, _provider);
        //
        const _nftName = await _gameContract.name();
        const _nftSymbol = await _gameContract.symbol();
        //
        const _ercName = await _ercContract.name();
        const _ercSymbol = await _ercContract.symbol();
        //
        set_nftContract(_gameContract);
        set_ercContract(_ercContract);
        //
        set_nftName(_nftName);
        set_nftSymbol(_nftSymbol);
        //
        set_ercName(_ercName);
        set_ercSymbol(_ercSymbol);
        //
        return { _gameContract, _ercContract };
    };
    const load_events = async (_gameContract: any, _ercCntract: any) => {
        //
        //
        const filter = await _gameContract.queryFilter("*");
        const { inits, finis, joins } = parse_events(filter);
        //
        // console.log("inits - ", inits);
        // console.log("finis - ", finis);
        // console.log("joins - ", joins);
        //
        set_initEvents(inits);
        set_finiEvents(finis);
        set_joinEvents(joins);
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
        const { _gameContract, _ercContract } = await load_contracts(provider);
        load_balances(provider, ethAddr, _gameContract, _ercContract);
        load_events(_gameContract, _ercContract);
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const newGameAnte_up = () => {
        if (newGameAnte < 10) {
            set_newGameAnte(newGameAnte + 1);
        } else if (newGameAnte < 50) {
            set_newGameAnte(newGameAnte + 5);
        } else if (newGameAnte < 100) {
            set_newGameAnte(newGameAnte + 10);
        } else if (newGameAnte < 250) {
            set_newGameAnte(newGameAnte + 25);
        } else if (newGameAnte < 500) {
            set_newGameAnte(newGameAnte + 50);
        } else if (newGameAnte < 1000) {
            set_newGameAnte(newGameAnte + 100);
        }
    };
    const newGameAnte_down = () => {
        if (newGameAnte > 500) {
            set_newGameAnte(newGameAnte - 100);
        } else if (newGameAnte > 250) {
            set_newGameAnte(newGameAnte - 50);
        } else if (newGameAnte > 100) {
            set_newGameAnte(newGameAnte - 25);
        } else if (newGameAnte > 50) {
            set_newGameAnte(newGameAnte - 10);
        } else if (newGameAnte > 10) {
            set_newGameAnte(newGameAnte - 5);
        } else if (newGameAnte > 1) {
            set_newGameAnte(newGameAnte - 1);
        }
    };
    const playerLimit_up = () => {
        if (playerLimit < 10) {
            set_playerLimit(playerLimit + 1);
        }
    };
    const playerLimit_down = () => {
        if (playerLimit > 2 && playerLimit <= 10) {
            set_playerLimit(playerLimit - 1);
        }
    };
    const clk_activeGame = async (gameDat: T.GameDat) => {
        const plyrs = await nftContract.getGamePlayers(gameDat.gameId);
        set_selGame(gameDat);
        set_selGamePlyrs(plyrs);
    };
    //
    //
    const clk_init = async () => {
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
            const META_DATA = { value: to_ETH(nftCost + newGameAnte) };
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const mintTxn = await nftContract
                .connect(signer)
                .initialize(
                    gameName_input.value,
                    to_ETH(newGameAnte),
                    playerLimit,
                    META_DATA
                );
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
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
    const clk_join = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "New join fail", details: ["No provider detected"] },
            ]);
        } else if (!selGame) {
            return set_userAlerts([
                { header: "New join fail", details: ["No selGame detected"] },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            // -----------------------------------------------------
            const signer = await provider.getSigner();
            const META_DATA = { value: to_ETH(selGame.ante) };
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const joinTxn = await nftContract
                .connect(signer)
                .joinGame(selGame?.gameId, META_DATA);
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const receipt = await joinTxn.wait();
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
                    header: "Game join failed",
                    details: [error.reason],
                },
            ]);
        }
    };
    const clk_finalize = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Finalize fail", details: ["No [provider] detected"] },
            ]);
        } else if (!selGame) {
            return set_userAlerts([
                { header: "Finalize fail", details: ["No [selGame] detected"] },
            ]);
        } else if (!selWinPlyr) {
            return set_userAlerts([
                { header: "Finalize fail", details: ["No [selWinPlyr] detected"] },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            // -----------------------------------------------------
            const signer = await provider.getSigner();
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const finiTxn = await nftContract
                .connect(signer)
                .finalize(selGame?.gameId, selWinPlyr);
            // -----------------------------------------------------
            //
            // -----------------------------------------------------
            const receipt = await finiTxn.wait();
            console.log("[mint] - receipt - ", receipt);
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
                    header: "Game join failed",
                    details: [error.reason],
                },
            ]);
        }
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const activeGames = () => {
        //
        return (
            <div className="Panel-D SH">
                <div className={H.headerCls}>Active games</div>
                {allGames.length > 0 ? (
                    <div>
                        {allGames.map((ag, key) => {
                            //
                            const isSelGame = selGame?.name === ag.name;
                            //
                            const c2 = " HCP SP-Y-05 P-2 H-BG-D9";
                            const c1 = key % 2 === 0 ? "" : " BG-D8";
                            const c3 = isSelGame ? " BL-5-R BR-5-R SH-I BG-D9" : "";
                            const cls = c1 + c2 + c3;
                            //
                            const nc1 = "FS-2-2 ";
                            const nc2 = isSelGame ? "c-y" : "C-M4";
                            const nameCls = nc1 + nc2;
                            //
                            //
                            return (
                                <div key={key} onClick={() => clk_activeGame(ag)}>
                                    <div className={cls}>
                                        <div className={nameCls}>{ag.name}</div>
                                        {isSelGame && (
                                            <div className="Split-2 GG-1">
                                                <div className="BG-D8 B-1-D10 SP MT-1">
                                                    <div className="DF AC JSB">
                                                        <div className="FS-1-8 C-M12 No-SH">
                                                            Creator
                                                        </div>
                                                        <div className="FS-1-8 c-b">
                                                            {H.shortAcct(ag.creator)}
                                                        </div>
                                                    </div>
                                                    <div className="DF AC JSB">
                                                        <div className="FS-1-8 C-M12 No-SH">
                                                            Ante
                                                        </div>
                                                        <div className="FS-1-8 c-b">
                                                            {ag.ante}
                                                        </div>
                                                    </div>

                                                    <div className="DF AC JSB">
                                                        <div className="FS-1-8 C-M12 No-SH">
                                                            Escrow
                                                        </div>
                                                        <div className="FS-1-8 c-b">
                                                            {ag.escrow}
                                                        </div>
                                                    </div>
                                                    <div className="DF AC JSB">
                                                        <div className="FS-1-8 C-M12 No-SH">
                                                            Player limit
                                                        </div>
                                                        <div className="FS-1-8 c-b">
                                                            {ag.limit}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="P-2 FS-3 TXT-C c-r">No active games</div>
                )}
            </div>
        );
    };
    const newGamePanel = () => {
        //
        return (
            <div className="Split-2 AS GG-1">
                <div className="Panel-D SH">
                    <div className={H.headerCls}>New game</div>
                    <div className="P-1 SP-Y-1">
                        {/* <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Alias</div>
                            {alias_input.component}
                        </div> */}
                        <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Name</div>
                            {gameName_input.component}
                        </div>
                        {/* <div className="Split-1-2 AC GG-1">
                        <div className={labelCls}>Password</div>
                        {password_input.component}
                    </div> */}
                        <div className="DF AC JSB">
                            <div className={labelCls}>Ante</div>
                            <div className="Split-1-1-3 AC GG-1">
                                <button
                                    className="DF AC JC P-05 Btn c-r"
                                    onClick={newGameAnte_down}
                                >
                                    <FaAngleDown size="2em" />
                                </button>
                                <button
                                    className="DF AC JC P-05 Btn c-g"
                                    onClick={newGameAnte_up}
                                >
                                    <FaAngleUp size="2em" />
                                </button>
                                <div className="FS-2 C-L10 H-100 TXT-C BG-D8 PT-03">
                                    {newGameAnte}
                                </div>
                            </div>
                        </div>
                        <div className="DF AC JSB">
                            <div className={labelCls}>Player limit</div>
                            <div className="Split-1-1-3 AC GG-1">
                                <button
                                    className="DF AC JC P-05 Btn c-r"
                                    onClick={playerLimit_down}
                                >
                                    <FaAngleDown size="2em" />
                                </button>
                                <button
                                    className="DF AC JC P-05 Btn c-g"
                                    onClick={playerLimit_up}
                                >
                                    <FaAngleUp size="2em" />
                                </button>
                                <div className="FS-2 C-L10 H-100 TXT-C BG-D8 PT-03">
                                    {playerLimit}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="P-1 BG-D8 DF AC JCE">
                        <button className={qBtn} onClick={clk_init}>
                            Initialize
                        </button>
                    </div>
                </div>
                <div className="Panel-D SH">
                    <div className={H.headerCls}>Init events</div>
                    <div className="Scroll MPH-220">
                        {initEvents.map((ie, key) => {
                            //
                            const c2 = " DF AC JSB SP";
                            const c1 = key % 2 === 0 ? "" : " BG-D8";
                            const cls = c1 + c2;
                            //
                            //
                            return (
                                <div key={key} className={cls}>
                                    <div className="FS-1-8 c-blz">{ie.gameId}</div>
                                    <div className="FS-1-8 c-y">
                                        {H.shortAcct(ie.owner)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };
    const joinGamePanel = () => {
        //
        if (!selGame) {
            return "";
        }
        //
        return (
            <div className="Split-2 AS GG-1">
                <div className="Panel-D SH">
                    <div className={H.headerCls}>Join game</div>
                    <div className="P-1 SP-Y-1">
                        <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Name</div>
                            <div className={valueCls}>{selGame.name}</div>
                        </div>
                        <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Ante</div>
                            <div className={valueCls}>{selGame.ante}</div>
                        </div>
                        {/* <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Alias</div>
                            {alias_input.component}
                        </div> */}
                        {/* <div className="Split-1-2 AC GG-1">
                        <div className={labelCls}>Password</div>
                        {selGamePassword_input.component}
                    </div> */}
                    </div>
                    <div className="P-1 BG-D8 SP-X-1 JCE">
                        <button className={qBtn} onClick={clk_join}>
                            Join
                        </button>
                    </div>
                </div>
                <div className="Panel-D SH">
                    <div className={H.headerCls}>Join events</div>
                    <div className="Scroll MPH-220">
                        {joinEvents.map((ie, key) => {
                            //
                            const c2 = " DF AC JSB SP";
                            const c1 = key % 2 === 0 ? "" : " BG-D8";
                            const cls = c1 + c2;
                            //
                            //
                            return (
                                <div key={key} className={cls}>
                                    <div className="FS-1-8 c-blz">{ie.gameId}</div>
                                    <div className="FS-1-8 c-b">
                                        {H.shortAcct(ie.player)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };
    const endGamePanel = () => {
        //
        if (!selGame) {
            return "";
        }
        //
        return (
            <div className="Split-2 AS GG-1">
                <div className="Panel-D SH">
                    <div className={H.headerCls}>End game</div>
                    <div className="P-1 SP-Y-1">
                        <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Name</div>
                            <div className={valueCls}>{selGame.name}</div>
                        </div>
                        <div className="Split-1-2 AC GG-1">
                            <div className={labelCls}>Prize</div>
                            <div className={valueCls}>
                                <div className="DF AC JCE c-g">
                                    <div className="FS-2 MR-05">{selGame.escrow}</div>
                                    <FaEthereum size="2em" />
                                </div>
                            </div>
                        </div>
                        <div className="Split-1-2 AC">
                            <div className={labelCls}>Winner</div>
                            <div className="FS-2 c-bs SP TXT-E">{winnerSelect}</div>
                        </div>
                    </div>
                    <div className="P-1 BG-D8 SP-X-1 JCE">
                        <button className={qBtn} onClick={clk_finalize}>
                            Finalize
                        </button>
                    </div>
                </div>
                <div className="Panel-D SH">
                    <div className={H.headerCls}>Fini events</div>
                    <div className="Scroll MPH-220">
                        {finiEvents.map((ie, key) => {
                            //
                            const c2 = " DF AC JSB SP";
                            const c1 = key % 2 === 0 ? "" : " BG-D8";
                            const cls = c1 + c2;
                            //
                            //
                            return (
                                <div key={key} className={cls}>
                                    <div className="FS-1-8 c-blz">{ie.gameId}</div>
                                    <div className="FS-1-8 c-r">
                                        {H.shortAcct(ie.winner)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
        <div className="Split-2 GG-2 AS">
            {activeGames()}
            <div className="SP-Y-2">
                {newGamePanel()}
                {joinGamePanel()}
                {endGamePanel()}
            </div>
        </div>
    );
}
