//
import { FaEthereum } from "react-icons/fa";
//

export default function EthPrice({ val, clr }: { val: number | string; clr: string }) {
    return (
        <div className={`DF AC JCE ${clr}`}>
            <div className="FS-1-6 MR-05">{val}</div>
            <FaEthereum size={"1.6em"} />
        </div>
    );
}
//
