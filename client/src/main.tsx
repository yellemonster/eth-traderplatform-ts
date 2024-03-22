//
//
import React from "react";
import ReactDOM from "react-dom/client";
import RootCntx from "./providers/RootCntx";
import SoxCntx from "./providers/SoxCntx";
import EthCntx from "./providers/EthCntx";
import App from "./components/App";
//
//
import "../src/styles/_gen/_index.scss";
//
//
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RootCntx>
            <SoxCntx>
                <EthCntx>
                    <App />
                </EthCntx>
            </SoxCntx>
        </RootCntx>
    </React.StrictMode>
);
