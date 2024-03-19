//
//
import { URL } from "../../../__PKG__/util/RT";
import { UseRoot, RootCntxType } from "../providers/RootCntx";
//
//
const headers = { "Content-Type": "application/json" };
//
//
export function MyApi() {
    //
    const { set_loading } = UseRoot() as RootCntxType;
    //
    //
    async function fetch_GET(url: string, showModal: boolean = true) {
        //
        const OPTIONS = {
            method: "GET",
            headers,
        };
        //
        return SendRequest(url, OPTIONS, showModal);
    }
    async function fetch_POST(url: string, bodyData: object, showModal: boolean = true) {
        //
        const OPTIONS = {
            method: "POST",
            headers,
            body: JSON.stringify(bodyData),
        };
        //
        return SendRequest(url, OPTIONS, showModal);
    }
    //
    //
    const SendRequest = async (url: string, OPTIONS: object, showModal: boolean) => {
        //
        //
        if (showModal === true) {
            set_loading(true);
        }
        //
        const response = await fetch(URL.BASE + url, OPTIONS);
        //
        set_loading(false);
        //
        if (response.ok) {
            return response.json();
        } else {
            LogError(response);
        }
    };
    //
    //
    const LogError = async (response: any) => {
        const errorResponse = await response.json();
        window.alert("API request error. Check console logs");
        console.log("API request error => " + JSON.stringify(errorResponse));
    };
    //
    //
    return { fetch_GET, fetch_POST };
}
