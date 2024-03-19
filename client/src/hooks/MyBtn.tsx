//
export default function MyBtn(
    btnCls: string,
    label: string | Element,
    onClk: () => void,
    icon?: any
) {
    //
    return (
        <button className={btnCls} onClick={() => onClk()}>
            {icon ? icon : label}
        </button>
    );
}
