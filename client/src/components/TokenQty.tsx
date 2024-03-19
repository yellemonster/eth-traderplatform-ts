//
//
export default function TokenQty({ val, clr }: { val: number | string; clr: string }) {
    return (
        <div className={`DF AC ${clr}`}>
            <div className="FS-1-6 c-b">MYT</div>
            <div className="FS-1-6 ML-05">{val}</div>
        </div>
    );
}
//
