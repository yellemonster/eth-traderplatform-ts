//
//
import React from "react";
import { ethers } from "ethers";
//
import { FaAngleDoubleLeft, FaEthereum } from "react-icons/fa";
import { to_NUM, to_ETH, UseRoot, RootCntxType } from "../../providers/RootCntx";
import { fNum, headerCls } from "../../../../__PKG__/util/H";
import { H, T } from "../../../../__PKG__/X";
//
import MYEXCHANGE_ABI from "../../abis/MyExchange.json";
import MYTOKEN_ABI from "../../abis/MyToken.json";
import { EthCntxType, UseEth } from "../../providers/EthCntx";
//
//
const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";
const EXCHANGE_ADDR = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
//
//
const setOrderPrice = (order: T.OrderDat) => {
    //
    let numerator;
    let denominator;

    if (order.tokenGive !== ETHER_ADDRESS) {
        numerator = order.amountGive;
        denominator = order.amountGet;
    } else {
        numerator = order.amountGet;
        denominator = order.amountGive;
    }

    let tokenPrice = numerator / denominator;

    return {
        ...order,
        tokenPrice,
    };
};
//
//
const parse_TokenDat = (tokenDat: any) => {
    //
    return {
        id: tokenDat[0].toString(),
        addr: tokenDat[1].toLowerCase(),
        symbol: tokenDat[2].toUpperCase(),
    };
};
const parse_OrderDat = (orderDats: any) => {
    //
    return orderDats.map((el: any) => {
        //
        return {
            id: el[0].toString(),
            user: el[1].toLowerCase(),
            tokenGet: el[2],
            amountGet: to_NUM(el[3]),
            tokenGive: el[4],
            amountGive: to_NUM(el[5]),
            timestamp: el[6].toString(),
        };
    });
};
function parse_events(eventFilter: any): {
    deposits: T.Deposit[];
    withdrawals: T.Withdrawal[];
    cancels: T.Cancel[];
    trades: T.Trade[];
} {
    //
    //
    const parse_Deposit = () => {
        //
        const _events = eventFilter.filter((e: any) => e.fragment?.name === "Deposit");
        //
        return _events.map((evt: any) => {
            //
            return {
                token: evt.args[0].toLowerCase(),
                user: evt.args[1].toLowerCase(),
                amount: to_NUM(evt.args[2]),
                balance: to_NUM(evt.args[3]),
            };
        });
    };
    const parse_Withdrawals = () => {
        //
        const _events = eventFilter.filter((e: any) => e.fragment?.name === "Withdraw");
        //
        return _events.map((evt: any) => {
            //
            return {
                token: evt.args[0].toLowerCase(),
                user: evt.args[1].toLowerCase(),
                amount: to_NUM(evt.args[2]),
                balance: to_NUM(evt.args[3]),
            };
        });
    };
    const parse_Cancel = () => {
        //
        const _events = eventFilter.filter((e: any) => e.fragment?.name === "Cancel");
        //
        return _events.map((evt: any) => {
            //
            return {
                id: evt.args[0].toString(),
                user: evt.args[1].toLowerCase(),
                tokenGet: evt.args[2],
                amountGet: to_NUM(evt.args[3]),
                tokenGive: evt.args[4],
                amountGive: to_NUM(evt.args[5]),
                timeStamp: evt.args[6].toString(),
            };
        });
    };
    const parse_Trade = () => {
        //
        const _events = eventFilter.filter((e: any) => e.fragment?.name === "Trade");
        //
        return _events.map((evt: any) => {
            //
            return {
                id: evt.args[0].toString(),
                user: evt.args[1].toLowerCase(),
                tokenGet: evt.args[2],
                amountGet: to_NUM(evt.args[3]),
                tokenGive: evt.args[4],
                amountGive: to_NUM(evt.args[5]),
                userFill: evt.args[6].toLowerCase(),
                timeStamp: evt.args[7].toString(),
            };
        });
    };
    //
    //
    return {
        deposits: parse_Deposit(),
        withdrawals: parse_Withdrawals(),
        cancels: parse_Cancel(),
        trades: parse_Trade(),
    };
}
//
//
export default function Orderbook() {
    //
    //
    const { provider, ethAddr } = UseEth() as EthCntxType;
    const { set_userAlerts } = UseRoot() as RootCntxType;
    //
    //
    const [allTokenContracts, set_allTokenContracts] = React.useState<any[]>([]);
    const [exchangeContract, set_exchangeContract] = React.useState<any>(null);
    //
    //
    const [orderFunc, set_orderFunc] = React.useState<string>("");
    const [orderQty, set_orderQty] = React.useState<number>(0);
    const [orderPrice, set_orderPrice] = React.useState<number>(0);
    const [feePercent, set_feePercent] = React.useState<number>(0);
    //
    const [cToken, set_cToken] = React.useState<string>("ETH");
    const [cTokenBal, set_cTokenBal] = React.useState<number>(0);
    const [cTokenDep, set_cTokenDep] = React.useState<number>(0);
    //
    const [cEthBal, set_cEthBal] = React.useState<number>(0);
    const [cEthDep, set_cEthDep] = React.useState<number>(0);
    //
    const [tradeEvents, set_tradeEvents] = React.useState<T.Trade[]>([]);
    const [cancelEvents, set_cancelEvents] = React.useState<T.Cancel[]>([]);
    //
    const [openOrders, set_openOrders] = React.useState<T.OrderDat[]>([]);
    //
    const [cBuyOrder, set_cBuyOrder] = React.useState<T.Order | null>(null);
    const [cSellOrder, set_cSellOrder] = React.useState<T.Order | null>(null);
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const orderQty_inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const x: number = parseFloat(event.target.value);
        set_orderQty(x);
    };
    const orderPrice_inputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        const x: number = parseFloat(event.target.value);
        set_orderPrice(x);
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    function getCTokenContract(_allTokenContracts: any[]) {
        return _allTokenContracts.find((a) => a.tokenDat.symbol === cToken);
    }
    function getCTokenSymbol(_allTokenContracts: any[], tokenAddress: string) {
        //
        const x = _allTokenContracts.find(
            (a) => a.tokenDat.addr === tokenAddress.toLowerCase()
        );
        //
        return x ? x.tokenDat.symbol : "0x0";
    }
    const load_balances = async (_provider: ethers.BrowserProvider, _ethAddr: string) => {
        //
        const { _allTokenContracts, _exchangeContract } = await load_contracts(_provider);
        //
        const token = getCTokenContract(_allTokenContracts);
        //
        if (token) {
            //
            const _cTokenBal = await token.contract.balanceOf(_ethAddr);
            const _cTokenDep = await _exchangeContract.deposits(
                token.contract.target,
                _ethAddr
            );
            //
            set_cTokenDep(to_NUM(_cTokenDep));
            set_cTokenBal(to_NUM(_cTokenBal));
        }
        //
        //
        const _cEthDep = await _exchangeContract.deposits(ETHER_ADDRESS, _ethAddr);
        const _cEthBal = await _provider.getBalance(_ethAddr);
        //
        set_cEthBal(to_NUM(_cEthBal.toString()));
        set_cEthDep(to_NUM(_cEthDep));
    };
    const load_contracts = async (_provider: ethers.BrowserProvider) => {
        //
        //
        const _exchangeContract = new ethers.Contract(
            EXCHANGE_ADDR,
            MYEXCHANGE_ABI,
            _provider
        );
        //
        //
        let tokenCount = await _exchangeContract.tokenCount();
        tokenCount = parseInt(tokenCount.toString());
        //
        //
        let _feePercent = await _exchangeContract.feePercent();
        _feePercent = parseInt(_feePercent.toString());
        set_feePercent(_feePercent);
        //
        // ---------------------------------------------------------------------------
        let _allTokenContracts = [];
        for (let i = 1; i <= tokenCount; i++) {
            //
            const c = await _exchangeContract.allTokenDats(i);
            //
            const tokenDat = parse_TokenDat(c);
            //
            const contract = new ethers.Contract(tokenDat.addr, MYTOKEN_ABI, _provider);
            //
            _allTokenContracts.push({ tokenDat, contract });
        }
        // ---------------------------------------------------------------------------
        //
        //
        set_exchangeContract(_exchangeContract);
        set_allTokenContracts(_allTokenContracts);
        //
        //
        return { _allTokenContracts, _exchangeContract };
    };
    const load_events = async () => {
        //
        if (exchangeContract) {
            const filter = await exchangeContract.queryFilter("*");
            const { cancels, trades } = parse_events(filter);
            //
            set_cancelEvents(cancels);
            set_tradeEvents(trades);
            // set_depositEvents(deposits);
            // set_withdrawalEvents(withdrawals);
        }
    };
    const load_orders = async () => {
        //
        if (exchangeContract) {
            //
            const orderCt = await exchangeContract.orderCount();
            //
            let allOrders = [];
            for (let i = 1; i <= orderCt; i++) {
                //
                const o = await exchangeContract.allOrders(i);
                const filled = await exchangeContract.orderFilled(i);
                const cancelled = await exchangeContract.orderCancelled(i);
                //
                if (!filled && !cancelled) {
                    allOrders.push(o);
                }
            }
            //
            allOrders = parse_OrderDat(allOrders);
            //
            set_openOrders(allOrders);
        }
    };
    const LOAD = async () => {
        //
        if (!provider || !ethAddr) {
            return;
        }
        //
        load_contracts(provider);
        load_balances(provider, ethAddr);
        load_events();
        load_orders();
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const clk_confirm_order = async () => {
        //
        switch (orderFunc) {
            //
            case "DEP":
                await deposit();
                break;
            //
            case "WIT":
                await withdraw();
                break;
            //
            case "BUY":
                await makeBuyOrder();
                break;
            //
            case "SELL":
                await makeSellOrder();
                break;
            //
            case "APP":
                await approve();
                break;
            //
            case "FILL":
                await fillOrder();
                break;
            //
            default:
                break;
        }
        //
        set_orderQty(0);
    };
    const deposit = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        else if (cToken === "ETH") {
            //
            //
            try {
                //
                // -----------------------------------------------------
                const signer = await provider.getSigner();
                const META_DATA = { value: to_ETH(orderQty) };
                // -----------------------------------------------------
                //
                // -----------------------------------------------------
                const txn = await exchangeContract
                    .connect(signer)
                    .depositEther(META_DATA);
                //
                const receipt = await txn.wait();
                // console.log("[depositEther] - receipt - ", receipt);
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
                        header: "Ether deposit failed",
                        details: [error.reason],
                    },
                ]);
            }
            //
            //
        } else {
            //
            //
            // ------------------------------------------------
            const token = getCTokenContract(allTokenContracts);
            //
            if (!token) {
                return set_userAlerts([
                    {
                        header: "Deposit fail",
                        details: ["No token selected"],
                    },
                ]);
            }
            // ------------------------------------------------
            //
            //
            const signer = await provider.getSigner();
            const amount = to_ETH(orderQty);
            //
            const approveTxn = await token.contract
                .connect(signer)
                .approve(exchangeContract.target, amount);
            let receipt = await approveTxn.wait();
            // console.log("[approve] - receipt - ", receipt);
            //
            //
            try {
                //
                //
                if (receipt.status === 1) {
                    //
                    //
                    const depositTxn = await exchangeContract
                        .connect(signer)
                        .depositToken(token.contract.target, amount);
                    receipt = await depositTxn.wait();
                    // console.log("[depositToken] - receipt - ", receipt);
                    //
                    //
                    if (receipt.status === 1) {
                        RELOAD();
                    }
                }
                //
                //
            } catch (error: any) {
                set_userAlerts([
                    {
                        header: "Token deposit failed",
                        details: [error.reason],
                    },
                ]);
            }
        }
    };
    const withdraw = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            //
            const signer = await provider.getSigner();
            const amount = to_ETH(orderQty);
            let receipt = null;
            //
            //
            if (cToken === "ETH") {
                //
                // -----------------------------------------------------
                const txn = await exchangeContract.connect(signer).withdrawEther(amount);
                receipt = await txn.wait();
                // console.log("[withdrawEther] - receipt - ", receipt);
                // -----------------------------------------------------
                //
            } else {
                //
                //
                // ------------------------------------------------
                const token = getCTokenContract(allTokenContracts);
                //
                if (!token) {
                    return set_userAlerts([
                        {
                            header: "Deposit fail",
                            details: ["No token selected"],
                        },
                    ]);
                }
                // ------------------------------------------------
                //
                //
                const depositTxn = await exchangeContract
                    .connect(signer)
                    .withdrawToken(token.contract.target, amount);
                receipt = await depositTxn.wait();
                // console.log("[withdrawToken] - receipt - ", receipt);
            }
            //
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([{ header: "Withdrawal failed", details: [error.reason] }]);
        }
    };
    const approve = async () => {
        //
        //
        // ------------------------------------------------
        const token = getCTokenContract(allTokenContracts);
        //
        if (!token) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No token selected"],
                },
            ]);
        } else if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            //
            const signer = await provider.getSigner();
            const amount = to_ETH(orderQty);
            //
            //
            const approveTxn = await token.contract
                .connect(signer)
                .approve(exchangeContract.target, amount);
            const receipt = await approveTxn.wait();
            // console.log("[approve] - receipt - ", receipt);
            //
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([{ header: "Approval failed", details: [error.reason] }]);
        }
    };
    const makeBuyOrder = async () => {
        //
        //
        // ------------------------------------------------
        const token = getCTokenContract(allTokenContracts);
        //
        if (!token) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No token selected"],
                },
            ]);
        } else if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            //
            const signer = await provider.getSigner();
            //
            const buyOrderTxn = await exchangeContract
                .connect(signer)
                .makeOrder(
                    token.contract.target,
                    to_ETH(orderQty),
                    ETHER_ADDRESS,
                    to_ETH(orderPrice)
                );

            const receipt = await buyOrderTxn.wait();
            //
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([{ header: "Buy order failed", details: [error.reason] }]);
        }
    };
    const makeSellOrder = async () => {
        //
        //
        // ------------------------------------------------
        const token = getCTokenContract(allTokenContracts);
        //
        if (!token) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No token selected"],
                },
            ]);
        } else if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            //
            const signer = await provider.getSigner();
            //
            const sellOrderTxn = await exchangeContract
                .connect(signer)
                .makeOrder(
                    ETHER_ADDRESS,
                    to_ETH(orderPrice),
                    token.contract.target,
                    to_ETH(orderQty)
                );
            //
            const receipt = await sellOrderTxn.wait();
            // console.log("[makeSellOrder] - receipt - ", receipt);
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([{ header: "Sell order failed", details: [error.reason] }]);
        }
    };
    const fillOrder = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            //
            const signer = await provider.getSigner();
            const orderId = cBuyOrder ? cBuyOrder.id : cSellOrder ? cSellOrder.id : -1;
            //
            //
            if (orderId === -1) {
                return window.alert("Invalid order ID");
            }
            //
            //
            const fillOrderTxn = await exchangeContract
                .connect(signer)
                .fillOrder(orderId);
            const receipt = await fillOrderTxn.wait();
            // console.log("[fillOrder] - receipt - ", receipt);
            //
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([{ header: "Fill order failed", details: [error.reason] }]);
        }
    };
    const cancelOrder = async () => {
        //
        //
        // ------------------------------------------------
        if (!provider) {
            return set_userAlerts([
                { header: "Deposit fail", details: ["No provider detected"] },
            ]);
        } else if (!exchangeContract) {
            return set_userAlerts([
                {
                    header: "Deposit fail",
                    details: ["No exchange contract detected"],
                },
            ]);
        }
        // ------------------------------------------------
        //
        //
        try {
            //
            //
            const signer = await provider.getSigner();
            const orderId = cBuyOrder ? cBuyOrder.id : cSellOrder ? cSellOrder.id : -1;
            //
            //
            if (orderId === -1) {
                return window.alert("Invalid order ID");
            }
            //
            //
            const cancelOrderTxn = await exchangeContract
                .connect(signer)
                .cancelOrder(orderId);
            const receipt = await cancelOrderTxn.wait();
            console.log("[cancelOrder] - receipt - ", receipt);
            //
            //
            if (receipt.status === 1) {
                RELOAD();
            }
            //
            //
        } catch (error: any) {
            set_userAlerts([{ header: "Cancel order failed", details: [error.reason] }]);
        }
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    // async function audit(orderDat: T.OrderDat) {
    //     //
    //     const feeAmount = await exchangeContract.feeAmount(orderDat.amountGet);
    //     const totalAmount = await exchangeContract.totalAmount(orderDat.amountGet);
    //     const fillerBalance = await exchangeContract.fillerBalance(
    //         orderDat.tokenGet,
    //         ethAddr
    //     );
    //     //
    //     console.log("[feeAmount] - ", parseFloat(feeAmount.toString()));
    //     console.log("[totalAmount] - ", parseFloat(totalAmount.toString()));
    //     console.log("[fillerBalance] - ", to_NUM(fillerBalance));
    //     console.log("[canFillOrder] - ", to_NUM(fillerBalance) >= totalAmount);
    //     //
    // }
    const AccountManager = () => {
        //
        //
        if (cBuyOrder) {
            //
            const orderTokenAmt = cBuyOrder.amountGet;
            const orderEthAmt = cBuyOrder.amountGive;
            const netCost = (feePercent * orderTokenAmt) / 100 + orderTokenAmt;
            //
            const hasToken = cTokenDep >= netCost;
            const userOrder = cBuyOrder.user.toLowerCase() === ethAddr;
            //
            return (
                <div className="Panel-D SH PW-390">
                    <div className="BG-D9 FS-1-8 TXT-J BB-1-D10 BG-D7 c-r P-1">
                        User filling the order pays the exchange fee in {cToken} token
                        terms.
                    </div>
                    <div className="SP-Y-1 P-1">
                        <div className="Split-2 GG-1">
                            <div>
                                <div className="C-M4 FS-1-6">ETH offer</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP c-blz"
                                    value={fNum(orderEthAmt)}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <div className="C-M4 FS-1-6">{cToken} ask</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP TXT-E c-blz"
                                    onChange={orderQty_inputHandler}
                                    value={fNum(cBuyOrder.amountGet)}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="Split-2 GG-1">
                            <div>
                                <div className="C-M4 FS-1-6">Exchange fee</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP TXT-E c-blz"
                                    value={`${feePercent} %`}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <div className="C-M4 FS-1-6">Net tokens out</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP TXT-E c-blz"
                                    value={netCost}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>
                    {!userOrder && !hasToken ? (
                        <div className="SP-X-1 BG-D9 P-1 AC">
                            <button
                                className="DF AC JC RBtn P-05"
                                onClick={() => {
                                    set_orderFunc("");
                                    set_cSellOrder(null);
                                    set_cBuyOrder(null);
                                }}
                            >
                                <FaAngleDoubleLeft size="2em" />
                            </button>
                            <div className="TXT-C FS-2 C-M6 W-100">
                                Insufficient tokens on deposit
                            </div>
                        </div>
                    ) : (
                        <div className="Split-2 GG-1 BG-D9 P-1">
                            <button
                                className="BtnDisabled SP c-r"
                                onClick={() => {
                                    set_orderFunc("");
                                    set_cSellOrder(null);
                                    set_cBuyOrder(null);
                                }}
                            >
                                <FaAngleDoubleLeft size="2em" />
                            </button>
                            {userOrder ? (
                                <button
                                    className="BtnDisabled SP c-y"
                                    onClick={cancelOrder}
                                >
                                    Cancel order
                                </button>
                            ) : (
                                <button
                                    className="BtnDisabled SP c-g"
                                    onClick={fillOrder}
                                >
                                    Fill order
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        } else if (cSellOrder) {
            //
            //
            // const orderTokenAmt = cSellOrder.amountGive;
            const orderEthAmt = cSellOrder.amountGet;
            const netCost = (feePercent * orderEthAmt) / 100 + orderEthAmt;
            //
            const hasEth = cEthDep >= netCost;
            const userOrder = cSellOrder.user.toLowerCase() === ethAddr;
            //
            // console.log("cEthDep - ", cEthDep);
            // console.log("cSellOrder.amountGet - ", cSellOrder.amountGet);
            // console.log("hasEth - ", hasEth);
            //
            return (
                <div className="Panel-D SH PW-390">
                    <div className="BG-D9 FS-1-8 TXT-J BB-1-D10 BG-D7 c-r P-1">
                        User filling the order pays the exchange fee in ETH terms.
                    </div>
                    <div className="SP-Y-1 P-1">
                        <div className="Split-2 GG-1">
                            <div>
                                <div className="C-M4 FS-1-6">ETH ask</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP c-blz"
                                    value={fNum(orderEthAmt)}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <div className="C-M4 FS-1-6">{cToken} offer</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP TXT-E c-blz"
                                    onChange={orderQty_inputHandler}
                                    value={fNum(cSellOrder.amountGive)}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="Split-2 GG-1">
                            <div>
                                <div className="C-M4 FS-1-6">Exchange fee</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP TXT-E c-blz"
                                    value={`${feePercent} %`}
                                    disabled={true}
                                />
                            </div>
                            <div>
                                <div className="C-M4 FS-1-6">Net ETH out</div>
                                <input
                                    type="text"
                                    className="Input FS-1-6 SP TXT-E c-blz"
                                    value={netCost}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>
                    {!userOrder && !hasEth ? (
                        <div className="SP-X-1 BG-D9 P-1 AC">
                            <button
                                className="DF AC JC RBtn P-05"
                                onClick={() => {
                                    set_orderFunc("");
                                    set_cSellOrder(null);
                                    set_cBuyOrder(null);
                                }}
                            >
                                <FaAngleDoubleLeft size="2em" />
                            </button>
                            <div className="TXT-C FS-2 C-M6 W-100">
                                Insufficient ETH on deposit
                            </div>
                        </div>
                    ) : (
                        <div className="Split-2 GG-1 BG-D9 P-1">
                            <button
                                className="BtnDisabled SP c-r"
                                onClick={() => {
                                    set_orderFunc("");
                                    set_cSellOrder(null);
                                    set_cBuyOrder(null);
                                }}
                            >
                                Reset
                            </button>
                            {userOrder ? (
                                <button
                                    className="BtnDisabled SP c-y"
                                    onClick={cancelOrder}
                                >
                                    Cancel order
                                </button>
                            ) : (
                                <button
                                    className="BtnDisabled SP c-g"
                                    onClick={fillOrder}
                                >
                                    Fill order
                                </button>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        //
        //
        const isBuySell = orderFunc === "BUY" || orderFunc === "SELL";
        const showEth = isBuySell === false && orderFunc !== "APP";
        //
        const tokenList = allTokenContracts.map((at) => {
            return {
                sym: at.tokenDat.symbol,
                addr: at.tokenDat.addr,
            };
        });
        const listings = showEth
            ? [{ sym: "ETH", addr: ETHER_ADDRESS }, ...tokenList]
            : tokenList;
        //
        //
        return (
            <div className="ASS SP-Y-2 PW-390">
                <div className="Panel-D SH">
                    <div className="Split-4 BG-D9 GG-1 P-1">
                        <button
                            onClick={() => set_orderFunc("DEP")}
                            className={orderFunc === "DEP" ? "RBtn SP" : "BtnDisabled SP"}
                        >
                            Dep
                        </button>
                        <button
                            onClick={() => set_orderFunc("WIT")}
                            className={orderFunc === "WIT" ? "GBtn SP" : "BtnDisabled SP"}
                        >
                            Wit
                        </button>

                        {cToken !== "ETH" && (
                            <>
                                <button
                                    onClick={() => set_orderFunc("BUY")}
                                    className={
                                        orderFunc === "BUY" ? "RBtn SP" : "BtnDisabled SP"
                                    }
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => set_orderFunc("SELL")}
                                    className={
                                        orderFunc === "SELL"
                                            ? "GBtn SP"
                                            : "BtnDisabled SP"
                                    }
                                >
                                    Sell
                                </button>
                                {/* <button
                                    onClick={() => set_orderFunc("APP")}
                                    className={
                                        orderFunc === "APP" ? "BBtn SP" : "BtnDisabled SP"
                                    }
                                >
                                    App
                                </button> */}
                            </>
                        )}
                    </div>
                    {listings.map((t, key: number) => {
                        //
                        const clr = t.sym === "ETH" ? "W" : t.sym[0].toUpperCase();
                        const c1 = key % 2 === 0 ? "" : "BG-D5 ";
                        const c2 = "DF AC JSB HCP SP H-BG-D3";
                        const c3 = cToken === t.sym ? ` BL-5-${clr} BR-5-${clr}` : "";
                        const cls = c1 + c2 + c3;
                        //
                        const clkToken = () => {
                            set_cToken(t.sym);
                        };
                        //
                        return (
                            <div key={key} className={cls} onClick={clkToken}>
                                <div className={`FS-1-8 c-blz c-${clr.toLowerCase()}`}>
                                    {t.sym}
                                </div>
                                <div className="FS-1-8 C-M0">{H.last4(t.addr)}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="Panel-D SH">
                    <div className="FS-2-4 c-r P-1 BG-D9">Ethereum</div>
                    <div className="Split-1-2 AC GG-1 P-1">
                        <div className="C-M4 FS-2 MB-05">Wallet</div>
                        <div className="BG-D9 FS-1-8 c-o SP TXT-E">{fNum(cEthBal)}</div>
                        <div className="C-M4 FS-2 MB-05">Deposit</div>
                        <div className="BG-D9 FS-1-8 c-o SP TXT-E">{fNum(cEthDep)}</div>
                    </div>
                </div>
                {cToken !== "" && cToken !== "ETH" && (
                    <div className="Panel-D SH">
                        <div className="P-1 BG-D9 DF AC JSB">
                            <div className="FS-2-4 c-r">{cToken}</div>
                        </div>
                        <div className="Split-1-2 AC GG-1 P-1">
                            <div className="C-M4 FS-2 MB-05">Wallet</div>
                            <div className="BG-D9 FS-1-8 c-o SP TXT-E">
                                {fNum(cTokenBal)}
                            </div>
                            <div className="C-M4 FS-2 MB-05">Deposit</div>
                            <div className="BG-D9 FS-1-8 c-o SP TXT-E">
                                {fNum(cTokenDep)}
                            </div>
                        </div>
                    </div>
                )}

                {cToken !== "" && orderFunc !== "" && (
                    <div className="Panel-D P-1 SP-Y-1 SH">
                        <div>
                            <div className="C-M4 FS-2 MB-05">Quantity</div>
                            <input
                                type="number"
                                className="Input MT-05 c-g"
                                onChange={orderQty_inputHandler}
                                value={orderQty ? orderQty : ""}
                                placeholder={`0 ${cToken}`}
                            />
                        </div>
                        {isBuySell && (
                            <div>
                                <div className="C-M4 FS-2">Price</div>
                                <div className="Split-2 GG-1">
                                    <div>
                                        <input
                                            type="number"
                                            className="Input MT-05 SP c-g"
                                            onChange={orderPrice_inputHandler}
                                            value={orderPrice ? orderPrice : ""}
                                            placeholder="0 ETH"
                                        />
                                    </div>
                                    <div className="DF AC JCE BG-D9 SP GG-1">
                                        <div className="FS-1-8 c-o TXT-C">
                                            {fNum(orderQty / orderPrice, 0, 3)}
                                        </div>
                                        <div className="C-M4 FS-1-4 MT-05">/ ETH</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="Split-2 GG-1 BG-D9">
                            <button
                                className="BtnDisabled SP c-r"
                                onClick={() => {
                                    set_orderQty(0);
                                    set_orderPrice(0);
                                }}
                            >
                                Reset
                            </button>
                            <button
                                className="BtnDisabled SP c-g"
                                onClick={clk_confirm_order}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };
    const OrderBook = () => {
        //
        //
        const token = getCTokenContract(allTokenContracts);
        //
        //
        if (cToken === "ETH" || cToken === "") {
            return (
                <div className="Panel-D SH W-15 DF FDC Pos-Rel">
                    <div className="Pos-Cen FS-2 c-r">No token</div>
                </div>
            );
        }
        //
        //
        const allOrders = openOrders.map((o) => setOrderPrice(o));
        //
        let buyOrders = allOrders.filter(
            (o) => o.tokenGet.toLowerCase() === token.tokenDat.addr.toLowerCase()
        );
        let sellOrders = allOrders.filter(
            (o) => o.tokenGive.toLowerCase() === token.tokenDat.addr.toLowerCase()
        );
        //
        buyOrders = buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice);
        sellOrders = sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice);
        //

        const clr = token.tokenDat.symbol[0];
        //
        // console.log("token - ", token);
        // console.log("allOrders - ", allOrders);
        // console.log("buyOrders - ", buyOrders);
        // console.log("sellOrders - ", sellOrders);
        //
        //
        return (
            <div className="Panel-D ASS SH W-15 DF FDC">
                <div className={headerCls}>Orderbook</div>
                <div className="DF FDC H-100 Pos-Rel">
                    <div className="Scroll PH-390 DF FDC JCE">
                        {sellOrders.map((o, key) => {
                            //
                            const evenSell = sellOrders.length % 2 === 1;
                            const evenKey = key % 2 === 0;
                            //
                            const c1 = evenKey
                                ? !evenSell
                                    ? "BG-D4"
                                    : ""
                                : evenSell
                                ? "BG-D4"
                                : "";
                            const c2 =
                                cSellOrder?.id === o.id
                                    ? "BL-5-R"
                                    : o.user === ethAddr
                                    ? " BL-2-O"
                                    : "";
                            const cls = c1 + c2 + " Split-3 PX-05 PY-025 H-BG-D3 HCP";
                            //
                            const _ord = setOrderPrice(o);
                            //
                            return (
                                <div
                                    key={key}
                                    className={cls}
                                    onClick={() => {
                                        set_orderFunc("FILL");
                                        set_cSellOrder(o);
                                        set_cBuyOrder(null);
                                        // audit(o);
                                    }}
                                >
                                    <div className="FS-1-4 c-bs">
                                        {fNum(o.amountGive)}
                                    </div>

                                    <div className="FS-1-4 c-r TXT-C ML-3">
                                        {fNum(_ord.tokenPrice, 0, 1)}
                                    </div>
                                    <div className="FS-1-4 C-M0 TXT-E">
                                        {H.fNum(o.amountGet)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={`Split-3 PX-05 PY-025 BG-${clr}`}>
                        <div className="FS-1-6 C-D4 No-SH">{cToken}</div>
                        <div className="FS-1-6 C-D4 No-SH TXT-C ML-3">Price</div>
                        <div className="FS-1-6 C-D4 No-SH TXT-E DF AC JCE">
                            <FaEthereum size="1.6em" />
                        </div>
                    </div>
                    <div className="Scroll PH-390">
                        {buyOrders.map((o, key) => {
                            //
                            const c1 = key % 2 === 0 ? "" : "BG-D4";
                            const c2 =
                                cBuyOrder?.id === o.id
                                    ? "BL-5-R"
                                    : o.user === ethAddr
                                    ? " BL-2-O"
                                    : "";
                            const cls = c1 + c2 + " Split-3 PX-05 PY-025 H-BG-D3 HCP";
                            //
                            const _ord = setOrderPrice(o);
                            //
                            return (
                                <div
                                    key={key}
                                    className={cls}
                                    onClick={() => {
                                        set_orderFunc("FILL");
                                        set_cBuyOrder(o);
                                        set_cSellOrder(null);
                                        // audit(o);
                                    }}
                                >
                                    <div className="FS-1-4 c-bs">{fNum(o.amountGet)}</div>

                                    <div className="FS-1-4 c-g TXT-C ML-3">
                                        {fNum(_ord.tokenPrice, 0, 1)}
                                    </div>
                                    <div className="FS-1-4 C-M0 TXT-E">
                                        {H.fNum(o.amountGive)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };
    const txn_hist = () => {
        //
        const txnLog = tradeEvents;
        const recent = txnLog.slice(-13);
        //
        const buffer = 10;
        const chart_H = 490;
        const chart_W = 860;
        //
        const chart_style = {
            height: `${chart_H}px`,
            width: `${chart_W}px`,
        };
        //
        //
        let mrx = [];
        let max = -1000000;
        let min = 1000000;
        //
        //
        for (let i = 0; i < recent.length; i++) {
            //
            let { tokenGet, amountGet, amountGive } = recent[i];
            //
            const isSell = tokenGet === ETHER_ADDRESS;
            const price = !isSell ? amountGet / amountGive : amountGive / amountGet;
            //
            if (price < min) {
                min = price;
            }
            if (price > max) {
                max = price;
            }
        }
        //
        //
        // ----------------------------------------
        const range = H.sh(max - min);
        // console.log("min - ", min);
        // console.log("max - ", max);
        // console.log("range - ", range);
        // ----------------------------------------
        //
        //
        for (let i = 0; i < recent.length; i++) {
            //
            let { tokenGet, amountGet, amountGive } = recent[i];
            //
            const isSell = tokenGet == ETHER_ADDRESS;
            const price = !isSell ? amountGet / amountGive : amountGive / amountGet;
            //
            const dx = (max - price) / range;
            const pos = dx * chart_H + buffer;
            //
            const top = `${pos}px`;
            const left = `${i * 40}px`;
            //
            mrx.push(
                <div
                    key={i}
                    className="MRX Pos-Abs ML-1 SH PH-24 P-05"
                    style={{
                        top,
                        left,
                        backgroundColor: "greenyellow",
                    }}
                >
                    <div className="FS-1-2 Up-10">{H.fNum(price, 0, 3)}</div>
                    <div></div>
                </div>
            );
        }
        //
        //
        return (
            <div className="DF JSB H-100 W-100">
                <div className="ChartBox W-100 H-100">
                    <div className=" W-100 H-100 P-1" style={chart_style}>
                        {mrx.map((m) => m)}
                    </div>
                </div>
            </div>
        );
    };
    const priceChart = () => {
        //
        //
        if (cToken === "ETH" || cToken === "") {
            return (
                <div className="Panel-D SH DF FDC Pos-Rel">
                    <div className="Pos-Cen FS-2 c-r">No token</div>
                </div>
            );
        }
        //
        //
        return (
            <div className="Panel-D SH DF FDC">
                <div className={headerCls}>Price Chart</div>
                <div className="H-100 BG-D3">{txn_hist()}</div>
            </div>
        );
    };
    const transactions = () => {
        //
        //
        if (cToken === "ETH" || cToken === "") {
            return (
                <div className="Panel-D SH DF FDC Pos-Rel">
                    <div className="Pos-Cen FS-2 c-r">No token</div>
                </div>
            );
        }
        //
        //
        let userFilled = 0;
        let userCancelled = 0;
        //
        return (
            <div className="Split-2 GG-2">
                <div className="Panel-D SH DF FDC">
                    <div className="SP BG-D9 Split-4 FG-1">
                        <div className="FS-1-6 c-bs">Qty</div>
                        <div className="FS-1-6 c-o">Price</div>
                        <div className="FS-1-6 c-ys TXT-E MR-2">ETH</div>
                        <div className="FS-1-6 c-blz TXT-E">Date</div>
                    </div>
                    <div className="DF FDC H-100">
                        {tradeEvents.map((c) => {
                            //
                            if (c.user !== ethAddr) {
                                return "";
                            }
                            //
                            const isSell = c.tokenGive === ETHER_ADDRESS;
                            const tokens = isSell ? c.amountGet : c.amountGive;
                            const ethQty = isSell ? c.amountGive : c.amountGet;
                            const address = isSell ? c.tokenGet : c.tokenGive;
                            const sym = getCTokenSymbol(allTokenContracts, address);
                            //
                            if (sym !== cToken) {
                                return "";
                            }
                            //
                            userFilled++;
                            //
                            const c1 = "SP AC Split-4 ";
                            const c2 = userFilled % 2 === 0 ? "" : "BG-D5";
                            const cls = c1 + c2;
                            //
                            return (
                                <div key={userFilled} className={cls}>
                                    <div className="FS-1-6 c-blz">{tokens}</div>
                                    <div className="FS-1-6 c-o">
                                        {fNum(tokens / ethQty, 0, 2)}
                                    </div>
                                    <div className={`DF AC JCE c-y`}>
                                        <div className="FS-1-6 MR-05">{ethQty}</div>
                                        <FaEthereum size="1.6em" />
                                    </div>
                                    <div className="FS-1-6 c-blz TXT-E">
                                        {H.blockTime(c.timeStamp)}
                                    </div>
                                </div>
                            );
                        })}
                        <div className="SP MT-auto BG-D9 DF AC JSB">
                            <div className="FS-1-4 c-g">User filled</div>
                            <div className="SP-X-1">
                                <div className="FS-1-4 C-L10">{userFilled}</div>
                                <div className="FS-1-4 c-blz">orders</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="Panel-D SH DF FDC">
                    <div className="SP BG-D9 Split-4 FG-1">
                        <div className="FS-1-6 c-bs">Qty</div>
                        <div className="FS-1-6 c-o">Price</div>
                        <div className="FS-1-6 c-ys TXT-E MR-2">ETH</div>
                        <div className="FS-1-6 c-blz TXT-E">Date</div>
                    </div>
                    <div className="DF FDC H-100">
                        {cancelEvents.map((c) => {
                            //
                            if (c.user !== ethAddr) {
                                return "";
                            }
                            //
                            const isSell = c.tokenGive === ETHER_ADDRESS;
                            const tokens = isSell ? c.amountGet : c.amountGive;
                            const ethQty = isSell ? c.amountGive : c.amountGet;
                            const address = isSell ? c.tokenGet : c.tokenGive;
                            const sym = getCTokenSymbol(allTokenContracts, address);
                            //
                            if (sym !== cToken) {
                                return "";
                            }
                            //
                            userCancelled++;
                            //
                            const c1 = "SP AC Split-4 ";
                            const c2 = userCancelled % 2 === 0 ? "" : "BG-D5";
                            const cls = c1 + c2;
                            //
                            return (
                                <div key={userCancelled} className={cls}>
                                    <div className="FS-1-6 c-blz">{tokens}</div>
                                    <div className="FS-1-6 c-o">
                                        {fNum(tokens / ethQty, 0, 2)}
                                    </div>
                                    <div className={`DF AC JCE c-y`}>
                                        <div className="FS-1-6 MR-05">{ethQty}</div>
                                        <FaEthereum size="1.6em" />
                                    </div>
                                    <div className="FS-1-6 c-blz TXT-E">
                                        {H.blockTime(c.timeStamp)}
                                    </div>
                                </div>
                            );
                        })}
                        <div className="SP MT-auto BG-D9 DF AC JSB">
                            <div className="FS-1-4 c-r">User cancelled</div>
                            <div className="SP-X-1">
                                <div className="FS-1-4 C-L10">{userCancelled}</div>
                                <div className="FS-1-4 c-blz">orders</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const history = () => {
        //
        //
        if (cToken === "ETH" || cToken === "") {
            return (
                <div className="Panel-D SH W-15 DF FDC Pos-Rel">
                    <div className="Pos-Cen FS-2 c-r">No token</div>
                </div>
            );
        }
        //
        //
        return (
            <div className="Panel-D SH DF FDC W-15">
                <div className="Split-2 FS-2-4 c-o FG-1 P-1 BG-D9">Trades</div>
                <div className="DF FDC H-100">
                    {tradeEvents.map((c, key) => {
                        //
                        //
                        const isSell = c.tokenGive === ETHER_ADDRESS;
                        const tokens = !isSell ? c.amountGive : c.amountGet;
                        const ethQty = isSell ? c.amountGive : c.amountGet;
                        const address = isSell ? c.tokenGet : c.tokenGive;
                        const sym = getCTokenSymbol(allTokenContracts, address);
                        const clr = sym === "ETH" ? "W" : sym[0].toLowerCase();

                        //
                        const c1 = "DF AC SP ";
                        const c2 = key % 2 === 0 ? "" : "BG-D5";
                        const cls = c1 + c2;
                        //
                        return (
                            <div key={key} className={cls}>
                                <div className="Split-2 FG-1">
                                    <div className="Split-2">
                                        <div className={`FS-1-6 c-${clr}`}>{sym}</div>
                                        <div className="FS-1-6 ML-05 c-blz">{tokens}</div>
                                    </div>
                                    <div className="FS-1-6 c-gs TXT-E">
                                        {fNum(tokens / ethQty, 0, 2)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="SP MT-auto BG-D9 DF AC JSB">
                        <div className="FS-1-4 c-g">All filled</div>
                        <div className="SP-X-1">
                            <div className="FS-1-4 C-L10">{tradeEvents.length}</div>
                            <div className="FS-1-4 c-blz">orders</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    const RELOAD = () => {
        if (provider) {
            load_balances(provider, ethAddr);
            load_events();
            load_orders();
        } else {
            LOAD();
        }
    };
    //
    React.useEffect(() => {
        RELOAD();
    }, [orderFunc, cToken, ethAddr]);
    // ---------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------
    return (
        <div className="SP-X-2 H-100">
            <div className="SP-Y-2">{AccountManager()}</div>
            {OrderBook()}
            <div className="Split-R-2-1 GG-2 FG-1">
                {priceChart()}
                {transactions()}
            </div>
            {history()}
        </div>
    );
}
