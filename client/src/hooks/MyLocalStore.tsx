//
//
import { useState } from "react";
//
//
//
export default function MyLocalStore(key: string, initialValue: any) {
    //
    const [storedValue, setStoredValue] = useState(() => {
        //
        if (typeof window === "undefined") {
            return initialValue;
        }
        //
        //
        try {
            //
            const jsonValue = window.localStorage.getItem(key);
            return jsonValue ? JSON.parse(jsonValue) : initialValue;
            //
        } catch (error) {
            //
            console.log(`[useLocalStorage] error => ${error}`);
            //
            return initialValue;
        }
    });
    //
    //
    const setValue = (value: any) => {
        //
        try {
            //
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            //
            setStoredValue(valueToStore);
            //
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
            //
        } catch (error) {
            //
            console.log(`[useLocalStorage] error => ${error}`);
        }
    };
    //
    //
    return [storedValue, setValue];
}
