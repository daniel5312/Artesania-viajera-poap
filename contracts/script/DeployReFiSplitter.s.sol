// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BaseScript} from "./Base.s.sol";
import {ReFiSplitter} from "../src/ReFiSplitter.sol";
import {console} from "forge-std/console.sol";

contract DeployReFiSplitter is BaseScript {
    function run() external broadcast {
        // CONTRATO A (GoodCollective - El Carmen)
        address collectivePool = 0x0d43131f1577310D6349bAF9D6Da4fC1Cd39764C;
        ReFiSplitter splitterA = new ReFiSplitter(collectivePool);
        console.log("-----------------------------------------");
        console.log(
            "GoodCollective Splitter (A) deployed to:",
            address(splitterA)
        );
        console.log("Pool A:", collectivePool);

        // CONTRATO B (Tesorería Biota - Wallet propia)
        address treasuryPool = broadcaster; // Tu propia wallet
        ReFiSplitter splitterB = new ReFiSplitter(treasuryPool);
        console.log("-----------------------------------------");
        console.log("Treasury Splitter (B) deployed to:", address(splitterB));
        console.log("Pool B:", treasuryPool);
        console.log("-----------------------------------------");
        console.log(
            "NOTE: Copia estas dos direcciones en tu archivo .env.local"
        );
    }
}
