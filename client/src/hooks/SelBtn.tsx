//
//
export function SelBtn(
    cVal: string | number,
    thisVal: string | number,
    setVal: () => void,
    icon?: any
) {
    if (icon) {
        //
        return (
            <button
                className={cVal === thisVal ? "DF CBtn" : "DF Btn"}
                onClick={() => setVal()}
            >
                {icon}
            </button>
        );
    } else {
        return (
            <button
                className={cVal === thisVal ? "Btn CBtn" : "Btn"}
                onClick={() => setVal()}
            >
                {thisVal}
            </button>
        );
    }
}
