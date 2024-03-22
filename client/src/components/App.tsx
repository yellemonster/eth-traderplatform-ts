//
//
import { RootCntxType, UseRoot, ViewType } from "../providers/RootCntx";
//
import Header from "./Header";
import Orderbook from "./screens/Orderbook";
import GameScreen from "./screens/GameScreen";
import TokenScreen from "./screens/TokenScreen";
import { EthCntxType, UseEth } from "../providers/EthCntx";
//
//
export default function Main() {
    //
    //
    const { cView } = UseRoot() as RootCntxType;
    const { ethAddr, provider, networkId, LoadProvider, handleNetworkSwitch } =
        UseEth() as EthCntxType;
    //
    //
    const validNetwork = networkId === 4003 || networkId === 31337;
    const showApp = validNetwork && ethAddr && provider;
    //
    //
    return (
        <div className="P-2 Body1">
            {showApp ? (
                <div className="SP-Y-1 H-100">
                    <Header />
                    {cView === ViewType.Games && <GameScreen />}
                    {cView === ViewType.Tokens && <TokenScreen />}
                    {cView === ViewType.Orders && <Orderbook />}
                </div>
            ) : (
                <div className="SP-X-1">
                    {validNetwork ? (
                        <button className="SP Btn" onClick={LoadProvider}>
                            Load
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => handleNetworkSwitch("x1FastNet")}
                                className="Btn SP"
                            >
                                Switch to X1 Fastnet
                            </button>
                            <button
                                onClick={() => handleNetworkSwitch("hardhat")}
                                className="Btn SP"
                            >
                                Switch to Hardhat
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
