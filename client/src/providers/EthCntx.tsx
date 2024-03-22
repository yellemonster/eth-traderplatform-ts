//
//
declare var window: any;
//
import React from "react";
//
import { RootCntxType, UseRoot } from "./RootCntx";
import { ethers } from "ethers";
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
export type EthCntxType = {
    //
    ethAddr: string;
    set_ethAddr: (ethAddr: string) => void;
    //
    provider: ethers.BrowserProvider | null;
    //
    LoadProvider: () => void;
    //
    networkId: number;
    handleNetworkSwitch: (networkName: string) => void;
};
const EthCntx = React.createContext<EthCntxType | null>(null);
export const UseEth = () => React.useContext(EthCntx);
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
    const { set_userAlerts, set_loading } = UseRoot() as RootCntxType;
    //
    const [provider, set_provider] = React.useState<ethers.BrowserProvider | null>(null);
    const [networkId, set_networkId] = React.useState<number>(-1);
    const [ethAddr, set_ethAddr] = React.useState<string>("");
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
        <EthCntx.Provider
            value={{
                //
                provider,
                networkId,
                //
                ethAddr,
                set_ethAddr,
                //
                LoadProvider,
                handleNetworkSwitch,
            }}
        >
            {children}
        </EthCntx.Provider>
    );
}
