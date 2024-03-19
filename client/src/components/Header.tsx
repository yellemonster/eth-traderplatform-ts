//
//
import { FaTwitter } from "react-icons/fa";
//
import { RootCntxType, UseRoot, headerLinks } from "../providers/RootCntx";
import { H } from "../../../__PKG__/X";
//
//
export default function Header() {
    //
    //
    const { ethAddr, cView, set_cView } = UseRoot() as RootCntxType;
    //
    //
    return (
        <div className="DF AC JSB MB-2">
            <div className="Panel-D SH DF AC">
                <a
                    href="https://twitter.com/i101dev"
                    className="SP DF"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <FaTwitter size="2em" className="c-b" />
                </a>
                {headerLinks.map((link, key) => {
                    //
                    const c0 = cView === link ? "c-y BG-D10" : "c-btn";
                    const c1 = " FS-1-8 HCP NTS H-100 PY-05 PX-2";
                    //
                    return (
                        <div
                            key={key}
                            className={c0 + c1}
                            onClick={() => set_cView(link)}
                        >
                            {link}
                        </div>
                    );
                })}
            </div>
            {ethAddr && (
                <div className="Panel-D SH">
                    <div className="SP FS-1-8 c-b">{H.shortAcct(ethAddr)}</div>
                </div>
            )}
        </div>
    );
}
