//
//
declare var window: any;
//
//
import { ethers } from "ethers";
import { RES } from "../../../__PKG__/X";
import { FaSpinner } from "react-icons/fa";
//
import React from "react";
import UserAlertModal from "../components/modals/UserAlertModal";
//
//
export function to_ETH(x: any) {
    return ethers.parseUnits(x.toString(), "ether");
}
export function to_NUM(x: any) {
    return parseFloat(ethers.formatUnits(x, "ether"));
}
//
//
function LoadingWall() {
    return (
        <div className="Pos-Abs BG-D13 Z90 H-100 W-100">
            <div className="BG-D3 P-2 SH Pos-Cen B-2-D4 SP-X-2">
                <div className="FS-3 c-r PT-025">Please wait</div>
                <FaSpinner className="c-y spinner" size={"3em"} />
            </div>
        </div>
    );
}
//
//
export enum ViewType {
    Orders = "Orders",
    Tokens = "Tokens",
    Games = "Games",
}
export const headerLinks: string[] = Object.values(ViewType);
//
//
export type RootCntxType = {
    //
    takeRes: (x: any) => void;
    //
    loading: boolean;
    set_loading: (loading: boolean) => void;
    //
    cView: string;
    set_cView: (cView: string) => void;
    //
    ethAddr: string;
    set_ethAddr: (ethAddr: string) => void;
    //
    provider: ethers.BrowserProvider | null;
    //
    userAlerts: RES.UserAlert[];
    set_userAlerts: (userAlerts: React.SetStateAction<RES.UserAlert[]>) => void;
    //
    LoadProvider: () => void;
    //
    networkId: number;
    handleNetworkSwitch: (networkName: string) => void;
};
const RootCntx = React.createContext<RootCntxType | null>(null);
export const UseRoot = () => React.useContext(RootCntx);
// =============================================================
// ------------------------------------------------------------
//
// ------------------------------------------------------------
// =============================================================
const networks: any = {
    x1FastNet: {
        chainId: `0x${Number(4003).toString(16)}`,
        chainName: "X1 Fastnet",
        nativeCurrency: {
            name: "XN",
            symbol: "XN",
            decimals: 18,
        },
        rpcUrls: ["https://x1-fastnet.infrafc.org"],
        blockExplorerUrls: ["https://explorer.x1-fastnet.infrafc.org/"],
    },
    hardhat: {
        chainId: `0x${Number(31337).toString(16)}`,
        chainName: "Hardhat",
        nativeCurrency: {
            name: "Ethereum Hardhat",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: ["http://127.0.0.1:8545/"],
        blockExplorerUrls: ["https://explorer.x1-fastnet.infrafc.org/"],
    },
};
const changeNetwork = async ({
    networkName,
    set_userAlerts,
}: {
    networkName: string;
    set_userAlerts: (err: any) => void;
}) => {
    try {
        if (!window.ethereum) throw new Error("No crypto wallet found");
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                    ...networks[networkName],
                },
            ],
        });
    } catch (err: any) {
        set_userAlerts([{ header: "Network error", details: [err.message] }]);
    }
};
// =============================================================
// ------------------------------------------------------------
//
// ------------------------------------------------------------
// =============================================================
export default function RootProvider({ children }: any) {
    //
    //
    const [userAlerts, set_userAlerts] = React.useState<RES.UserAlert[]>([]);
    const [loading, set_loading] = React.useState<boolean>(false);
    //
    const [provider, set_provider] = React.useState<ethers.BrowserProvider | null>(null);
    const [networkId, set_networkId] = React.useState<number>(-1);
    const [ethAddr, set_ethAddr] = React.useState<string>("");
    const [cView, set_cView] = React.useState<string>(ViewType.Tokens);
    //
    //
    const handleNetworkSwitch = async (networkName: string) => {
        await changeNetwork({ networkName, set_userAlerts });
    };
    async function DetectNetwork() {
        //
        if (window.ethereum && window.ethereum.isMetaMask) {
            //
            const currentChainId = await window.ethereum.request({
                method: "eth_chainId",
            });
            //
            set_networkId(parseInt(currentChainId, 16));
            //
        } else {
            console.log("MetaMask is not installed");
        }
    }
    async function LoadProvider() {
        //
        set_loading(true);
        //
        try {
            //
            const _provider = new ethers.BrowserProvider(window.ethereum);
            const _signer = await _provider.getSigner();
            const _ethAddr = await _signer.getAddress();
            //
            set_provider(_provider);
            set_ethAddr(_ethAddr.toLowerCase());
            //
        } catch (error: any) {
            //
            set_userAlerts([
                { header: "Error loading provider", details: [error.message] },
            ]);
        }
        //
        //
        set_loading(false);
    }
    //
    //
    function takeRes(res: any) {
        //
        if (res.errors?.length > 0) {
            set_userAlerts(res.errors);
        } else if (res.userAlerts?.length > 0) {
            set_userAlerts(res.userAlerts);
        }
    }
    //
    //
    React.useEffect(() => {
        window.ethereum.on("chainChanged", DetectNetwork);
        window.ethereum.on("accountsChanged", LoadProvider);
        return () => {
            window.ethereum.removeListener("chainChanged", DetectNetwork);
            window.ethereum?.removeListener("accountsChanged", LoadProvider);
        };
    }, []);
    React.useEffect(() => {
        DetectNetwork();
    }, [networkId]);
    //
    //
    return (
        <RootCntx.Provider
            value={{
                //
                takeRes,
                //
                cView,
                set_cView,
                //
                ethAddr,
                set_ethAddr,
                //
                provider,
                //
                loading,
                set_loading,
                //
                userAlerts,
                set_userAlerts,
                //
                networkId,
                //
                LoadProvider,
                handleNetworkSwitch,
            }}
        >
            {loading && <LoadingWall />}
            {userAlerts?.length > 0 && (
                <UserAlertModal msgs={userAlerts} close={() => set_userAlerts([])} />
            )}
            {children}
        </RootCntx.Provider>
    );
}
