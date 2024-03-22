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
    userAlerts: RES.UserAlert[];
    set_userAlerts: (userAlerts: React.SetStateAction<RES.UserAlert[]>) => void;
};
const RootCntx = React.createContext<RootCntxType | null>(null);
export const UseRoot = () => React.useContext(RootCntx);
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
    const [cView, set_cView] = React.useState<string>(ViewType.Tokens);
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
    return (
        <RootCntx.Provider
            value={{
                //
                takeRes,
                //
                cView,
                set_cView,
                //
                loading,
                set_loading,
                //
                userAlerts,
                set_userAlerts,
                //
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
