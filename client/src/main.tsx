//
//
import React from "react";
import ReactDOM from "react-dom/client";
import RootCntx from "./providers/RootCntx";
import SoxCntx from "./providers/SoxCntx";
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
                <App />
            </SoxCntx>
        </RootCntx>
    </React.StrictMode>
);
