//
//
import { UserAlert } from "./RES";
//
//
export const headerCls = "BG-D9 BB-1-D5 FS-2-4 c-o P-1";
export const iconSize = "2.5em";
//
//
export function last(arr: any[]) {
    return arr.slice(-1)[0];
}
export function fDate(timestamp: number) {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
}
export function blockTime(timestamp: number) {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    const options: Intl.DateTimeFormatOptions = {
        // year: "numeric",
        month: "short",
        day: "numeric",
        // hour: "numeric",
        // minute: "numeric",
        // second: "numeric",
        // timeZoneName: "short",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
}
export function fNum(n: number, minD: number = 0, maxD: number = 0) {
    //
    const options = {
        minimumFractionDigits: minD,
        maximumFractionDigits: maxD,
    };
    //
    const formatter = new Intl.NumberFormat("en-US", options);
    //
    return formatter.format(n);
}
export function sh(x: number): number {
    return parseFloat(x.toFixed(3));
}
export function toX(val: number, x: number): string {
    return fNum(val, 0, x);
}
export function rInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
//
//
export function shortAcct(ethAcct: string) {
    return ethAcct?.slice(0, 4) + " . . . " + ethAcct?.slice(-4);
}
export function last4(ethAcct: string) {
    return "..." + ethAcct?.slice(-4);
}
export function addUserAlert(userAlerts: UserAlert[], header: string, details: string[]) {
    return userAlerts.push({ header, details });
}
